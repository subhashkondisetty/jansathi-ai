/**
 * @fileoverview AI question-answering, eligibility reasoning, and status routes.
 * Middleware sequence: authenticate -> createAiLimiter -> validate -> controller.
 */

import { Router } from 'express';
import { ask, checkEligibility, getStatus } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';
import { createAiLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { askAiSchema, eligibilityCheckSchema } from '../validators/aiValidators.js';

const router = Router();

// Gated for authenticated users
router.use(authenticate);

// Capability status probe
router.get('/status', getStatus);

// Question answering shell
router.post('/ask', createAiLimiter(), validate({ body: askAiSchema }), ask);

// Eligibility evaluation shell
router.post(
  '/eligibility',
  createAiLimiter(),
  validate({ body: eligibilityCheckSchema }),
  checkEligibility
);

export default router;
