/**
 * @fileoverview Security & contract unit tests for Health liveness/readiness probes,
 * rate limit health exemptions, and AI 501 NOT_IMPLEMENTED endpoint shells.
 */

import { describe, it, expect, vi } from 'vitest';
import { getHealth, getReadiness } from '../../src/controllers/healthController.js';
import { ask, checkEligibility, getStatus } from '../../src/controllers/aiController.js';
import { verifyClaim } from '../../src/controllers/verifyController.js';
import * as dbModule from '../../src/config/db.js';
import { isHealthCheckRequest } from '../../src/middleware/rateLimiters.js';
import { ApiError } from '../../src/utils/ApiError.js';
import { env } from '../../src/config/env.js';

const runController = (controller, req, resOverrides = {}) =>
  new Promise((resolve) => {
    let statusCode = 200;
    const mockRes = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        resolve({ statusCode, data, error: null });
        return this;
      },
      ...resOverrides,
    };
    controller(req, mockRes, (err) => {
      resolve({ statusCode: err?.status || 500, data: null, error: err });
    });
  });

describe('Health & AI Contracts Hardening', () => {
  describe('Liveness Probe (getHealth)', () => {
    it('returns HTTP 200 with service metadata, uptime, and connected status when DB ready', () => {
      vi.spyOn(dbModule, 'isDbReady').mockReturnValue(true);

      let statusCode = null;
      let resPayload = null;
      const res = {
        status: (code) => {
          statusCode = code;
          return res;
        },
        json: (payload) => {
          resPayload = payload;
          return payload;
        },
      };

      getHealth({}, res);

      expect(statusCode).toBe(200);
      expect(resPayload.success).toBe(true);
      expect(resPayload.data.status).toBe('ok');
      expect(resPayload.data.service).toBe('jansathi-ai-server');
      expect(resPayload.data.environment).toBe(env.NODE_ENV);
      expect(resPayload.data.database).toBe('connected');
      expect(typeof resPayload.data.uptimeSeconds).toBe('number');
      expect(resPayload.data.timestamp).toBeDefined();
    });

    it('returns HTTP 200 with disconnected database status when DB is down without crashing', () => {
      vi.spyOn(dbModule, 'isDbReady').mockReturnValue(false);

      let statusCode = null;
      let resPayload = null;
      const res = {
        status: (code) => {
          statusCode = code;
          return res;
        },
        json: (payload) => {
          resPayload = payload;
          return payload;
        },
      };

      getHealth({}, res);

      expect(statusCode).toBe(200);
      expect(resPayload.data.status).toBe('ok');
      expect(resPayload.data.database).toBe('disconnected');
    });
  });

  describe('Readiness Probe (getReadiness)', () => {
    it('returns HTTP 200 ready status when database is ready', () => {
      vi.spyOn(dbModule, 'isDbReady').mockReturnValue(true);

      let statusCode = null;
      let resPayload = null;
      const res = {
        status: (code) => {
          statusCode = code;
          return res;
        },
        json: (payload) => {
          resPayload = payload;
          return payload;
        },
      };

      getReadiness({}, res, () => {});

      expect(statusCode).toBe(200);
      expect(resPayload.success).toBe(true);
      expect(resPayload.data.status).toBe('ready');
      expect(resPayload.data.database).toBe('connected');
    });

    it('calls next() with 503 SERVICE_UNAVAILABLE when database is disconnected', () => {
      vi.spyOn(dbModule, 'isDbReady').mockReturnValue(false);

      let capturedErr = null;
      getReadiness({}, {}, (err) => {
        capturedErr = err;
      });

      expect(capturedErr).toBeInstanceOf(ApiError);
      expect(capturedErr.status).toBe(503);
      expect(capturedErr.code).toBe('SERVICE_UNAVAILABLE');
      expect(capturedErr.message).toBe('Database is not ready');
      expect(capturedErr.details).toEqual({ database: 'disconnected' });
    });
  });

  describe('Rate Limiter Health Probe Exemption (isHealthCheckRequest)', () => {
    it('bypasses rate limiters for legitimate liveness and readiness endpoints', () => {
      const allowedPaths = [
        { originalUrl: '/api/health' },
        { originalUrl: '/api/health/ready' },
        { originalUrl: '/api/health/status' },
        { originalUrl: '/api/health/ready?probe=k8s' },
        { path: '/health' },
        { path: '/health/ready' },
      ];

      for (const req of allowedPaths) {
        expect(isHealthCheckRequest(req)).toBe(true);
      }
    });

    it('does NOT bypass rate limits for prefix collision false positives', () => {
      const disallowedPaths = [
        { originalUrl: '/api/healthcare' },
        { originalUrl: '/api/health-check-fake' },
        { originalUrl: '/api/healthy' },
        { path: '/healthcare' },
      ];

      for (const req of disallowedPaths) {
        expect(isHealthCheckRequest(req)).toBe(false);
      }
    });

    it('does NOT bypass rate limits for normal API endpoints', () => {
      const standardPaths = [
        { originalUrl: '/api/documents' },
        { originalUrl: '/api/auth/login' },
        { originalUrl: '/api/search?q=pension' },
        { originalUrl: '/api/ai/ask' },
      ];

      for (const req of standardPaths) {
        expect(isHealthCheckRequest(req)).toBe(false);
      }
    });
  });

  describe('AI Endpoints 501 NOT_IMPLEMENTED Contracts', () => {
    it('POST /api/ai/ask throws 501 NOT_IMPLEMENTED with honest civic message', async () => {
      const req = {
        body: { question: 'What are the scheme rules?' },
        user: { id: 'user1', language: 'en' },
      };
      const result = await runController(ask, req);

      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.statusCode).toBe(501);
      expect(result.error.code).toBe('NOT_IMPLEMENTED');
      expect(result.error.message).toContain('ragService.answerQuestion is not implemented yet');
    });

    it('POST /api/ai/eligibility throws 501 NOT_IMPLEMENTED without fake percentages', async () => {
      const req = {
        body: { query: 'PM Kisan' },
        user: { id: 'user1', language: 'en' },
      };
      const result = await runController(checkEligibility, req);

      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.statusCode).toBe(501);
      expect(result.error.code).toBe('NOT_IMPLEMENTED');
      expect(result.error.message).toContain(
        'eligibilityService.checkEligibility is not implemented yet'
      );
    });

    it('POST /api/verify/claim throws 501 NOT_IMPLEMENTED without fabricated verdicts', async () => {
      const req = {
        body: { claim: 'Government pension increased to 10000' },
        user: { id: 'user1', language: 'en' },
      };
      const result = await runController(verifyClaim, req);

      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.statusCode).toBe(501);
      expect(result.error.code).toBe('NOT_IMPLEMENTED');
      expect(result.error.message).toContain(
        'verificationService.verifyClaim is not implemented yet'
      );
    });

    it('GET /api/ai/status returns transparent capability status showing AI features disabled', async () => {
      const result = await runController(getStatus, {});

      expect(result.statusCode).toBe(200);
      expect(result.data.success).toBe(true);
      expect(result.data.data.connected).toBe(false);
      expect(result.data.data.features).toEqual({
        ask: false,
        eligibility: false,
        verify: false,
      });
    });
  });
});
