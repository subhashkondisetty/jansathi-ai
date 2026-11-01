/**
 * @fileoverview File storage service managing filesystem storage, path verification, and lifecycle.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Ensures that both the base upload directory and temporary staging directory exist.
 */
export const ensureStorageDirectories = () => {
  const baseDir = env.STORAGE_DIR;
  const tmpDir = path.join(baseDir, 'tmp');

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
};

/**
 * Resolves a stored filename to an absolute filesystem path and guarantees it remains inside STORAGE_DIR.
 *
 * @param {string} storedName - Stored filename (UUID.pdf).
 * @returns {string} Safe absolute path.
 * @throws {ApiError} 400 If path traversal is detected.
 */
export const resolveSafePath = (storedName) => {
  if (!storedName || typeof storedName !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid file identifier');
  }

  if (storedName.includes('/') || storedName.includes('\\') || storedName.includes('..')) {
    logger.warn({ storedName }, 'Path traversal attempt detected in resolveSafePath');
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid file path traversal');
  }

  const safeBasename = path.basename(storedName);
  const resolvedPath = path.resolve(env.STORAGE_DIR, safeBasename);

  if (!resolvedPath.startsWith(env.STORAGE_DIR)) {
    logger.warn({ storedName, resolvedPath }, 'Path traversal attempt detected in resolveSafePath');
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid file path traversal');
  }

  return resolvedPath;
};

/**
 * Moves a verified temporary upload file to its permanent stored location under a random UUID.
 *
 * @param {string} tempPath - Absolute path of the temporary file in STORAGE_DIR/tmp.
 * @returns {Promise<{storedName: string, absolutePath: string, sizeBytes: number}>}
 */
export const moveToFinal = async (tempPath) => {
  ensureStorageDirectories();

  const storedName = `${crypto.randomUUID()}.pdf`;
  const finalPath = resolveSafePath(storedName);

  try {
    // Attempt fast atomic rename first
    await fs.promises.rename(tempPath, finalPath);
  } catch (err) {
    // Fallback to copy + unlink if cross-device or permission boundary
    if (err.code === 'EXDEV') {
      await fs.promises.copyFile(tempPath, finalPath);
      await fs.promises.unlink(tempPath).catch(() => {});
    } else {
      throw err;
    }
  }

  const stats = await fs.promises.stat(finalPath);
  return {
    storedName,
    absolutePath: finalPath,
    sizeBytes: stats.size,
  };
};

/**
 * Reads a stored file from disk by storedName.
 *
 * @param {string} storedName - Stored filename.
 * @returns {Promise<Buffer>}
 */
export const readFile = async (storedName) => {
  const filePath = resolveSafePath(storedName);
  return fs.promises.readFile(filePath);
};

/**
 * Safely removes a stored file by its storedName. Never throws if the file does not exist.
 *
 * @param {string} storedName - Stored filename (UUID.pdf).
 * @returns {Promise<boolean>} True if removed, false otherwise.
 */
export const deleteFile = async (storedName) => {
  if (!storedName) return false;

  try {
    const filePath = resolveSafePath(storedName);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
  } catch (err) {
    logger.warn({ storedName, error: err.message }, 'Failed to delete stored file');
  }
  return false;
};

/**
 * Safely removes a temporary file from disk. Never throws.
 *
 * @param {string} tempPath - Absolute path of temporary file.
 * @returns {Promise<boolean>}
 */
export const deleteTempFile = async (tempPath) => {
  if (!tempPath) return false;

  try {
    if (fs.existsSync(tempPath)) {
      await fs.promises.unlink(tempPath);
      return true;
    }
  } catch (err) {
    logger.warn({ tempPath, error: err.message }, 'Failed to delete temporary file');
  }
  return false;
};

// Initialize directories on module load
ensureStorageDirectories();
