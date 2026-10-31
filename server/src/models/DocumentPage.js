/**
 * @fileoverview DocumentPage model representing page-wise or section-wise parsed text.
 */

import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { toJSONPlugin } from '../utils/modelHelpers.js';

const documentPageSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Document reference is required'],
    },
    pageNumber: {
      type: Number,
      required: [true, 'Page number is required'],
      min: [1, 'Page number must be at least 1'],
    },
    sectionHeading: {
      type: String,
      trim: true,
      maxlength: [300, 'Section heading cannot exceed 300 characters'],
    },
    text: {
      type: String,
      required: [true, 'Page text content is required'],
      default: '',
    },
    charCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isEmpty: {
      type: Boolean,
      default: false,
    },
    extractionMethod: {
      type: String,
      enum: ['text', 'html', 'ocr'],
      default: 'text',
    },
  },
  {
    timestamps: true,
    strict: true,
    autoIndex: env.AUTO_INDEX,
  }
);

// Indexes
documentPageSchema.index({ documentId: 1, pageNumber: 1 }, { unique: true });

// Apply shared plugins
documentPageSchema.plugin(toJSONPlugin);

export const DocumentPage = mongoose.model('DocumentPage', documentPageSchema);
export default DocumentPage;
