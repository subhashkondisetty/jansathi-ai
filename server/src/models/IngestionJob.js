/**
 * @fileoverview IngestionJob model managing asynchronous document fetching and chunking pipeline.
 */

import mongoose from 'mongoose';
import { JOB_TYPES, JOB_STATUS, JOB_STAGES } from '../config/constants.js';
import { env } from '../config/env.js';
import { toJSONPlugin } from '../utils/modelHelpers.js';

const ingestionJobSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Job type is required'],
      enum: {
        values: JOB_TYPES,
        message: '{VALUE} is not a valid job type',
      },
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Source',
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    sourceUrl: {
      type: String,
      trim: true,
      maxlength: [2048, 'Source URL cannot exceed 2048 characters'],
    },
    status: {
      type: String,
      enum: {
        values: JOB_STATUS,
        message: '{VALUE} is not a valid job status',
      },
      default: 'queued',
    },
    stage: {
      type: String,
      enum: {
        values: JOB_STAGES,
        message: '{VALUE} is not a valid job stage',
      },
      default: 'queued',
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: 1,
    },
    nextRunAt: {
      type: Date,
      default: Date.now,
    },
    lockedAt: {
      type: Date,
    },
    error: {
      code: { type: String, trim: true },
      message: { type: String, trim: true },
      retriable: { type: Boolean, default: false },
    },
    stats: {
      pageCount: { type: Number, default: 0, min: 0 },
      chunkCount: { type: Number, default: 0, min: 0 },
      emptyPages: { type: Number, default: 0, min: 0 },
      ocrPages: { type: Number, default: 0, min: 0 },
      durationMs: { type: Number, default: 0, min: 0 },
    },
    manualRetries: {
      type: Number,
      default: 0,
      min: 0,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    startedAt: {
      type: Date,
    },
    finishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    strict: true,
    autoIndex: env.AUTO_INDEX,
  }
);

// Indexes
ingestionJobSchema.index({ status: 1, nextRunAt: 1 });
ingestionJobSchema.index({ sourceId: 1, createdAt: -1 });
ingestionJobSchema.index({ documentId: 1 });
ingestionJobSchema.index({ createdAt: -1 });

// Apply shared plugins
ingestionJobSchema.plugin(toJSONPlugin);

export const IngestionJob = mongoose.model('IngestionJob', ingestionJobSchema);
export default IngestionJob;
