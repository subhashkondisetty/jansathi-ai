/**
 * @fileoverview Claim model tracking citizen factual queries and verification assessments.
 */

import mongoose from 'mongoose';
import { CLAIM_ASSESSMENTS, LANGUAGES } from '../config/constants.js';
import { env } from '../config/env.js';
import { toJSONPlugin } from '../utils/modelHelpers.js';

const evidenceSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    chunkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DocumentChunk',
    },
    title: {
      type: String,
      trim: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    pageNumber: {
      type: Number,
    },
    stance: {
      type: String,
      enum: {
        values: ['supports', 'contradicts', 'related'],
        message: '{VALUE} is not a valid evidence stance',
      },
    },
    quote: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const claimSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    claimText: {
      type: String,
      required: [true, 'Claim text is required'],
      trim: true,
      maxlength: [2000, 'Claim text cannot exceed 2000 characters'],
    },
    language: {
      type: String,
      enum: {
        values: LANGUAGES,
        message: '{VALUE} is not a valid language code',
      },
      default: 'en',
    },
    assessment: {
      type: String,
      required: [true, 'Claim assessment is required'],
      enum: {
        values: CLAIM_ASSESSMENTS,
        message: '{VALUE} is not a valid claim assessment',
      },
    },
    explanation: {
      type: String,
      trim: true,
    },
    evidence: [evidenceSchema],
  },
  {
    timestamps: true,
    strict: true,
    autoIndex: env.AUTO_INDEX,
  }
);

// Indexes
claimSchema.index({ userId: 1, createdAt: -1 });

// Apply shared plugins
claimSchema.plugin(toJSONPlugin);

export const Claim = mongoose.model('Claim', claimSchema);
export default Claim;
