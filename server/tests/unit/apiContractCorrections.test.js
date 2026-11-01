import { describe, it, expect } from 'vitest';
import { sendPaginated } from '../../src/utils/response.js';
import { validate } from '../../src/middleware/validate.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { envSchema } from '../../src/config/env.js';
import { isHealthCheckRequest } from '../../src/middleware/rateLimiters.js';
import { uploadPdf } from '../../src/middleware/upload.js';
import { z } from 'zod';

describe('Phase 7 API Contract Corrections', () => {
  describe('sendPaginated - totalPages on empty results', () => {
    it('returns totalPages: 0 when total is 0', () => {
      let jsonPayload = null;
      let statusCode = null;

      const res = {
        status: (code) => {
          statusCode = code;
          return res;
        },
        json: (payload) => {
          jsonPayload = payload;
          return payload;
        },
      };

      sendPaginated(res, [], { page: 1, limit: 20, total: 0 });

      expect(statusCode).toBe(200);
      expect(jsonPayload).toEqual({
        success: true,
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it('returns correct totalPages when total > 0', () => {
      let jsonPayload = null;
      const res = {
        status: () => res,
        json: (payload) => {
          jsonPayload = payload;
          return payload;
        },
      };

      sendPaginated(res, [{ id: 1 }], { page: 1, limit: 20, total: 45 });

      expect(jsonPayload.meta.totalPages).toBe(3);
      expect(jsonPayload.meta.total).toBe(45);
    });
  });

  describe('Validation error details format { field, message }', () => {
    it('formats Zod validation error details as [{ field, message }]', () => {
      const schema = z.object({
        q: z.string().min(2, 'Must be at least 2 chars'),
      });

      const middleware = validate({ query: schema });
      const req = { query: { q: 'a' } };
      let capturedError = null;
      const next = (err) => {
        capturedError = err;
      };

      middleware(req, {}, next);

      expect(capturedError).toBeDefined();
      expect(capturedError.code).toBe('VALIDATION_ERROR');
      expect(capturedError.details).toEqual([
        {
          field: 'q',
          message: 'Must be at least 2 chars',
        },
      ]);
    });

    it('errorHandler outputs [{ field, message }] in JSON error envelope', () => {
      let jsonPayload = null;
      let statusCode = null;

      const res = {
        status: (code) => {
          statusCode = code;
          return res;
        },
        json: (payload) => {
          jsonPayload = payload;
          return payload;
        },
      };

      const zodError = new z.ZodError([
        {
          code: z.ZodIssueCode.too_small,
          minimum: 3,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'Question must be at least 3 characters',
          path: ['question'],
        },
      ]);

      const req = { id: 'test-req-id' };
      errorHandler(zodError, req, res, () => {});

      expect(statusCode).toBe(400);
      expect(jsonPayload.success).toBe(false);
      expect(jsonPayload.error.code).toBe('VALIDATION_ERROR');
      expect(jsonPayload.error.details).toEqual([
        {
          field: 'question',
          message: 'Question must be at least 3 characters',
        },
      ]);
      expect(jsonPayload.error.details[0].path).toBeUndefined();
    });

    it('errorHandler masks CastError err.value and returns fixed message', () => {
      let jsonPayload = null;
      let statusCode = null;

      const res = {
        status: (code) => {
          statusCode = code;
          return res;
        },
        json: (payload) => {
          jsonPayload = payload;
          return payload;
        },
      };

      const castError = {
        name: 'CastError',
        path: 'id',
        value: 'malformed_value_123',
      };

      const req = { id: 'test-cast-req' };
      errorHandler(castError, req, res, () => {});

      expect(statusCode).toBe(400);
      expect(jsonPayload.success).toBe(false);
      expect(jsonPayload.error.code).toBe('VALIDATION_ERROR');
      expect(jsonPayload.error.message).toBe('Invalid identifier or parameter format');
      expect(jsonPayload.error.message).not.toContain('malformed_value_123');
      expect(jsonPayload.error.details).toEqual([
        {
          field: 'id',
          message: 'Invalid value for field id',
        },
      ]);
    });

    it('errorHandler returns generic 409 CONFLICT without leaking keyValue on E11000', () => {
      let jsonPayload = null;
      let statusCode = null;

      const res = {
        status: (code) => {
          statusCode = code;
          return res;
        },
        json: (payload) => {
          jsonPayload = payload;
          return payload;
        },
      };

      const duplicateError = {
        code: 11000,
        keyValue: { email: 'secret_citizen@example.com' },
      };

      const req = { id: 'test-dup-req' };
      errorHandler(duplicateError, req, res, () => {});

      expect(statusCode).toBe(409);
      expect(jsonPayload.success).toBe(false);
      expect(jsonPayload.error.code).toBe('CONFLICT');
      expect(jsonPayload.error.message).toBe('A record with this value already exists');
      expect(jsonPayload.error.details).toBeUndefined();
      expect(JSON.stringify(jsonPayload)).not.toContain('secret_citizen@example.com');
    });
  });

  describe('Security Audit Regression - Environment Configuration (envSchema)', () => {
    it('fails when JWT_SECRET is shorter than 32 characters', () => {
      const result = envSchema.safeParse({
        JWT_SECRET: 'short-secret-only-25-chars!',
      });

      expect(result.success).toBe(false);
      const secretIssue = result.error.issues.find((i) => i.path.includes('JWT_SECRET'));
      expect(secretIssue).toBeDefined();
    });

    it('passes when JWT_SECRET is at least 32 characters', () => {
      const validSecret = 'a'.repeat(32);
      const result = envSchema.safeParse({
        JWT_SECRET: validSecret,
      });

      expect(result.success).toBe(true);
      expect(result.data.JWT_SECRET).toBe(validSecret);
    });

    it('fails in production mode when MONGODB_URI is omitted', () => {
      const result = envSchema.safeParse({
        NODE_ENV: 'production',
        JWT_SECRET: 'a'.repeat(32),
      });

      expect(result.success).toBe(false);
      const uriIssue = result.error.issues.find((i) => i.path.includes('MONGODB_URI'));
      expect(uriIssue).toBeDefined();
      expect(uriIssue.message).toContain('required in production mode');
    });

    it('rejects known development JWT secret in production mode', () => {
      const result = envSchema.safeParse({
        NODE_ENV: 'production',
        MONGODB_URI: 'mongodb+srv://user:pass@cluster0.abcde.mongodb.net/jansathi',
        JWT_SECRET: 'jansathi-development-secret-jwt-key-2026',
      });

      expect(result.success).toBe(false);
      const secretIssue = result.error.issues.find((i) => i.path.includes('JWT_SECRET'));
      expect(secretIssue).toBeDefined();
      expect(secretIssue.message).toContain('Default development JWT_SECRET cannot be used');
    });

    it('rejects localhost MongoDB URIs in production mode', () => {
      const localhostUris = [
        'mongodb://localhost:27017/jansathi',
        'mongodb://127.0.0.1:27017/jansathi',
        'mongodb://0.0.0.0:27017/jansathi',
        'mongodb://[::1]:27017/jansathi',
      ];

      for (const uri of localhostUris) {
        const result = envSchema.safeParse({
          NODE_ENV: 'production',
          JWT_SECRET: 'a'.repeat(32),
          MONGODB_URI: uri,
        });

        expect(result.success).toBe(false);
        const uriIssue = result.error.issues.find((i) => i.path.includes('MONGODB_URI'));
        expect(uriIssue).toBeDefined();
        expect(uriIssue.message).toContain('cannot point to localhost');
      }
    });

    it('accepts remote cluster MongoDB Atlas URIs in production mode', () => {
      const result = envSchema.safeParse({
        NODE_ENV: 'production',
        JWT_SECRET: 'a'.repeat(32),
        MONGODB_URI:
          'mongodb+srv://app_user:strong_password@cluster0.abcde.mongodb.net/jansathi?retryWrites=true',
      });

      expect(result.success).toBe(true);
      expect(result.data.NODE_ENV).toBe('production');
      expect(result.data.MONGODB_URI).toContain('cluster0.abcde.mongodb.net');
    });

    it('does not reject remote hosts whose credentials or subdomains contain localhost', () => {
      // Remote host with 'localhost' in the password
      const credResult = envSchema.safeParse({
        NODE_ENV: 'production',
        JWT_SECRET: 'a'.repeat(32),
        MONGODB_URI:
          'mongodb+srv://admin_user:secret-with-localhost@cluster0.abcde.mongodb.net/jansathi',
      });
      expect(credResult.success).toBe(true);

      // Legitimate external host containing localhost as subdomain
      const domainResult = envSchema.safeParse({
        NODE_ENV: 'production',
        JWT_SECRET: 'a'.repeat(32),
        MONGODB_URI: 'mongodb://localhost.mycompany.org:27017/jansathi',
      });
      expect(domainResult.success).toBe(true);
    });

    it('preserves development defaults when MONGODB_URI and JWT_SECRET are omitted', () => {
      const result = envSchema.safeParse({
        NODE_ENV: 'development',
      });

      expect(result.success).toBe(true);
      expect(result.data.NODE_ENV).toBe('development');
      expect(result.data.MONGODB_URI).toBe('mongodb://127.0.0.1:27017/jansathi');
      expect(result.data.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
    });
  });

  describe('Security Audit Regression - Rate Limiter Health Probe Bypass', () => {
    it('identifies health check endpoints to skip rate limiting', () => {
      const healthRequests = [
        { originalUrl: '/api/health' },
        { originalUrl: '/api/health/ready' },
        { originalUrl: '/api/health/status' },
        { originalUrl: '/api/health/ready?probe=1' },
        { url: '/api/health' },
        { path: '/health' },
        { path: '/api/health/ready' },
      ];

      for (const req of healthRequests) {
        expect(isHealthCheckRequest(req)).toBe(true);
      }
    });

    it('does NOT skip health-prefixed false positives such as /api/health-test or /api/healthcare', () => {
      const falsePositiveRequests = [
        { originalUrl: '/api/health-test' },
        { originalUrl: '/api/healthcare' },
        { originalUrl: '/api/health_check_custom' },
        { url: '/api/health-test' },
        { path: '/health-test' },
      ];

      for (const req of falsePositiveRequests) {
        expect(isHealthCheckRequest(req)).toBe(false);
      }
    });

    it('does not skip ordinary API endpoints, keeping them rate limited', () => {
      const standardRequests = [
        { originalUrl: '/api/search?q=pension' },
        { originalUrl: '/api/documents' },
        { originalUrl: '/api/documents/upload' },
        { originalUrl: '/api/users/profile' },
        { originalUrl: '/api/auth/login' },
        { originalUrl: '/api/auth/register' },
        { originalUrl: '/api/admin/sources' },
        { originalUrl: '/api/admin/session' },
        { originalUrl: '/api/history' },
        { originalUrl: '/api/ai/ask' },
      ];

      for (const req of standardRequests) {
        expect(isHealthCheckRequest(req)).toBe(false);
      }
    });
  });

  describe('Security Audit Regression - Upload Middleware Error Format & Security', () => {
    it('returns standardized [{ field: "file", message: "No file uploaded" }] when file is missing', () => {
      let capturedError = null;

      const req = {
        headers: { 'content-type': 'multipart/form-data; boundary=---test' },
      };
      const res = {};
      const next = (err) => {
        capturedError = err;
      };

      uploadPdf(req, res, next);

      expect(capturedError).toBeDefined();
      expect(capturedError.status).toBe(400);
      expect(capturedError.code).toBe('VALIDATION_ERROR');
      expect(capturedError.details).toEqual([
        {
          field: 'file',
          message: 'No file uploaded',
        },
      ]);
    });
  });
});
