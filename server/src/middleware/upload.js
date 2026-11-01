/**
 * @fileoverview Multer upload middleware and magic-byte PDF validator.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { deleteTempFile, ensureStorageDirectories } from '../services/fileStorageService.js';

ensureStorageDirectories();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const tmpDir = path.join(env.STORAGE_DIR, 'tmp');
    cb(null, tmpDir);
  },
  filename: (_req, file, cb) => {
    const tempName = `tmp_${crypto.randomUUID()}${path.extname(file.originalname) || '.pdf'}`;
    cb(null, tempName);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  if (ext !== '.pdf' || (mime !== 'application/pdf' && mime !== 'application/x-pdf')) {
    return cb(
      new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Only PDF documents (.pdf) are supported'),
      false
    );
  }
  return cb(null, true);
};

const multerInstance = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024,
    files: 1,
  },
}).single('file');

/**
 * Express middleware processing multipart PDF uploads with safe error mapping.
 */
export const uploadPdf = (req, res, next) => {
  multerInstance(req, res, (err) => {
    if (err) {
      if (err instanceof ApiError) {
        return next(err);
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new ApiError(
            413,
            'PAYLOAD_TOO_LARGE',
            `Uploaded file exceeds maximum allowable size of ${env.MAX_UPLOAD_MB}MB`
          )
        );
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(
          new ApiError(
            400,
            'VALIDATION_ERROR',
            'Unexpected upload field or multiple files. File must be sent under the "file" field.'
          )
        );
      }
      if (err.name === 'MulterError') {
        return next(new ApiError(400, 'VALIDATION_ERROR', err.message));
      }
      return next(err);
    }

    if (!req.file) {
      return next(
        new ApiError(
          400,
          'VALIDATION_ERROR',
          'File is required. Send a single PDF in the "file" field.',
          [{ field: 'file', message: 'No file uploaded' }]
        )
      );
    }

    return next();
  });
};

/**
 * Verifies that the temporary file on disk contains the '%PDF-' magic bytes within its first 1024 bytes.
 * If invalid, automatically deletes the temporary file and throws ApiError(415).
 *
 * @param {string} tempPath - Absolute path to the uploaded file in temp storage.
 * @returns {Promise<void>}
 * @throws {ApiError} 415 If magic bytes are absent.
 */
export const verifyPdfMagicBytes = async (tempPath) => {
  let fd;
  try {
    fd = await fs.promises.open(tempPath, 'r');
    const buffer = Buffer.alloc(1024);
    const { bytesRead } = await fd.read(buffer, 0, 1024, 0);

    const header = buffer.toString('utf8', 0, bytesRead);
    if (!header.includes('%PDF-')) {
      await fd.close();
      fd = null;
      await deleteTempFile(tempPath);
      throw new ApiError(
        415,
        'UNSUPPORTED_MEDIA_TYPE',
        'File content is not a valid PDF document (%PDF- header missing)'
      );
    }
  } catch (err) {
    if (fd) {
      await fd.close().catch(() => {});
    }
    await deleteTempFile(tempPath);
    if (err instanceof ApiError) throw err;
    throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Failed to read uploaded PDF header');
  } finally {
    if (fd) {
      await fd.close().catch(() => {});
    }
  }
};
