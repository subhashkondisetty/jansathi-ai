/**
 * @fileoverview Conversation history service managing dialogue sessions, message limits,
 * citation storage, document reference verification, and audit event emission.
 */

import { Conversation } from '../models/Conversation.js';
import { Document } from '../models/Document.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from './auditService.js';

/**
 * Validates document accessibility for conversation attachment.
 * Must be either a public ready document or owned private document.
 *
 * @param {string} documentId - Document ObjectId string.
 * @param {string} userId - Current user ID string.
 * @throws {ApiError} 404 If document does not exist or is inaccessible.
 */
const validateDocumentAccess = async (documentId, userId) => {
  const doc = await Document.findById(documentId);
  if (!doc) {
    throw new ApiError(404, 'NOT_FOUND', 'Referenced document not found');
  }

  const isPublicReady = doc.visibility === 'public' && doc.status === 'ready';
  const isOwner = String(doc.uploadedBy) === String(userId);

  if (!isPublicReady && !isOwner) {
    throw new ApiError(404, 'NOT_FOUND', 'Referenced document not found');
  }
};

/**
 * Creates a new conversation session.
 *
 * @param {Object} params - Session parameters.
 * @param {string} params.userId - Authenticated user ObjectId.
 * @param {string} [params.title] - Optional conversation title.
 * @param {string} [params.mode='ask'] - Conversation mode ('ask'|'eligibility'|'document').
 * @param {string} [params.language='en'] - Conversation language code.
 * @param {string} [params.documentId] - Optional referenced document ID.
 * @returns {Promise<Object>} Created conversation document.
 */
export const createConversation = async ({ userId, title, mode, language, documentId }) => {
  if (documentId) {
    await validateDocumentAccess(documentId, userId);
  }

  const conv = await Conversation.create({
    userId,
    title: title ? title.trim() : 'New Conversation',
    mode: mode || 'ask',
    language: language || 'en',
    documentId: documentId || undefined,
    messages: [],
  });

  return conv;
};

/**
 * Lists conversations for the authenticated user with optional mode filter and pagination.
 *
 * @param {Object} params - Query parameters.
 * @param {string} params.userId - User ID.
 * @param {string} [params.mode] - Filter mode.
 * @param {number} [params.page=1] - Page number.
 * @param {number} [params.limit=20] - Page size.
 * @returns {Promise<{items: Array, total: number, page: number, limit: number}>}
 */
export const listConversations = async ({ userId, mode, page = 1, limit = 20 }) => {
  const filter = { userId };
  if (mode) {
    filter.mode = mode;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [conversations, total] = await Promise.all([
    Conversation.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limitNum).lean(),
    Conversation.countDocuments(filter),
  ]);

  const items = conversations.map((conv) => {
    const messages = conv.messages || [];
    const messageCount = messages.length;
    const lastMsg = messageCount > 0 ? messages[messageCount - 1] : null;

    let lastMessagePreview = null;
    if (lastMsg?.content) {
      const cleanContent = lastMsg.content.trim();
      lastMessagePreview =
        cleanContent.length > 120 ? `${cleanContent.slice(0, 117)}...` : cleanContent;
    }

    return {
      id: conv._id.toString(),
      title: conv.title,
      mode: conv.mode,
      language: conv.language,
      documentId: conv.documentId ? conv.documentId.toString() : null,
      messageCount,
      lastMessagePreview,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    };
  });

  return {
    items,
    total,
    page: pageNum,
    limit: limitNum,
  };
};

/**
 * Retrieves full conversation details including messages and citations.
 * Owner-scoped: Returns 404 for other users' conversation IDs to prevent enumeration.
 *
 * @param {Object} params - Lookup params.
 * @param {string} params.conversationId - Conversation ObjectId string.
 * @param {string} params.userId - Authenticated user ID string.
 * @returns {Promise<Object>} Full conversation object.
 */
export const getConversationById = async ({ conversationId, userId }) => {
  const conv = await Conversation.findOne({ _id: conversationId, userId });
  if (!conv) {
    throw new ApiError(404, 'NOT_FOUND', 'Conversation not found');
  }

  return conv;
};

