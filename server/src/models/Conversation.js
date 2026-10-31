/**
 * @fileoverview Conversation model recording citizen dialogues and document question-answering.
 */

import mongoose from 'mongoose';
import { CONVERSATION_MODES, LANGUAGES, MESSAGE_ROLES } from '../config/constants.js';
import { env } from '../config/env.js';
import { toJSONPlugin } from '../utils/modelHelpers.js';

const citationSchema = new mongoose.Schema(
  {
    id: { type: String, trim: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    chunkId: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentChunk' },
    title: { type: String, trim: true },
    issuingAuthority: { type: String, trim: true },
    sourceUrl: { type: String, trim: true },
    pageStart: { type: Number },
    pageEnd: { type: Number },
    sectionHeading: { type: String, trim: true },
    publishedAt: { type: Date },
    lastUpdatedAt: { type: Date },
    fetchedAt: { type: Date },
    quote: { type: String, trim: true },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, 'Message role is required'],
      enum: {
        values: MESSAGE_ROLES,
        message: '{VALUE} is not a valid message role',
      },
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [8000, 'Message content cannot exceed 8000 characters'],
    },
    citations: [citationSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
      maxlength: [120, 'Conversation title cannot exceed 120 characters'],
    },
    mode: {
      type: String,
      enum: {
        values: CONVERSATION_MODES,
        message: '{VALUE} is not a valid conversation mode',
      },
      default: 'ask',
    },
    language: {
      type: String,
      enum: {
        values: LANGUAGES,
        message: '{VALUE} is not a valid language code',
      },
      default: 'en',
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    messages: {
      type: [messageSchema],
      validate: [(val) => val.length <= 200, 'Conversation cannot exceed 200 messages'],
    },
  },
  {
    timestamps: true,
    strict: true,
    autoIndex: env.AUTO_INDEX,
  }
);

// Indexes
conversationSchema.index({ userId: 1, updatedAt: -1 });

// Apply shared plugins
conversationSchema.plugin(toJSONPlugin);

export const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
