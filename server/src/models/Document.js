/**
 * @fileoverview Document model representing uploaded or fetched civic knowledge items.
 */

import mongoose from 'mongoose';
import {
  DOC_ORIGIN,
  VISIBILITY,
  DOC_TYPES,
  DOC_CATEGORIES,
  DOC_STATUS,
  LANGUAGES,
} from '../config/constants.js';
import { env } from '../config/env.js';
import { toJSONPlugin } from '../utils/modelHelpers.js';

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    issuingAuthority: {
      type: String,
      trim: true,
      maxlength: [200, 'Issuing authority cannot exceed 200 characters'],
      required: [
        function () {
          return this.visibility === 'public';
        },
        'Issuing authority is required for public documents',
      ],
    },
    sourceUrl: {
      type: String,
      trim: true,
      maxlength: [2048, 'Source URL cannot exceed 2048 characters'],
      required: [
        function () {
          return this.visibility === 'public';
        },
        'Source URL is required for public documents',
      ],
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Source',
    },
    origin: {
      type: String,
      required: [true, 'Document origin is required'],
      enum: {
        values: DOC_ORIGIN,
        message: '{VALUE} is not a valid document origin',
      },
    },
    visibility: {
      type: String,
      enum: {
        values: VISIBILITY,
        message: '{VALUE} is not a valid visibility setting',
      },
      default: 'private',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    scopeKey: {
      type: String,
      required: [true, 'Scope key is required'],
      trim: true,
    },
    checksum: {
      type: String,
      required: [true, 'Document checksum is required'],
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    isLatest: {
      type: Boolean,
      default: true,
    },
    supersedesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    docType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: {
        values: DOC_TYPES,
        message: '{VALUE} is not a valid document type',
      },
    },
    category: {
      type: String,
      required: [true, 'Document category is required'],
      enum: {
        values: DOC_CATEGORIES,
        message: '{VALUE} is not a valid document category',
      },
    },
    language: {
      type: String,
      enum: {
        values: [...LANGUAGES, 'unknown'],
        message: '{VALUE} is not a supported document language',
      },
      default: 'unknown',
    },
    publishedAt: {
      type: Date,
    },
    lastUpdatedAt: {
      type: Date,
    },
    fetchedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: DOC_STATUS,
        message: '{VALUE} is not a valid document status',
      },
      default: 'pending',
    },
    failure: {
      code: { type: String, trim: true },
      message: { type: String, trim: true },
    },
    pageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    chunkCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    extraction: {
      method: {
        type: String,
        enum: ['text', 'html', 'ocr', 'mixed'],
        default: 'text',
      },
      emptyPageCount: { type: Number, default: 0 },
      ocrPageCount: { type: Number, default: 0 },
    },
    metadata: {
      pdfTitle: { type: String, trim: true },
      pdfAuthor: { type: String, trim: true },
      pdfCreatedAt: { type: Date },
      httpLastModified: { type: String, trim: true },
      contentType: { type: String, trim: true },
    },
    storage: {
      storedName: { type: String, trim: true },
      originalName: { type: String, trim: true },
      mimeType: { type: String, trim: true },
      sizeBytes: { type: Number, min: 0 },
    },
  },
  {
    timestamps: true,
    strict: true,
    autoIndex: env.AUTO_INDEX,
  }
);

// Indexes
documentSchema.index({ scopeKey: 1, checksum: 1 }, { unique: true });
documentSchema.index({ visibility: 1, isLatest: 1, status: 1, category: 1 });
documentSchema.index({ sourceUrl: 1, version: -1 });
documentSchema.index({ uploadedBy: 1, createdAt: -1 });
documentSchema.index({ status: 1 });

// Apply shared plugins
documentSchema.plugin(toJSONPlugin);

export const Document = mongoose.model('Document', documentSchema);
export default Document;