/**
 * Appends a user message to an active conversation.
 * Role is strictly forced to "user" — clients can never write assistant messages or citations.
 * Enforces hard ceiling of 200 messages per conversation.
 *
 * @param {Object} params - Message parameters.
 * @param {string} params.conversationId - Target conversation ID.
 * @param {string} params.userId - Authenticated user ID.
 * @param {string} params.content - User message text.
 * @returns {Promise<Object>} Updated conversation object.
 */
export const appendUserMessage = async ({ conversationId, userId, content }) => {
  const conv = await Conversation.findOne({ _id: conversationId, userId });
  if (!conv) {
    throw new ApiError(404, 'NOT_FOUND', 'Conversation not found');
  }

  if (conv.messages.length >= 200) {
    throw new ApiError(409, 'CONFLICT', 'Conversation message limit of 200 reached');
  }

  const cleanContent = content.trim();

  // If title is default and this is first user message, derive title from question
  if (conv.title === 'New Conversation' && conv.messages.length === 0) {
    conv.title = cleanContent.length > 50 ? `${cleanContent.slice(0, 47)}...` : cleanContent;
  }

  conv.messages.push({
    role: 'user',
    content: cleanContent,
    citations: [],
    createdAt: new Date(),
  });

  await conv.save();
  return conv;
};

/**
 * Appends an assistant response message with citations (Server-side only, used by AI-day).
 *
 * @param {Object} params - Response parameters.
 * @param {string} params.conversationId - Target conversation ID.
 * @param {string} params.content - Assistant generated answer text.
 * @param {Array<Object>} [params.citations=[]] - Associated source citations.
 * @returns {Promise<Object>} Updated conversation object.
 */
export const appendAssistantMessage = async ({ conversationId, content, citations = [] }) => {
  const conv = await Conversation.findById(conversationId);
  if (!conv) {
    throw new ApiError(404, 'NOT_FOUND', 'Conversation not found');
  }

  if (conv.messages.length >= 200) {
    throw new ApiError(409, 'CONFLICT', 'Conversation message limit of 200 reached');
  }

  conv.messages.push({
    role: 'assistant',
    content: content.trim(),
    citations,
    createdAt: new Date(),
  });

  await conv.save();
  return conv;
};

/**
 * Deletes a single conversation owned by the authenticated user.
 * Emits 'history.delete' audit event.
 *
 * @param {Object} params - Delete parameters.
 * @param {string} params.conversationId - Conversation ID.
 * @param {Object} params.user - User context ({ id, role }).
 * @param {string} [params.requestId] - HTTP request ID.
 * @returns {Promise<{deleted: boolean}>}
 */
export const deleteConversation = async ({ conversationId, user, requestId }) => {
  const conv = await Conversation.findOne({ _id: conversationId, userId: user.id });
  if (!conv) {
    throw new ApiError(404, 'NOT_FOUND', 'Conversation not found');
  }

  await Conversation.deleteOne({ _id: conversationId });

  await logAudit({
    actorId: user.id,
    actorRole: user.role,
    action: 'history.delete',
    resourceType: 'Conversation',
    resourceId: conversationId,
    outcome: 'success',
    requestId,
  });

  return { deleted: true };
};

/**
 * Clears all conversations owned by the authenticated user.
 * Emits 'history.clear' audit event with deletedCount.
 *
 * @param {Object} params - Clear parameters.
 * @param {Object} params.user - User context ({ id, role }).
 * @param {string} [params.requestId] - HTTP request ID.
 * @returns {Promise<{deletedCount: number}>}
 */
export const clearAllConversations = async ({ user, requestId }) => {
  const result = await Conversation.deleteMany({ userId: user.id });

  await logAudit({
    actorId: user.id,
    actorRole: user.role,
    action: 'history.clear',
    resourceType: 'Conversation',
    outcome: 'success',
    requestId,
    metadata: { deletedCount: result.deletedCount },
  });

  return { deletedCount: result.deletedCount };
};

export default {
  createConversation,
  listConversations,
  getConversationById,
  appendUserMessage,
  appendAssistantMessage,
  deleteConversation,
  clearAllConversations,
};
