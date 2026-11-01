/**
 * @fileoverview Civic claim verification controller.
 *
 * NOTE: The success execution path in this controller represents the production contract
 * for subsequent AI verification phases. In Phase 7, verificationService throws NotImplementedError,
 * triggering the standard 501 NOT_IMPLEMENTED HTTP envelope.
 */

import * as verificationService from '../services/verificationService.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyClaim = asyncHandler(async (req, res) => {
  const { claim, language } = req.body;

  const result = await verificationService.verifyClaim({
    claim,
    language: language || req.user.language || 'en',
    user: req.user,
  });

  return sendSuccess(res, result, undefined, 200);
});

export default {
  verifyClaim,
};
