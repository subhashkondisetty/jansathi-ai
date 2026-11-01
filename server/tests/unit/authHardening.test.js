/**
 * @fileoverview Security unit tests for authentication, password/email validation,
 * JWT lifecycle, inactive user gating, and role-based authorization.
 */

import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  passwordSchema,
  emailSchema,
  registerSchema,
  loginSchema,
} from '../../src/validators/authValidators.js';
import { authenticate } from '../../src/middleware/auth.js';
import { requireRole } from '../../src/middleware/authorize.js';
import { ApiError } from '../../src/utils/ApiError.js';
import { env } from '../../src/config/env.js';
import { User } from '../../src/models/User.js';
import { signToken } from '../../src/services/authService.js';

const runAuthMiddleware = (req) =>
  new Promise((resolve) => {
    authenticate(req, {}, (err) => {
      resolve(err || null);
    });
  });

describe('Authentication & Authorization Hardening', () => {
  describe('passwordSchema security constraints', () => {
    it('accepts compliant passwords with letters and numbers (min 8, max 72 chars)', () => {
      expect(passwordSchema.safeParse('Password123').success).toBe(true);
      expect(passwordSchema.safeParse('Abcdefg1').success).toBe(true);
      expect(passwordSchema.safeParse('P@ssw0rd!#$').success).toBe(true);
      expect(passwordSchema.safeParse('A'.repeat(71) + '1').success).toBe(true);
    });

    it('rejects passwords shorter than 8 characters (boundary)', () => {
      const res = passwordSchema.safeParse('Pass12');
      expect(res.success).toBe(false);
      expect(res.error.issues[0].message).toContain('at least 8 characters');
    });

    it('rejects passwords exceeding 72 characters (boundary)', () => {
      const res = passwordSchema.safeParse('A'.repeat(72) + '1');
      expect(res.success).toBe(false);
      expect(res.error.issues[0].message).toContain('cannot exceed 72 characters');
    });

    it('rejects passwords without numbers', () => {
      const res = passwordSchema.safeParse('OnlyLettersHere');
      expect(res.success).toBe(false);
      expect(res.error.issues[0].message).toContain('at least one letter and one number');
    });

    it('rejects passwords without letters', () => {
      const res = passwordSchema.safeParse('1234567890');
      expect(res.success).toBe(false);
      expect(res.error.issues[0].message).toContain('at least one letter and one number');
    });

    it('rejects passwords with leading or trailing whitespace', () => {
      const leading = passwordSchema.safeParse(' Password123');
      expect(leading.success).toBe(false);
      expect(leading.error.issues[0].message).toContain('whitespace');

      const trailing = passwordSchema.safeParse('Password123 ');
      expect(trailing.success).toBe(false);
      expect(trailing.error.issues[0].message).toContain('whitespace');
    });
  });

  describe('emailSchema security constraints', () => {
    it('accepts valid email and normalizes to lowercase', () => {
      const res = emailSchema.safeParse('Citizen.User@Government.IN');
      expect(res.success).toBe(true);
      expect(res.data).toBe('citizen.user@government.in');
    });

    it('rejects malformed email formats', () => {
      expect(emailSchema.safeParse('not-an-email').success).toBe(false);
      expect(emailSchema.safeParse('citizen@').success).toBe(false);
      expect(emailSchema.safeParse('@domain.com').success).toBe(false);
      expect(emailSchema.safeParse('citizen user@domain.com').success).toBe(false);
    });

    it('rejects email exceeding 254 characters', () => {
      const longEmail = 'a'.repeat(250) + '@gov.in';
      const res = emailSchema.safeParse(longEmail);
      expect(res.success).toBe(false);
      expect(res.error.issues[0].message).toContain('cannot exceed 254 characters');
    });
  });

  describe('Registration and Login schema mass-assignment protection', () => {
    it('registerSchema rejects unrecognized/mass-assignment properties (role, isActive)', () => {
      const payload = {
        name: 'Citizen Jane',
        email: 'citizen.jane@example.com',
        password: 'Password123',
        role: 'admin',
        isActive: false,
      };
      const res = registerSchema.safeParse(payload);
      expect(res.success).toBe(false);
      expect(res.error.issues.some((i) => i.message.includes('Unrecognized key'))).toBe(true);
    });

    it('loginSchema strictly requires email and password', () => {
      expect(loginSchema.safeParse({ password: 'Password123' }).success).toBe(false);
      expect(loginSchema.safeParse({ email: 'test@example.com' }).success).toBe(false);
      expect(loginSchema.safeParse({ email: 'test@example.com', password: '' }).success).toBe(
        false
      );
    });
  });

  describe('authenticate middleware JWT extraction and verification', () => {
    it('passes 401 UNAUTHENTICATED to next() when Authorization header is missing', async () => {
      const req = { headers: {} };
      const err = await runAuthMiddleware(req);
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(401);
      expect(err.code).toBe('UNAUTHENTICATED');
      expect(err.message).toBe('Authentication token required');
    });

    it('passes 401 UNAUTHENTICATED to next() when Authorization header is not Bearer', async () => {
      const req = { headers: { authorization: 'Basic dXNlcjpwYXNz' } };
      const err = await runAuthMiddleware(req);
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(401);
      expect(err.code).toBe('UNAUTHENTICATED');
      expect(err.message).toBe('Authentication token required');
    });

    it('passes 401 UNAUTHENTICATED to next() when token is empty whitespace', async () => {
      const req = { headers: { authorization: 'Bearer    ' } };
      const err = await runAuthMiddleware(req);
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(401);
      expect(err.code).toBe('UNAUTHENTICATED');
      expect(err.message).toBe('Authentication token missing');
    });

    it('passes 401 TOKEN_EXPIRED to next() when JWT has expired', async () => {
      const expiredToken = jwt.sign(
        { sub: '507f1f77bcf86cd799439011', role: 'citizen' },
        env.JWT_SECRET,
        { expiresIn: -10 }
      );
      const req = { headers: { authorization: `Bearer ${expiredToken}` } };
      const err = await runAuthMiddleware(req);
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(401);
      expect(err.code).toBe('TOKEN_EXPIRED');
      expect(err.message).toBe('Authentication token has expired');
    });

    it('passes 401 UNAUTHENTICATED to next() on invalid signature or forged token', async () => {
      const forgedToken = jwt.sign(
        { sub: '507f1f77bcf86cd799439011', role: 'admin' },
        'different-secret-key-that-does-not-match'
      );
      const req = { headers: { authorization: `Bearer ${forgedToken}` } };
      const err = await runAuthMiddleware(req);
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(401);
      expect(err.code).toBe('UNAUTHENTICATED');
      expect(err.message).toBe('Invalid or malformed authentication token');
    });

    it('passes 401 UNAUTHENTICATED to next() when user is not found in database', async () => {
      const validToken = signToken({ sub: '507f1f77bcf86cd799439011', role: 'citizen' });
      const req = { headers: { authorization: `Bearer ${validToken}` } };

      const findByIdSpy = vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      const err = await runAuthMiddleware(req);
      findByIdSpy.mockRestore();

      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(401);
      expect(err.code).toBe('UNAUTHENTICATED');
      expect(err.message).toBe('User account not found or inactive');
    });

    it('passes 401 UNAUTHENTICATED to next() when user account is inactive (isActive: false)', async () => {
      const validToken = signToken({ sub: '507f1f77bcf86cd799439011', role: 'citizen' });
      const req = { headers: { authorization: `Bearer ${validToken}` } };

      const findByIdSpy = vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({
          id: '507f1f77bcf86cd799439011',
          role: 'citizen',
          isActive: false,
        }),
      });

      const err = await runAuthMiddleware(req);
      findByIdSpy.mockRestore();

      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(401);
      expect(err.code).toBe('UNAUTHENTICATED');
      expect(err.message).toBe('User account not found or inactive');
    });

    it('hydrates req.user with sanitized identity and calls next() without error for active user', async () => {
      const validToken = signToken({ sub: '507f1f77bcf86cd799439011', role: 'citizen' });
      const req = { headers: { authorization: `Bearer ${validToken}` } };

      const findByIdSpy = vi.spyOn(User, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({
          id: '507f1f77bcf86cd799439011',
          role: 'citizen',
          preferredLanguage: 'hi',
          isActive: true,
          passwordHash: 'secret_hash_value',
        }),
      });

      const err = await runAuthMiddleware(req);
      findByIdSpy.mockRestore();

      expect(err).toBeNull();
      expect(req.user).toEqual({
        id: '507f1f77bcf86cd799439011',
        role: 'citizen',
        preferredLanguage: 'hi',
      });
      expect(req.user.passwordHash).toBeUndefined();
    });
  });

  describe('requireRole middleware authorization gating', () => {
    it('allows access when user role matches permitted role', () => {
      const req = { user: { id: 'admin1', role: 'admin' } };
      let nextCalled = false;
      const middleware = requireRole('admin');

      middleware(req, {}, () => {
        nextCalled = true;
      });
      expect(nextCalled).toBe(true);
    });

    it('blocks access with 403 FORBIDDEN when user role does not match permitted role', () => {
      const req = { user: { id: 'citizen1', role: 'citizen' } };
      let capturedErr = null;
      const middleware = requireRole('admin');

      middleware(req, {}, (err) => {
        capturedErr = err;
      });
      expect(capturedErr).toBeInstanceOf(ApiError);
      expect(capturedErr.status).toBe(403);
      expect(capturedErr.code).toBe('FORBIDDEN');
      expect(capturedErr.message).toBe('Insufficient permissions to access this resource');
    });

    it('blocks access with 403 FORBIDDEN when req.user is absent', () => {
      const req = {};
      let capturedErr = null;
      const middleware = requireRole('admin');

      middleware(req, {}, (err) => {
        capturedErr = err;
      });
      expect(capturedErr).toBeInstanceOf(ApiError);
      expect(capturedErr.status).toBe(403);
      expect(capturedErr.code).toBe('FORBIDDEN');
    });

    it('allows access if user has one of multiple permitted roles', () => {
      const req = { user: { id: 'staff1', role: 'admin' } };
      let nextCalled = false;
      const middleware = requireRole('staff', 'admin');

      middleware(req, {}, () => {
        nextCalled = true;
      });
      expect(nextCalled).toBe(true);
    });
  });
});
