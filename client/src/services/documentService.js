/**
 * @fileoverview Citizen and document library API client services.
 * Integrates directly with Express /api/documents endpoints using central Axios instance.
 */

import api, { normalizeApiError } from './api.js';

/**
 * Lists catalog documents with filtering, search query, scoping, and pagination.
 *
 * @param {Object} [params] - Query parameters.
 * @param {string} [params.q] - Keyword search string (regex matched on title & issuingAuthority).
 * @param {string} [params.category] - Document category filter.
 * @param {string} [params.docType] - Document type filter.
 * @param {string} [params.issuingAuthority] - Issuing authority filter.
 * @param {string} [params.language] - Language code filter.
 * @param {string} [params.status] - Status filter (applied when scope='mine' or user is admin).
 * @param {string} [params.scope='library'] - Document scope: 'library' (public ready) or 'mine' (own uploads).
 * @param {string} [params.sort='-createdAt'] - Sort field from SORT_WHITELIST.
 * @param {number} [params.page=1] - 1-indexed page number.
 * @param {number} [params.limit=20] - Results per page (max 100).
 * @returns {Promise<{items: Array, meta: {page: number, limit: number, total: number, totalPages: number}}>}
 */
export const listDocuments = async (params = {}) => {
  try {
    const res = await api.get('/documents', { params });
    const data = res.data?.data || [];
    const meta = res.data?.meta || { page: 1, limit: 20, total: 0, totalPages: 1 };
    return {
      items: data,
      meta: {
        page: Number(meta.page) || 1,
        limit: Number(meta.limit) || 20,
        total: Number(meta.total) || 0,
        totalPages: Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 20))),
      },
    };
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Fetches public library facet aggregations (categories, docTypes, authorities, languages).
 *
 * @returns {Promise<Object>} Aggregated facet counts.
 */
export const getDocumentFacets = async () => {
  try {
    const res = await api.get('/documents/facets');
    return (
      res.data?.data || {
        total: 0,
        categories: [],
        docTypes: [],
        issuingAuthorities: [],
        languages: [],
      }
    );
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Retrieves a single document by ID along with its latest ingestion job (for owner or admin).
 *
 * @param {string} id - Document MongoDB ObjectId.
 * @returns {Promise<{document: Object, latestJob: Object|null}>}
 */
export const getDocumentById = async (id) => {
  try {
    const res = await api.get(`/documents/${id}`);
    return res.data?.data || { document: null, latestJob: null };
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Retrieves paginated parsed pages for a ready document.
 *
 * @param {string} id - Document MongoDB ObjectId.
 * @param {Object} [params] - Pagination options { page, limit }.
 * @returns {Promise<{items: Array, meta: {page: number, limit: number, total: number, totalPages: number}}>}
 */
export const getDocumentPages = async (id, params = { page: 1, limit: 10 }) => {
  try {
    const res = await api.get(`/documents/${id}/pages`, { params });
    const items = res.data?.data || [];
    const meta = res.data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };
    return {
      items,
      meta: {
        page: Number(meta.page) || 1,
        limit: Number(meta.limit) || 10,
        total: Number(meta.total) || 0,
        totalPages: Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 10))),
      },
    };
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Uploads a single citizen PDF with optional metadata.
 *
 * @param {FormData} formData - FormData containing 'file' and optional metadata fields.
 * @param {Function} [onUploadProgress] - Axios upload progress callback.
 * @returns {Promise<{status: number, data: Object}>}
 */
export const uploadDocument = async (formData, onUploadProgress) => {
  try {
    const res = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (typeof onUploadProgress === 'function' && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
    return {
      status: res.status,
      data: res.data?.data,
    };
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Deletes a citizen-owned uploaded document.
 *
 * @param {string} id - Document MongoDB ObjectId.
 * @returns {Promise<{deleted: boolean}>}
 */
export const deleteDocument = async (id) => {
  try {
    const res = await api.delete(`/documents/${id}`);
    return res.data?.data || { deleted: true };
  } catch (err) {
    throw normalizeApiError(err);
  }
};

export default {
  listDocuments,
  getDocumentFacets,
  getDocumentById,
  getDocumentPages,
  uploadDocument,
  deleteDocument,
};
