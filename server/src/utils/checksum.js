/**
 * @fileoverview Utility to compute SHA-256 checksums from files, streams, or buffers.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';

/**
 * Computes the SHA-256 hash of a file on disk.
 *
 * @param {string} filePath - Absolute path to the file.
 * @returns {Promise<string>} Hexadecimal SHA-256 digest.
 */
export const calculateFileSha256 = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
};

/**
 * Computes the SHA-256 hash of a Buffer in memory.
 *
 * @param {Buffer} buffer - Buffer to hash.
 * @returns {string} Hexadecimal SHA-256 digest.
 */
export const calculateBufferSha256 = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};
