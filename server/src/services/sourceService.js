/**
 * @fileoverview Source service managing approved official government source endpoints.
 */

import { Source } from '../models/Source.js';
import { Document } from '../models/Document.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Escapes regex metacharacters in user query input to prevent ReDoS / query injection.
 *
 * @param {string} str - Raw search query string.
 * @returns {string} Escaped regex string.
 */
export const escapeRegex = (str) => {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Normalizes a URL by lowercasing scheme/host, clearing hashes, and trimming root slashes.
 *
 * @param {string} urlStr - Raw URL.
 * @returns {string} Normalized URL string.
 */
export const normalizeUrl = (urlStr) => {
  const parsed = new URL(urlStr.trim());
  parsed.hash = '';
  let normalized = parsed.toString();
  if (normalized.endsWith('/') && parsed.pathname === '/') {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

/**
 * Creates a new official source entry.
 *
 * @param {Object} data - Source parameters.
 * @param {string} adminId - ID of creating admin.
 * @returns {Promise<Object>} Created Source document.
 * @throws {ApiError} 409 CONFLICT if source URL already exists.
 */
export const createSource = async (data, adminId) => {
  const cleanUrl = normalizeUrl(data.url);

  const existing = await Source.findOne({ url: cleanUrl });
  if (existing) {
    throw new ApiError(409, 'CONFLICT', 'A source with this URL already exists');
  }

  const source = await Source.create({
    name: data.name.trim(),
    url: cleanUrl,
    sourceType: data.sourceType,
    issuingAuthority: data.issuingAuthority.trim(),
    docType: data.docType || 'other',
    category: data.category || 'other',
    notes: data.notes ? data.notes.trim() : undefined,
    isActive: true,
    createdBy: adminId,
  });

  return source;
};

/**
 * Lists sources with optional filtering and pagination.
 *
 * @param {Object} params - Query filters.
 * @returns {Promise<{items: Array, total: number, page: number, limit: number}>}
 */
export const listSources = async ({ page = 1, limit = 20, isActive, category, q }) => {
  const filter = {};

  if (typeof isActive === 'boolean') {
    filter.isActive = isActive;
  }
  if (category) {
    filter.category = category;
  }
  if (q && q.trim()) {
    const safeRegex = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ name: safeRegex }, { issuingAuthority: safeRegex }];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Source.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Source.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: pageNum,
    limit: limitNum,
  };
};

/**
 * Retrieves a single source by its ID.
 *
 * @param {string} id - Source ObjectId.
 * @returns {Promise<Object>} Source document.
 * @throws {ApiError} 404 NOT_FOUND if source does not exist.
 */
export const getSourceById = async (id) => {
  const source = await Source.findById(id);
  if (!source) {
    throw new ApiError(404, 'NOT_FOUND', 'Source not found');
  }
  return source;
};

/**
 * Updates editable source attributes. URL cannot be altered if documents exist for it.
 *
 * @param {string} id - Source ObjectId.
 * @param {Object} updates - Update payload.
 * @returns {Promise<Object>} Updated Source document.
 * @throws {ApiError} 400 If URL mutation is attempted after documents exist.
 * @throws {ApiError} 404 If source does not exist.
 * @throws {ApiError} 409 If new URL conflicts with existing source.
 */
export const updateSource = async (id, updates) => {
  const source = await getSourceById(id);

  if (updates.url) {
    const cleanUrl = normalizeUrl(updates.url);
    if (cleanUrl !== source.url) {
      const docsCount = await Document.countDocuments({ sourceId: id });
      if (docsCount > 0) {
        throw new ApiError(
          400,
          'VALIDATION_ERROR',
          'Source URL cannot be changed after documents have been associated with it'
        );
      }

      const duplicate = await Source.findOne({ url: cleanUrl, _id: { $ne: id } });
      if (duplicate) {
        throw new ApiError(409, 'CONFLICT', 'A source with this URL already exists');
      }
      source.url = cleanUrl;
    }
  }

  if (updates.name !== undefined) source.name = updates.name.trim();
  if (updates.issuingAuthority !== undefined)
    source.issuingAuthority = updates.issuingAuthority.trim();
  if (updates.sourceType !== undefined) source.sourceType = updates.sourceType;
  if (updates.docType !== undefined) source.docType = updates.docType;
  if (updates.category !== undefined) source.category = updates.category;
  if (updates.notes !== undefined) source.notes = updates.notes ? updates.notes.trim() : undefined;

  await source.save();
  return source;
};

/**
 * Toggles or sets the active state of a source.
 *
 * @param {string} id - Source ObjectId.
 * @param {boolean} isActive - Desired status.
 * @returns {Promise<Object>} Updated Source document.
 */
export const updateSourceStatus = async (id, isActive) => {
  const source = await getSourceById(id);
  source.isActive = Boolean(isActive);
  await source.save();
  return source;
};

/**
 * Deletes a source if no documents reference it.
 *
 * @param {string} id - Source ObjectId.
 * @returns {Promise<{deleted: boolean}>}
 * @throws {ApiError} 409 CONFLICT if documents reference this source.
 */
export const deleteSource = async (id) => {
  await getSourceById(id);

  const docsCount = await Document.countDocuments({ sourceId: id });
  if (docsCount > 0) {
    throw new ApiError(
      409,
      'CONFLICT',
      'Cannot delete source: documents are associated with it. Please deactivate the source instead.'
    );
  }

  await Source.findByIdAndDelete(id);
  return { deleted: true };
};
