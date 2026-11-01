/**
 * @fileoverview Administrative API client service for JanSathi AI.
 * Integrates strictly with verified backend endpoints under /api/admin, /api/documents,
 * and /api/health using the central Axios client.
 */

import api, { normalizeApiError } from './api.js';

/**
 * Validates active administrator session with the backend.
 * @returns {Promise<{ id: string, role: 'admin' }>}
 */
export const getAdminSession = async () => {
  try {
    const res = await api.get('/admin/session');
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

// ---------------------------------------------------------------------------
// Ingestion Jobs Administrative API
// ---------------------------------------------------------------------------

/**
 * Lists ingestion jobs with filtering, sorting, and pagination.
 *
 * @param {Object} [params] - Query options.
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 * @param {'queued'|'running'|'succeeded'|'failed'|'skipped_duplicate'} [params.status]
 * @param {'upload'|'source_fetch'} [params.type]
 * @param {string} [params.sourceId]
 * @param {string} [params.documentId]
 * @param {string} [params.sort='-createdAt']
 * @returns {Promise<{ items: Array, meta: { page: number, limit: number, total: number, totalPages: number } }>}
 */
export const listIngestionJobs = async (params = {}) => {
  try {
    const res = await api.get('/admin/ingestion-jobs', { params });
    const items = res.data?.data || [];
    const meta = res.data?.meta || { page: 1, limit: 20, total: 0 };
    const limit = Number(meta.limit) || 20;
    const total = Number(meta.total) || 0;
    return {
      items,
      meta: {
        page: Number(meta.page) || 1,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Retrieves full details for a single ingestion job.
 * @param {string} id - IngestionJob MongoDB ObjectId.
 * @returns {Promise<Object>}
 */
export const getIngestionJob = async (id) => {
  try {
    const res = await api.get(`/admin/ingestion-jobs/${id}`);
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Manually retries a failed ingestion job.
 * Only available for jobs with status 'failed'. Backend returns 409 if not failed.
 *
 * @param {string} id - IngestionJob MongoDB ObjectId.
 * @returns {Promise<Object>} Updated job object reset to queued.
 */
export const retryIngestionJob = async (id) => {
  try {
    const res = await api.post(`/admin/ingestion-jobs/${id}/retry`);
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

// ---------------------------------------------------------------------------
// Document Administrative API
// ---------------------------------------------------------------------------

/**
 * Updates document metadata (admin-only) and denormalizes updates across associated chunks.
 *
 * @param {string} id - Document MongoDB ObjectId.
 * @param {Object} updates - Metadata updates according to adminUpdateDocumentSchema.
 * @returns {Promise<Object>} Updated Document.
 */
export const adminUpdateDocument = async (id, updates) => {
  try {
    const res = await api.patch(`/admin/documents/${id}`, updates);
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

// ---------------------------------------------------------------------------
// Source Management Administrative API
// ---------------------------------------------------------------------------

/**
 * Lists configured government sources with pagination, category, and active status filters.
 *
 * @param {Object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 * @param {boolean} [params.isActive]
 * @param {string} [params.category]
 * @param {string} [params.q]
 * @returns {Promise<{ items: Array, meta: { page: number, limit: number, total: number, totalPages: number } }>}
 */
export const listSources = async (params = {}) => {
  try {
    const res = await api.get('/admin/sources', { params });
    const items = res.data?.data || [];
    const meta = res.data?.meta || { page: 1, limit: 20, total: 0 };
    const limit = Number(meta.limit) || 20;
    const total = Number(meta.total) || 0;
    return {
      items,
      meta: {
        page: Number(meta.page) || 1,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Retrieves a single source by ID.
 * @param {string} id - Source MongoDB ObjectId.
 * @returns {Promise<Object>}
 */
export const getSourceById = async (id) => {
  try {
    const res = await api.get(`/admin/sources/${id}`);
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Creates a new government source record.
 *
 * @param {Object} sourceData - Source payload according to createSourceSchema.
 * @returns {Promise<Object>} Created Source (HTTP 201).
 */
export const createSource = async (sourceData) => {
  try {
    const res = await api.post('/admin/sources', sourceData);
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Updates an existing government source record.
 *
 * @param {string} id - Source MongoDB ObjectId.
 * @param {Object} updates - Source payload according to updateSourceSchema.
 * @returns {Promise<Object>} Updated Source.
 */
export const updateSource = async (id, updates) => {
  try {
    const res = await api.put(`/admin/sources/${id}`, updates);
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Toggles the active status of a source.
 *
 * @param {string} id - Source MongoDB ObjectId.
 * @param {boolean} isActive
 * @returns {Promise<Object>}
 */
export const updateSourceStatus = async (id, isActive) => {
  try {
    const res = await api.patch(`/admin/sources/${id}/status`, { isActive });
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Deletes a source by ID.
 * @param {string} id - Source MongoDB ObjectId.
 * @returns {Promise<{ deleted: boolean }>}
 */
export const deleteSource = async (id) => {
  try {
    const res = await api.delete(`/admin/sources/${id}`);
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Triggers an immediate crawler ingestion job for an active source.
 *
 * @param {string} id - Source MongoDB ObjectId.
 * @returns {Promise<{ job: Object }>} Job object returned with HTTP 202.
 */
export const triggerSourceIngest = async (id) => {
  try {
    const res = await api.post(`/admin/sources/${id}/ingest`);
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

// ---------------------------------------------------------------------------
// Health & System Telemetry API
// ---------------------------------------------------------------------------

/**
 * Probes the server liveness endpoint.
 * @returns {Promise<{ status: string, service: string, environment: string, database: string, uptimeSeconds: number, timestamp: string }>}
 */
export const getHealth = async () => {
  try {
    const res = await api.get('/health');
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Probes the server database readiness endpoint.
 * @returns {Promise<{ status: string, service: string, database: string, timestamp: string }>}
 */
export const getReadiness = async () => {
  try {
    const res = await api.get('/health/ready');
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Probes the AI capability readiness endpoint.
 * @returns {Promise<{ connected: boolean, features: { ask: boolean, eligibility: boolean, verify: boolean } }>}
 */
export const getAiStatus = async () => {
  try {
    const res = await api.get('/ai/status');
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

// ---------------------------------------------------------------------------
// Database-Backed Metrics Calculation Helpers
// Strictly uses actual pagination meta.total without downloading full bodies
// ---------------------------------------------------------------------------

/**
 * Retrieves total document and status counts across the entire corpus using scope=all.
 * Satisfies Mandatory Correction 2: Uses actual pagination metadata and supported status filters.
 *
 * @returns {Promise<{ total: number, ready: number, pending: number, processing: number, failed: number, needs_ocr: number }>}
 */
export const getDocumentOverviewStats = async () => {
  try {
    const statuses = ['ready', 'pending', 'processing', 'failed', 'needs_ocr'];

    // Parallel minimal queries (limit: 1) to retrieve meta.total from database
    const [totalRes, ...statusResults] = await Promise.all([
      api.get('/documents', { params: { scope: 'all', limit: 1 } }),
      ...statuses.map((st) =>
        api.get('/documents', { params: { scope: 'all', status: st, limit: 1 } })
      ),
    ]);

    const stats = {
      total: Number(totalRes.data?.meta?.total) || 0,
      ready: 0,
      pending: 0,
      processing: 0,
      failed: 0,
      needs_ocr: 0,
    };

    statuses.forEach((st, idx) => {
      stats[st] = Number(statusResults[idx]?.data?.meta?.total) || 0;
    });

    return stats;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Retrieves ingestion job counts across all statuses using actual pagination metadata.
 * Satisfies Mandatory Correction 3: Uses meta.total, never current page length.
 *
 * @returns {Promise<{ total: number, queued: number, running: number, succeeded: number, failed: number, skipped_duplicate: number }>}
 */
export const getIngestionOverviewStats = async () => {
  try {
    const statuses = ['queued', 'running', 'succeeded', 'failed', 'skipped_duplicate'];

    const [totalRes, ...statusResults] = await Promise.all([
      api.get('/admin/ingestion-jobs', { params: { limit: 1 } }),
      ...statuses.map((st) =>
        api.get('/admin/ingestion-jobs', { params: { status: st, limit: 1 } })
      ),
    ]);

    const stats = {
      total: Number(totalRes.data?.meta?.total) || 0,
      queued: 0,
      running: 0,
      succeeded: 0,
      failed: 0,
      skipped_duplicate: 0,
    };

    statuses.forEach((st, idx) => {
      stats[st] = Number(statusResults[idx]?.data?.meta?.total) || 0;
    });

    return stats;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Retrieves total, active, and inactive source counts using actual pagination metadata.
 * Satisfies Mandatory Correction 4: Uses actual pagination metadata with supported active-status filters.
 *
 * @returns {Promise<{ total: number, active: number, inactive: number }>}
 */
export const getSourceOverviewStats = async () => {
  try {
    const [totalRes, activeRes, inactiveRes] = await Promise.all([
      api.get('/admin/sources', { params: { limit: 1 } }),
      api.get('/admin/sources', { params: { isActive: true, limit: 1 } }),
      api.get('/admin/sources', { params: { isActive: false, limit: 1 } }),
    ]);

    return {
      total: Number(totalRes.data?.meta?.total) || 0,
      active: Number(activeRes.data?.meta?.total) || 0,
      inactive: Number(inactiveRes.data?.meta?.total) || 0,
    };
  } catch (err) {
    throw normalizeApiError(err);
  }
};

export default {
  getAdminSession,
  listIngestionJobs,
  getIngestionJob,
  retryIngestionJob,
  adminUpdateDocument,
  listSources,
  getSourceById,
  createSource,
  updateSource,
  updateSourceStatus,
  deleteSource,
  triggerSourceIngest,
  getHealth,
  getReadiness,
  getAiStatus,
  getDocumentOverviewStats,
  getIngestionOverviewStats,
  getSourceOverviewStats,
};
