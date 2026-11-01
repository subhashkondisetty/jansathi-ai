/**
 * @fileoverview Conversation history routes protected by authentication.
 */

import { Router } from 'express';
import {
  createConversation,
  listConversations,
  getConversationById,
  appendMessage,
  deleteConversation,
  clearAllConversations,
} from '../controllers/historyController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createConversationSchema,
  listConversationsQuerySchema,
  conversationIdParamSchema,
  appendMessageSchema,
} from '../validators/historyValidators.js';

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: createConversationSchema }), createConversation);
router.get('/', validate({ query: listConversationsQuerySchema }), listConversations);
router.delete('/', clearAllConversations);

router.get('/:id', validate({ params: conversationIdParamSchema }), getConversationById);
router.post(
  '/:id/messages',
  validate({ params: conversationIdParamSchema, body: appendMessageSchema }),
  appendMessage
);
router.delete('/:id', validate({ params: conversationIdParamSchema }), deleteConversation);

export default router;
