/**
 * @fileoverview Security unit tests for Document APIs: ObjectId parameter validation,
 * PDF magic-byte verification, path traversal prevention, upload metadata constraints,
 * and ownership/access gating.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  documentIdParamSchema,
  uploadMetadataSchema,
} from '../../src/validators/documentValidators.js';
import { validate } from '../../src/middleware/validate.js';
import { verifyPdfMagicBytes } from '../../src/middleware/upload.js';
import { sanitizeOriginalFilename } from '../../src/utils/safeFilename.js';
import { resolveSafePath } from '../../src/services/fileStorageService.js';
import {
  getDocumentById,
  getDocumentPages,
  deleteDocument,
} from '../../src/services/documentService.js';
import { Document } from '../../src/models/Document.js';
import { IngestionJob } from '../../src/models/IngestionJob.js';
import { ApiError } from '../../src/utils/ApiError.js';
import { env } from '../../src/config/env.js';

describe('Document APIs & Upload Security Hardening', () => {
  describe('documentIdParamSchema & Parameter Validation Middleware', () => {
    it('accepts valid 24-character hex ObjectIds', () => {
      expect(documentIdParamSchema.safeParse({ id: '507f1f77bcf86cd799439011' }).success).toBe(
        true
      );
      expect(documentIdParamSchema.safeParse({ id: '65e1234567890abcdef12345' }).success).toBe(
        true
      );
    });

    it('rejects malformed ObjectIds (non-hex, short, long, empty)', () => {
      expect(documentIdParamSchema.safeParse({ id: 'invalid-id-string' }).success).toBe(false);
      expect(documentIdParamSchema.safeParse({ id: '507f1f77bcf86cd79943901' }).success).toBe(
        false
      ); // 23 chars
      expect(documentIdParamSchema.safeParse({ id: '507f1f77bcf86cd799439011a' }).success).toBe(
        false
      ); // 25 chars
      expect(documentIdParamSchema.safeParse({ id: '507f1f77bcf86cd79943901z' }).success).toBe(
        false
      ); // 'z'
      expect(documentIdParamSchema.safeParse({ id: '' }).success).toBe(false);
    });

    it('validate({ params }) rejects malformed :id with 400 VALIDATION_ERROR before controller execution', () => {
      const middleware = validate({ params: documentIdParamSchema });
      const req = { params: { id: 'malformed_id_123' } };
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

    it('validate({ params }) passes valid :id and attaches sanitized params to req', () => {
      const middleware = validate({ params: documentIdParamSchema });
      const req = { params: { id: '  507f1f77bcf86cd799439011  ' } };
      let nextCalled = false;

      middleware(req, {}, (err) => {
        if (!err) nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(req.params.id).toBe('507f1f77bcf86cd799439011');
    });
  });

  describe('PDF Magic-Byte Verification (verifyPdfMagicBytes)', () => {
    let testTempDir;

    beforeEach(async () => {
      testTempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'jansathi-test-'));
    });

    afterEach(async () => {
      if (fs.existsSync(testTempDir)) {
        await fs.promises.rm(testTempDir, { recursive: true, force: true }).catch(() => {});
      }
    });

    it('accepts file with valid %PDF- header and preserves the file on disk', async () => {
      const filePath = path.join(testTempDir, 'valid.pdf');
      await fs.promises.writeFile(filePath, '%PDF-1.4 valid test pdf content');

      await expect(verifyPdfMagicBytes(filePath)).resolves.toBeUndefined();
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('rejects plain text file disguised as PDF, throws 415, and immediately deletes temp file', async () => {
      const filePath = path.join(testTempDir, 'fake.pdf');
      await fs.promises.writeFile(filePath, 'Plain text content pretending to be a PDF');

      await expect(verifyPdfMagicBytes(filePath)).rejects.toThrow(ApiError);
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('rejects HTML/Script content, throws 415, and cleans up temp file', async () => {
      const filePath = path.join(testTempDir, 'xss.pdf');
      await fs.promises.writeFile(
        filePath,
        '<!DOCTYPE html><html><script>alert(1)</script></html>'
      );

      let capturedErr = null;
      try {
        await verifyPdfMagicBytes(filePath);
      } catch (err) {
        capturedErr = err;
      }

      expect(capturedErr).toBeInstanceOf(ApiError);
      expect(capturedErr.status).toBe(415);
      expect(capturedErr.code).toBe('UNSUPPORTED_MEDIA_TYPE');
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('rejects empty file (0 bytes), throws 415, and removes temp file', async () => {
      const filePath = path.join(testTempDir, 'empty.pdf');
      await fs.promises.writeFile(filePath, '');

      await expect(verifyPdfMagicBytes(filePath)).rejects.toThrow(ApiError);
      expect(fs.existsSync(filePath)).toBe(false);
    });
  });

  describe('Path Traversal Prevention', () => {
    it('sanitizeOriginalFilename strips directory traversal sequences', () => {
      expect(sanitizeOriginalFilename('../../etc/passwd')).toBe('passwd');
      expect(sanitizeOriginalFilename('..\\..\\windows\\system32\\cmd.exe')).toBe('cmd.exe');
      expect(sanitizeOriginalFilename('folder/subfolder/file.pdf')).toBe('file.pdf');
      expect(sanitizeOriginalFilename('')).toBe('document.pdf');
      expect(sanitizeOriginalFilename(null)).toBe('document.pdf');
    });

    it('resolveSafePath rejects path traversal sequences with 400 VALIDATION_ERROR', () => {
      expect(() => resolveSafePath('../../etc/shadow')).toThrow(ApiError);
      expect(() => resolveSafePath('..\\..\\boot.ini')).toThrow(ApiError);
      expect(() => resolveSafePath('')).toThrow(ApiError);
      expect(() => resolveSafePath(null)).toThrow(ApiError);
    });

    it('resolveSafePath accepts clean basename and guarantees path is inside STORAGE_DIR', () => {
      const safeBasename = '507f1f77bcf86cd799439011.pdf';
      const resolved = resolveSafePath(safeBasename);
      expect(resolved.startsWith(env.STORAGE_DIR)).toBe(true);
      expect(path.basename(resolved)).toBe(safeBasename);
    });
  });

  describe('Upload Metadata Schema Validation', () => {
    it('rejects publishedAt dates set in the future', () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString();
      const res = uploadMetadataSchema.safeParse({ publishedAt: tomorrow });
      expect(res.success).toBe(false);
      expect(res.error.issues[0].message).toContain('not in the future');
    });

    it('accepts past or present valid publishedAt dates', () => {
      const past = new Date(Date.now() - 86400000).toISOString();
      const res = uploadMetadataSchema.safeParse({ publishedAt: past });
      expect(res.success).toBe(true);
    });

    it('rejects unsupported docType and category values', () => {
      expect(uploadMetadataSchema.safeParse({ docType: 'invalid_type' }).success).toBe(false);
      expect(uploadMetadataSchema.safeParse({ category: 'invalid_category' }).success).toBe(false);
    });

    it('rejects sourceUrl with non-http/https protocol (e.g. javascript:, ftp:)', () => {
      expect(uploadMetadataSchema.safeParse({ sourceUrl: 'javascript:alert(1)' }).success).toBe(
        false
      );
      expect(
        uploadMetadataSchema.safeParse({ sourceUrl: 'ftp://files.gov.in/doc.pdf' }).success
      ).toBe(false);
      expect(
        uploadMetadataSchema.safeParse({ sourceUrl: 'https://india.gov.in/doc.pdf' }).success
      ).toBe(true);
    });
  });

  describe('Ownership & Scope Access Gating', () => {
    it('getDocumentById: citizen cannot access another citizen private document (throws 404 to prevent enumeration)', async () => {
      const mockDoc = {
        _id: '507f1f77bcf86cd799439011',
        visibility: 'private',
        uploadedBy: 'user_A_id',
      };
      const findByIdSpy = vi.spyOn(Document, 'findById').mockResolvedValue(mockDoc);

      const citizenB = { id: 'user_B_id', role: 'citizen' };
      await expect(getDocumentById('507f1f77bcf86cd799439011', citizenB)).rejects.toThrow(
        new ApiError(404, 'NOT_FOUND', 'Document not found')
      );

      findByIdSpy.mockRestore();
    });

    it('getDocumentById: admin inspecting citizen private document receives sanitized metadata without raw storedName', async () => {
      const mockDoc = {
        _id: '507f1f77bcf86cd799439011',
        id: '507f1f77bcf86cd799439011',
        title: 'Confidential Citizen Application',
        visibility: 'private',
        status: 'ready',
        uploadedBy: 'citizen_user_id',
        docType: 'other',
        category: 'other',
        language: 'en',
        storage: {
          storedName: 'internal_uuid_secret_path.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1024,
        },
        toJSON: () => ({ ...mockDoc }),
      };

      const findByIdSpy = vi.spyOn(Document, 'findById').mockResolvedValue(mockDoc);
      const findJobSpy = vi.spyOn(IngestionJob, 'findOne').mockReturnValue({
        sort: vi.fn().mockResolvedValue(null),
      });

      const adminUser = { id: 'admin_id', role: 'admin' };
      const result = await getDocumentById('507f1f77bcf86cd799439011', adminUser);

      findByIdSpy.mockRestore();
      findJobSpy.mockRestore();

      expect(result.document.title).toBe('Confidential Citizen Application');
      expect(result.document.storage.storedName).toBeUndefined();
      expect(result.document.storage.mimeType).toBe('application/pdf');
    });

    it('getDocumentPages: throws 409 CONFLICT if document is not in ready status', async () => {
      const mockDoc = {
        _id: '507f1f77bcf86cd799439011',
        status: 'processing',
        visibility: 'public',
      };
      const findByIdSpy = vi.spyOn(Document, 'findById').mockResolvedValue(mockDoc);

      const user = { id: 'user1', role: 'citizen' };
      await expect(getDocumentPages('507f1f77bcf86cd799439011', {}, user)).rejects.toThrow(
        new ApiError(
          409,
          'CONFLICT',
          'Document pages are not available until processing has completed (ready status)'
        )
      );

      findByIdSpy.mockRestore();
    });

    it('getDocumentPages: admin attempting to view citizen private document pages throws 403 FORBIDDEN', async () => {
      const mockDoc = {
        _id: '507f1f77bcf86cd799439011',
        status: 'ready',
        visibility: 'private',
        uploadedBy: 'citizen_owner_id',
      };
      const findByIdSpy = vi.spyOn(Document, 'findById').mockResolvedValue(mockDoc);

      const adminUser = { id: 'admin_id', role: 'admin' };
      await expect(getDocumentPages('507f1f77bcf86cd799439011', {}, adminUser)).rejects.toThrow(
        new ApiError(
          403,
          'FORBIDDEN',
          'Administrators are not permitted to inspect citizen private document pages'
        )
      );

      findByIdSpy.mockRestore();
    });

    it('deleteDocument: citizen attempting to delete public document throws 403 FORBIDDEN', async () => {
      const mockDoc = {
        _id: '507f1f77bcf86cd799439011',
        visibility: 'public',
        uploadedBy: 'admin_id',
      };
      const findByIdSpy = vi.spyOn(Document, 'findById').mockResolvedValue(mockDoc);

      const citizen = { id: 'citizen1', role: 'citizen' };
      await expect(deleteDocument('507f1f77bcf86cd799439011', citizen)).rejects.toThrow(
        new ApiError(403, 'FORBIDDEN', 'Citizens cannot delete public documents')
      );

      findByIdSpy.mockRestore();
    });

    it('deleteDocument: citizen attempting to delete another citizen private document throws 404', async () => {
      const mockDoc = {
        _id: '507f1f77bcf86cd799439011',
        visibility: 'private',
        uploadedBy: 'citizen_owner_id',
      };
      const findByIdSpy = vi.spyOn(Document, 'findById').mockResolvedValue(mockDoc);

      const anotherCitizen = { id: 'other_citizen_id', role: 'citizen' };
      await expect(deleteDocument('507f1f77bcf86cd799439011', anotherCitizen)).rejects.toThrow(
        new ApiError(404, 'NOT_FOUND', 'Document not found')
      );

      findByIdSpy.mockRestore();
    });
  });
});
