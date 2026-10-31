/**
 * @fileoverview Source model representing approved official government web endpoints.
 */

import mongoose from 'mongoose';
import { SOURCE_TYPES, DOC_TYPES, DOC_CATEGORIES } from '../config/constants.js';
import { env } from '../config/env.js';
import { toJSONPlugin } from '../utils/modelHelpers.js';

const urlRegex = /^https?:\/\/.+/i;

const sourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Source name is required'],
      trim: true,
      maxlength: [200, 'Source name cannot exceed 200 characters'],
    },
    url: {
      type: String,
      required: [true, 'Source URL is required'],
      trim: true,
      unique: true,
      maxlength: [2048, 'URL cannot exceed 2048 characters'],
      match: [urlRegex, 'URL must begin with http:// or https://'],
    },
    sourceType: {
      type: String,
      required: [true, 'Source type is required'],
      enum: {
        values: SOURCE_TYPES,
        message: '{VALUE} is not a valid source type',
      },
    },
    issuingAuthority: {
      type: String,
      required: [true, 'Issuing authority is required'],
      trim: true,
      maxlength: [200, 'Issuing authority cannot exceed 200 characters'],
    },
    docType: {
      type: String,
      enum: {
        values: DOC_TYPES,
        message: '{VALUE} is not a valid document type',
      },
      default: 'other',
    },
    category: {
      type: String,
      enum: {
        values: DOC_CATEGORIES,
        message: '{VALUE} is not a valid document category',
      },
      default: 'other',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    lastFetchedAt: {
      type: Date,
    },
    lastFetchStatus: {
      type: String,
      enum: ['never', 'ok', 'failed'],
      default: 'never',
    },
    lastFetchError: {
      code: { type: String, trim: true },
      message: { type: String, trim: true },
    },
    lastDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    strict: true,
    autoIndex: env.AUTO_INDEX,
  }
);

// Indexes
sourceSchema.index({ isActive: 1 });
sourceSchema.index({ category: 1 });

// Apply shared plugins
sourceSchema.plugin(toJSONPlugin);

export const Source = mongoose.model('Source', sourceSchema);
export default Source;
