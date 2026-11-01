/**
 * @fileoverview Zod validation schemas for conversation history endpoints.
 */

import { z } from 'zod';
import { CONVERSATION_MODES, LANGUAGES } from '../config/constants.js';
import { objectId } from './common.js';

export const createConversationSchema = z
  .object({
    title: z.string().trim().max(120, 'Title cannot exceed 120 characters').optional(),
    mode: z.enum(CONVERSATION_MODES).default('ask'),
    language: z.enum(LANGUAGES).default('en'),
    documentId: objectId.optional(),
  })
  .strict();

export const listConversationsQuerySchema = z.object({
  mode: z.enum(CONVERSATION_MODES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const conversationIdParamSchema = z.object({
  id: objectId,
});

export const appendMessageSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, 'Message content cannot be empty')
      .max(8000, 'Message content cannot exceed 8000 characters'),
  })
  .strict();

export default {
  createConversationSchema,
  listConversationsQuerySchema,
  conversationIdParamSchema,
  appendMessageSchema,
};
