/**
 * @fileoverview Security unit tests for Admin Operations: sourceId parameter validation,
 * IngestionJob retry status gating, inactive source triggering, and deep SSRF defenses.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sourceIdParamSchema, sourceUrlSchema } from '../../src/validators/sourceValidators.js';
import { validate } from '../../src/middleware/validate.js';
import { retryIngestionJob } from '../../src/controllers/ingestionController.js';
import { triggerSourceIngest } from '../../src/controllers/sourceController.js';
import * as sourceService from '../../src/services/sourceService.js';
import * as ingestionQueueService from '../../src/services/ingestionQueueService.js';
import { IngestionJob } from '../../src/models/IngestionJob.js';
import { Document } from '../../src/models/Document.js';
import { AuditLog } from '../../src/models/AuditLog.js';
import { ApiError } from '../../src/utils/ApiError.js';
import { isDisallowedIp, createSafeLookup } from '../../src/services/fetchService.js';

const ADMIN_USER_ID = '507f1f77bcf86cd799439011';

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

describe('Admin Operations & Deep SSRF Hardening', () => {
  beforeEach(() => {
    vi.spyOn(AuditLog, 'create').mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sourceIdParamSchema & Parameter Validation Middleware', () => {
    it('accepts valid 24-character hex ObjectIds', () => {
      expect(sourceIdParamSchema.safeParse({ id: '507f1f77bcf86cd799439011' }).success).toBe(true);
      expect(sourceIdParamSchema.safeParse({ id: '65e1234567890abcdef12345' }).success).toBe(true);
    });

    it('rejects malformed ObjectIds with VALIDATION_ERROR', () => {
      expect(sourceIdParamSchema.safeParse({ id: 'not-an-id' }).success).toBe(false);
      expect(sourceIdParamSchema.safeParse({ id: '507f1f77bcf86cd79943901' }).success).toBe(false);
      expect(sourceIdParamSchema.safeParse({ id: '507f1f77bcf86cd799439011z' }).success).toBe(
        false
      );
      expect(sourceIdParamSchema.safeParse({ id: '' }).success).toBe(false);
    });

    it('validate({ params: sourceIdParamSchema }) blocks invalid :id before controller runs', () => {
      const middleware = validate({ params: sourceIdParamSchema });
      const req = { params: { id: 'invalid_source_id' } };
      let capturedErr = null;

      middleware(req, {}, (err) => {
        capturedErr = err;
      });

      expect(capturedErr).toBeInstanceOf(ApiError);
      expect(capturedErr.status).toBe(400);
      expect(capturedErr.code).toBe('VALIDATION_ERROR');
      expect(capturedErr.details).toEqual([
        {
          field: 'id',
          message: 'Invalid MongoDB ObjectId format',
        },
      ]);
    });
  });

  describe('Ingestion Job Retry Gating (retryIngestionJob)', () => {
    it('allows retry for failed jobs: resets status to queued, stage to queued, and resets attempts to 0', async () => {
      const mockJob = {
        _id: '507f1f77bcf86cd799439011',
        id: '507f1f77bcf86cd799439011',
        status: 'failed',
        stage: 'failed',
        attempts: 3,
        manualRetries: 0,
        documentId: '65e1234567890abcdef12345',
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(IngestionJob, 'findById').mockResolvedValue(mockJob);
      const updateDocSpy = vi.spyOn(Document, 'updateOne').mockResolvedValue({ modifiedCount: 1 });

      const req = {
        params: { id: '507f1f77bcf86cd799439011' },
        user: { id: ADMIN_USER_ID, role: 'admin' },
        id: 'req_test_1',
      };

      const result = await runController(retryIngestionJob, req);

      expect(mockJob.status).toBe('queued');
      expect(mockJob.stage).toBe('queued');
      expect(mockJob.attempts).toBe(0);
      expect(mockJob.manualRetries).toBe(1);
      expect(mockJob.save).toHaveBeenCalled();
      expect(updateDocSpy).toHaveBeenCalledWith(
        { _id: '65e1234567890abcdef12345' },
        { $set: { status: 'pending' }, $unset: { failure: 1 } }
      );
      expect(result.data.success).toBe(true);
    });

    it('rejects manual retry for running job with 409 CONFLICT without modifying job state', async () => {
      const mockJob = {
        _id: '507f1f77bcf86cd799439011',
        status: 'running',
        attempts: 1,
        save: vi.fn(),
      };

      vi.spyOn(IngestionJob, 'findById').mockResolvedValue(mockJob);
      const req = {
        params: { id: '507f1f77bcf86cd799439011' },
        user: { id: ADMIN_USER_ID, role: 'admin' },
      };

      const result = await runController(retryIngestionJob, req);

      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.statusCode).toBe(409);
      expect(result.error.code).toBe('CONFLICT');
      expect(result.error.message).toBe('Only failed jobs can be manually retried');
      expect(mockJob.save).not.toHaveBeenCalled();
    });

    it('rejects manual retry for succeeded job with 409 CONFLICT', async () => {
      const mockJob = {
        _id: '507f1f77bcf86cd799439011',
        status: 'succeeded',
        save: vi.fn(),
      };

      vi.spyOn(IngestionJob, 'findById').mockResolvedValue(mockJob);
      const req = {
        params: { id: '507f1f77bcf86cd799439011' },
        user: { id: ADMIN_USER_ID, role: 'admin' },
      };

      const result = await runController(retryIngestionJob, req);

      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.statusCode).toBe(409);
      expect(result.error.code).toBe('CONFLICT');
      expect(mockJob.save).not.toHaveBeenCalled();
    });

    it('throws 404 NOT_FOUND when job ID does not exist', async () => {
      vi.spyOn(IngestionJob, 'findById').mockResolvedValue(null);
      const req = {
        params: { id: '507f1f77bcf86cd799439011' },
        user: { id: ADMIN_USER_ID, role: 'admin' },
      };

      const result = await runController(retryIngestionJob, req);

      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.statusCode).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Inactive Source Ingestion Gating (triggerSourceIngest)', () => {
    it('blocks ingestion on inactive source with 400 VALIDATION_ERROR', async () => {
      const mockSource = {
        id: '507f1f77bcf86cd799439011',
        name: 'Inactive Source Portal',
        isActive: false,
      };
      vi.spyOn(sourceService, 'getSourceById').mockResolvedValue(mockSource);

      const req = {
        params: { id: '507f1f77bcf86cd799439011' },
        user: { id: ADMIN_USER_ID, role: 'admin' },
      };
      const result = await runController(triggerSourceIngest, req);

      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.statusCode).toBe(400);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Cannot trigger ingestion for an inactive source');
    });

    it('allows ingestion on active source and returns 202 ACCEPTED', async () => {
      const mockSource = {
        id: '507f1f77bcf86cd799439011',
        name: 'Official Schemes Gazette',
        isActive: true,
      };
      const mockJob = { id: 'job_123', status: 'queued' };

      vi.spyOn(sourceService, 'getSourceById').mockResolvedValue(mockSource);
      vi.spyOn(ingestionQueueService, 'createJobForSource').mockResolvedValue(mockJob);

      const req = {
        params: { id: '507f1f77bcf86cd799439011' },
        user: { id: ADMIN_USER_ID, role: 'admin' },
        id: 'req_trigger_1',
      };

      const result = await runController(triggerSourceIngest, req);

      expect(result.statusCode).toBe(202);
      expect(result.data.data.job).toEqual(mockJob);
    });
  });

  describe('Deep SSRF Defense: Schema & Network Resolution', () => {
    it('sourceUrlSchema rejects localhost, 127.0.0.1, 0.0.0.0, and [::1]', () => {
      expect(sourceUrlSchema.safeParse('http://localhost:5000/schemes').success).toBe(false);
      expect(sourceUrlSchema.safeParse('http://127.0.0.1:8080/schemes').success).toBe(false);
      expect(sourceUrlSchema.safeParse('http://0.0.0.0/schemes').success).toBe(false);
      expect(sourceUrlSchema.safeParse('http://[::1]/schemes').success).toBe(false);
    });

    it('sourceUrlSchema rejects cloud metadata endpoints', () => {
      expect(sourceUrlSchema.safeParse('http://169.254.169.254/latest/meta-data/').success).toBe(
        false
      );
      expect(
        sourceUrlSchema.safeParse('http://metadata.google.internal/computeMetadata/v1/').success
      ).toBe(false);
      expect(sourceUrlSchema.safeParse('http://instance-data/latest/meta-data/').success).toBe(
        false
      );
    });

    it('sourceUrlSchema rejects private IPv4 ranges (Class A, B, C, Carrier-grade NAT, Multicast)', () => {
      expect(sourceUrlSchema.safeParse('http://10.0.0.1/schemes').success).toBe(false);
      expect(sourceUrlSchema.safeParse('http://172.16.0.1/schemes').success).toBe(false);
      expect(sourceUrlSchema.safeParse('http://172.31.255.255/schemes').success).toBe(false);
      expect(sourceUrlSchema.safeParse('http://192.168.1.1/schemes').success).toBe(false);
      expect(sourceUrlSchema.safeParse('http://100.64.0.1/schemes').success).toBe(false);
      expect(sourceUrlSchema.safeParse('http://224.0.0.1/schemes').success).toBe(false);
      expect(sourceUrlSchema.safeParse('http://240.0.0.1/schemes').success).toBe(false);
    });

    it('sourceUrlSchema rejects IPv4-mapped IPv6 and link-local IPv6 addresses', () => {
      expect(sourceUrlSchema.safeParse('http://[::ffff:127.0.0.1]/schemes').success).toBe(false);
      expect(sourceUrlSchema.safeParse('http://[fe80::1]/schemes').success).toBe(false);
      expect(sourceUrlSchema.safeParse('http://[fc00::1]/schemes').success).toBe(false);
    });

    it('sourceUrlSchema rejects embedded credentials', () => {
      const res = sourceUrlSchema.safeParse('http://admin:secret@india.gov.in/schemes');
      expect(res.success).toBe(false);
      expect(res.error.issues[0].message).toContain('embedded credentials');
    });

    it('sourceUrlSchema rejects non-HTTP/HTTPS schemes', () => {
      expect(sourceUrlSchema.safeParse('ftp://india.gov.in/schemes').success).toBe(false);
      expect(sourceUrlSchema.safeParse('file:///etc/passwd').success).toBe(false);
      expect(sourceUrlSchema.safeParse('javascript:alert(1)').success).toBe(false);
    });

    it('sourceUrlSchema accepts legitimate sovereign public HTTPS URLs', () => {
      expect(sourceUrlSchema.safeParse('https://india.gov.in/schemes').success).toBe(true);
      expect(sourceUrlSchema.safeParse('https://myscheme.gov.in/schemes/pm-kisan').success).toBe(
        true
      );
      expect(
        sourceUrlSchema.safeParse('https://pib.gov.in/PressReleasePage.aspx?PRID=123456').success
      ).toBe(true);
    });

    it('isDisallowedIp accurately identifies private, loopback, link-local, and carrier NAT IPs', () => {
      expect(isDisallowedIp('127.0.0.1')).toBe(true);
      expect(isDisallowedIp('10.0.5.1')).toBe(true);
      expect(isDisallowedIp('172.20.0.1')).toBe(true);
      expect(isDisallowedIp('192.168.0.1')).toBe(true);
      expect(isDisallowedIp('169.254.169.254')).toBe(true);
      expect(isDisallowedIp('100.64.0.1')).toBe(true);
      expect(isDisallowedIp('::1')).toBe(true);
      expect(isDisallowedIp('fe80::1')).toBe(true);
      expect(isDisallowedIp('::ffff:192.168.1.1')).toBe(true);

      // Public routable IPs are allowed
      expect(isDisallowedIp('8.8.8.8')).toBe(false);
      expect(isDisallowedIp('1.1.1.1')).toBe(false);
      expect(isDisallowedIp('164.100.1.1')).toBe(false);
    });

    it('createSafeLookup blocks resolution if hostname resolves to private IP', () => {
      const safeLookup = createSafeLookup(isDisallowedIp);

      let capturedErr = null;
      safeLookup('localhost', {}, (err) => {
        capturedErr = err;
      });

      expect(capturedErr).toBeInstanceOf(ApiError);
      expect(capturedErr.code).toBe('SSRF_BLOCKED');
      expect(capturedErr.message).toContain('SSRF blocked');
    });
  });
});
