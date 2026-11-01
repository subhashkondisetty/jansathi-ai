/**
 * @fileoverview History controller managing conversation dialogues, message persistence,
 * and user-scoped deletion endpoints.
 */

import * as conversationService from '../services/conversationService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createConversation = asyncHandler(async (req, res) => {
  const conv = await conversationService.createConversation({
    userId: req.user.id,
    title: req.body.title,
    mode: req.body.mode,
    language: req.body.language,
    documentId: req.body.documentId,
  });

  return sendSuccess(res, conv, undefined, 201);
});

export const listConversations = asyncHandler(async (req, res) => {
  const result = await conversationService.listConversations({
    userId: req.user.id,
    mode: req.query.mode,
    page: req.query.page,
    limit: req.query.limit,
  });

  return sendPaginated(
    res,
    result.items,
    {
      page: result.page,
      limit: result.limit,
      total: result.total,
    },
    200
  );
});

export const getConversationById = asyncHandler(async (req, res) => {
  const conv = await conversationService.getConversationById({
    conversationId: req.params.id,
    userId: req.user.id,
  });

  return sendSuccess(res, conv, undefined, 200);
});

export const appendMessage = asyncHandler(async (req, res) => {
  const conv = await conversationService.appendUserMessage({
    conversationId: req.params.id,
    userId: req.user.id,
    content: req.body.content,
  });

  return sendSuccess(res, conv, undefined, 200);
});

export const deleteConversation = asyncHandler(async (req, res) => {
  const result = await conversationService.deleteConversation({
    conversationId: req.params.id,
    user: req.user,
    requestId: req.id,
  });

  return sendSuccess(res, result, undefined, 200);
});

export const clearAllConversations = asyncHandler(async (req, res) => {
  const result = await conversationService.clearAllConversations({
    user: req.user,
    requestId: req.id,
  });

  return sendSuccess(res, result, undefined, 200);
});

export default {
  createConversation,
  listConversations,
  getConversationById,
  appendMessage,
  deleteConversation,
  clearAllConversations,
};
