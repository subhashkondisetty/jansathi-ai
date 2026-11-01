/**
 * @fileoverview Utility to sanitize client-provided filenames for display and metadata storage.
 */

import path from 'node:path';

/**
 * Strips path traversal characters, directory separators, and control characters from filenames.
 *
 * @param {string} rawFilename - Unsafe user-provided filename.
 * @param {number} [maxLength=200] - Maximum allowable length.
 * @returns {string} Sanitized safe filename string.
 */
export const sanitizeOriginalFilename = (rawFilename, maxLength = 200) => {
  if (!rawFilename || typeof rawFilename !== 'string') {
    return 'document.pdf';
  }

  // Extract basename to discard any path prefixes
  const base = path.basename(rawFilename);

  // Remove control characters, null bytes, and filesystem path separators
  let cleaned = '';
  const forbiddenChars = new Set(['\\', '/', ':', '*', '?', '"', '<', '>', '|']);
  for (const ch of base) {
    const code = ch.charCodeAt(0);
    if (code >= 32 && code !== 127 && !forbiddenChars.has(ch)) {
      cleaned += ch;
    }
  }
  cleaned = cleaned.trim();

  if (!cleaned) {
    cleaned = 'document.pdf';
  }

  if (cleaned.length > maxLength) {
    const ext = path.extname(cleaned);
    const stem = cleaned.slice(0, maxLength - ext.length);
    cleaned = stem + ext;
  }

  return cleaned;
};

/**
 * Extracts a human-readable title from a filename by stripping the extension.
 *
 * @param {string} filename - Filename with or without extension.
 * @returns {string} Filename without extension.
 */
export const extractTitleFromFilename = (filename) => {
  const sanitized = sanitizeOriginalFilename(filename);
  const ext = path.extname(sanitized);
  const title = ext ? sanitized.slice(0, -ext.length) : sanitized;
  return title.replace(/[-_]+/g, ' ').trim() || 'Untitled Document';
};
