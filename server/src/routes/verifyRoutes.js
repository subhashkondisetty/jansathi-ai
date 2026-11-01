/**
 * @fileoverview Civic claim verification routes.
 * Middleware sequence: authenticate -> createAiLimiter -> validate -> controller.
 */

import { Router } from 'express';
import { verifyClaim } from '../controllers/verifyController.js';
import { authenticate } from '../middleware/auth.js';
import { createAiLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { verifyClaimSchema } from '../validators/aiValidators.js';

const router = Router();

router.use(authenticate);

// Factual claim verification shell
router.post('/claim', createAiLimiter(), validate({ body: verifyClaimSchema }), verifyClaim);

export default router;
