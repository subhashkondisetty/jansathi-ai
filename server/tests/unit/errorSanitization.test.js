/**
 * @fileoverview Security unit tests for error sanitization, data masking, CORS policy,
 * and rate limiter response formatting.
 */

import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { corsMiddleware } from '../../src/middleware/security.js';
import { ApiError } from '../../src/utils/ApiError.js';
import { env } from '../../src/config/env.js';

describe('Error Sanitization & Security Middleware Hardening', () => {
  describe('errorHandler data masking and privacy protection', () => {
    it('CastError masks raw user input and outputs generic validation details', () => {
      let statusCode = null;
      let jsonPayload = null;
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
        path: 'documentId',
        value: 'sensitive_input_payload_12345',
      };

      const req = {
        id: 'req_cast_test',
        originalUrl: '/api/documents/sensitive_input_payload_12345',
      };
      errorHandler(castError, req, res, () => {});

      expect(statusCode).toBe(400);
      expect(jsonPayload.success).toBe(false);
      expect(jsonPayload.error.code).toBe('VALIDATION_ERROR');
      expect(jsonPayload.error.message).toBe('Invalid identifier or parameter format');
      expect(jsonPayload.error.details).toEqual([
        {
          field: 'documentId',
          message: 'Invalid value for field documentId',
        },
      ]);
      // Verify raw sensitive value is never echoed back in the response envelope
      expect(JSON.stringify(jsonPayload)).not.toContain('sensitive_input_payload_12345');
    });

    it('MongoDB 11000 duplicate key error masks keyValue and citizen email', () => {
      let statusCode = null;
      let jsonPayload = null;
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
        keyValue: { email: 'classified.citizen@gov.in' },
      };

      const req = { id: 'req_dup_test' };
      errorHandler(duplicateError, req, res, () => {});

      expect(statusCode).toBe(409);
      expect(jsonPayload.success).toBe(false);
      expect(jsonPayload.error.code).toBe('CONFLICT');
      expect(jsonPayload.error.message).toBe('A record with this value already exists');
      expect(jsonPayload.error.details).toBeUndefined();
      expect(JSON.stringify(jsonPayload)).not.toContain('classified.citizen@gov.in');
    });

    it('masks internal 500 server error details when in production environment', () => {
      const originalEnv = env.NODE_ENV;
      env.NODE_ENV = 'production';

      let statusCode = null;
      let jsonPayload = null;
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

      const internalError = new Error(
        'Database connection failed: mongodb://admin:secretPass@internal:27017'
      );
      internalError.details = { rawQuery: 'SELECT * FROM secrets' };

      const req = { id: 'req_prod_500', method: 'GET', originalUrl: '/api/users/profile' };
      errorHandler(internalError, req, res, () => {});

      env.NODE_ENV = originalEnv;

      expect(statusCode).toBe(500);
      expect(jsonPayload.success).toBe(false);
      expect(jsonPayload.error.code).toBe('INTERNAL_ERROR');
      expect(jsonPayload.error.message).toBe('Internal server error');
      expect(jsonPayload.error.details).toBeUndefined();
      expect(JSON.stringify(jsonPayload)).not.toContain('secretPass');
      expect(JSON.stringify(jsonPayload)).not.toContain('SELECT * FROM');
    });

    it('preserves explicit 501 NOT_IMPLEMENTED contract message while dropping internal details', () => {
      let statusCode = null;
      let jsonPayload = null;
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

      const notImplementedErr = new ApiError(
        501,
        'NOT_IMPLEMENTED',
        'AI Assistant capabilities are scheduled for a future milestone',
        { internalDebugHint: 'rag pipeline not loaded' }
      );

      const req = { id: 'req_501_test' };
      errorHandler(notImplementedErr, req, res, () => {});

      expect(statusCode).toBe(501);
      expect(jsonPayload.success).toBe(false);
      expect(jsonPayload.error.code).toBe('NOT_IMPLEMENTED');
      expect(jsonPayload.error.message).toBe(
        'AI Assistant capabilities are scheduled for a future milestone'
      );
      expect(jsonPayload.error.details).toBeUndefined();
    });

    it('handles malformed JSON body parse SyntaxError with 400 VALIDATION_ERROR', () => {
      let statusCode = null;
      let jsonPayload = null;
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

      const syntaxErr = new SyntaxError('Unexpected token } in JSON at position 12');
      syntaxErr.status = 400;
      syntaxErr.body = '{"bad": }';

      const req = { id: 'req_syntax_test' };
      errorHandler(syntaxErr, req, res, () => {});

      expect(statusCode).toBe(400);
      expect(jsonPayload.success).toBe(false);
      expect(jsonPayload.error.code).toBe('VALIDATION_ERROR');
      expect(jsonPayload.error.message).toBe('Malformed JSON payload');
    });
  });

  describe('CORS Policy Security Enforcement', () => {
    it('allows browser requests from configured CLIENT_ORIGIN', () => {
      const allowedOrigin = env.CLIENT_ORIGIN.split(',')[0].trim();
      const req = {
        headers: { origin: allowedOrigin },
        method: 'GET',
      };
      let nextCalled = false;
      const res = {
        setHeader: vi.fn(),
        getHeader: vi.fn(),
      };

      corsMiddleware(req, res, (err) => {
        if (!err) nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });

    it('blocks browser requests from unauthorized origins with 403 FORBIDDEN', () => {
      const req = {
        headers: { origin: 'http://malicious-attacker-domain.org' },
        method: 'GET',
      };
      let capturedErr = null;
      const res = {
        setHeader: vi.fn(),
        getHeader: vi.fn(),
      };

      corsMiddleware(req, res, (err) => {
        capturedErr = err;
      });

      expect(capturedErr).toBeInstanceOf(ApiError);
      expect(capturedErr.status).toBe(403);
      expect(capturedErr.code).toBe('FORBIDDEN');
      expect(capturedErr.message).toContain('blocked by policy');
    });

    it('permits server-to-server or CLI requests without an Origin header', () => {
      const req = {
        headers: {}, // No Origin header (curl, mobile, backend server)
        method: 'GET',
      };
      let nextCalled = false;
      const res = {
        setHeader: vi.fn(),
        getHeader: vi.fn(),
      };

      corsMiddleware(req, res, (err) => {
        if (!err) nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });
  });
});
