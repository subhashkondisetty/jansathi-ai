import { describe, it, expect } from 'vitest';
import { sendPaginated } from '../../src/utils/response.js';
import { validate } from '../../src/middleware/validate.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
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
  });
});
