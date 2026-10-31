/**
 * @fileoverview DocumentChunk model representing segmented content blocks for retrieval.
 *
 * =========================================================================================
 * AI-DAY: add an `embedding` field + Atlas Vector Search index here;
 * the dimension must match the chosen embedding model.
 * =========================================================================================
 */

import mongoose from 'mongoose';
import { DOC_TYPES, DOC_CATEGORIES, VISIBILITY, LANGUAGES } from '../config/constants.js';
import { env } from '../config/env.js';
import { toJSONPlugin } from '../utils/modelHelpers.js';

const documentChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Document reference is required'],
    },
    chunkIndex: {
      type: Number,
      required: [true, 'Chunk index is required'],
      min: [0, 'Chunk index must be non-negative'],
    },
    text: {
      type: String,
      required: [true, 'Chunk text is required'],
    },
    charCount: {
      type: Number,
      required: [true, 'Character count is required'],
      min: 0,
    },
    // Denormalized document metadata to accelerate search queries without joins
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    issuingAuthority: {
      type: String,
      trim: true,
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
        message: '{VALUE} is not a supported language',
      },
      default: 'unknown',
    },
    visibility: {
      type: String,
      enum: {
        values: VISIBILITY,
        message: '{VALUE} is not a valid visibility setting',
      },
      default: 'private',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isLatest: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    checksum: {
      type: String,
      required: [true, 'Checksum is required'],
      trim: true,
    },
    pageStart: {
      type: Number,
    },
    pageEnd: {
      type: Number,
    },
    sectionHeading: {
      type: String,
      trim: true,
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
  },
  {
    timestamps: true,
    strict: true,
    autoIndex: env.AUTO_INDEX,
  }
);

// Indexes
documentChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });
documentChunkSchema.index({ isLatest: 1, visibility: 1, category: 1, docType: 1 });
documentChunkSchema.index({ ownerId: 1 });

// Full-text index for non-AI keyword search with field weighting
documentChunkSchema.index(
  {
    title: 'text',
    sectionHeading: 'text',
    text: 'text',
  },
  {
    name: 'chunk_text_idx',
    weights: {
      title: 5,
      sectionHeading: 3,
      text: 1,
    },
    default_language: 'english',
    language_override: 'searchLanguage',
  }
);

// Apply shared plugins
documentChunkSchema.plugin(toJSONPlugin);

export const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);
export default DocumentChunk;
