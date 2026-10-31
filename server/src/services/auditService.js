/**
 * @fileoverview Audit logging service ensuring zero-throw, tamper-evident audit records.
 */

import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'refreshtoken',
  'email',
  'secret',
  'authorization',
  'creditcard',
]);

/**
 * Recursively scrubs known sensitive keys from audit metadata objects.
 *
 * @param {Object} obj - Raw metadata object.
 * @returns {Object} Sanitized object free of sensitive values.
 */
const sanitizeAuditMetadata = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeAuditMetadata);

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] =
        typeof value === 'object' && value !== null ? sanitizeAuditMetadata(value) : value;
    }
  }
  return sanitized;
};

/**
 * Writes an audit event to the database. This function is guaranteed NEVER to throw,
 * ensuring operational flows are not interrupted by audit recording failures.
 *
 * @param {Object} params - Audit event parameters.
 * @param {string} [params.actorId] - User ID initiating the action.
 * @param {string} [params.actorRole] - Role of the actor.
 * @param {string} params.action - Event action identifier (e.g. 'auth.login').
 * @param {string} [params.resourceType] - Domain entity affected.
 * @param {string} [params.resourceId] - Primary ID of the entity affected.
 * @param {'success'|'failure'} params.outcome - Event outcome status.
 * @param {string} [params.requestId] - Associated HTTP request ID.
 * @param {Object} [params.metadata] - Non-sensitive context data.
 * @returns {Promise<void>} Resolves quietly regardless of persistence outcome.
 */
export const logAudit = async ({
  actorId = undefined,
  actorRole = undefined,
  action,
  resourceType = undefined,
  resourceId = undefined,
  outcome,
  requestId = undefined,
  metadata = {},
}) => {
  try {
    const cleanMetadata = sanitizeAuditMetadata(metadata);

    await AuditLog.create({
      actorId: actorId || undefined,
      actorRole: actorRole || undefined,
      action,
      resourceType: resourceType || undefined,
      resourceId: resourceId ? String(resourceId) : undefined,
      outcome,
      requestId: requestId || undefined,
      metadata: cleanMetadata,
    });
  } catch (err) {
    logger.warn(
      {
        action,
        outcome,
        requestId,
        error: err.message,
      },
      'Failed to record audit log entry'
    );
  }
};
