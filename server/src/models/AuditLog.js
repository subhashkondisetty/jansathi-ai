/**
 * @fileoverview AuditLog model recording security and operational events with TTL expiration.
 */

import mongoose from 'mongoose';
import { AUDIT_OUTCOMES } from '../config/constants.js';
import { env } from '../config/env.js';
import { toJSONPlugin } from '../utils/modelHelpers.js';

const SENSITIVE_KEYS = new Set(['password', 'token', 'email', 'text', 'content']);

const stripSensitiveKeys = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(stripSensitiveKeys);
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = typeof value === 'object' && value !== null ? stripSensitiveKeys(value) : value;
    }
  }
  return clean;
};

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    actorRole: {
      type: String,
      trim: true,
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      trim: true,
      maxlength: [120, 'Action cannot exceed 120 characters'],
    },
    resourceType: {
      type: String,
      trim: true,
      maxlength: [80, 'Resource type cannot exceed 80 characters'],
    },
    resourceId: {
      type: String,
      trim: true,
      maxlength: [120, 'Resource ID cannot exceed 120 characters'],
    },
    outcome: {
      type: String,
      required: [true, 'Audit outcome is required'],
      enum: {
        values: AUDIT_OUTCOMES,
        message: '{VALUE} is not a valid audit outcome',
      },
    },
    requestId: {
      type: String,
      trim: true,
      maxlength: [64, 'Request ID cannot exceed 64 characters'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    strict: true,
    autoIndex: env.AUTO_INDEX,
  }
);

// Pre-save hook to strip PII and sensitive fields from metadata
auditLogSchema.pre('save', function (next) {
  if (this.metadata && typeof this.metadata === 'object') {
    this.metadata = stripSensitiveKeys(this.metadata);
  }
  next();
});

// TTL index to automatically purge old logs according to AUDIT_LOG_TTL_DAYS
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: env.AUDIT_LOG_TTL_DAYS * 86400 });

// Operational search indexes
auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

// Apply shared plugins
auditLogSchema.plugin(toJSONPlugin);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
