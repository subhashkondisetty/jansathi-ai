/**
 * @fileoverview AI interaction controller handling question-answering, eligibility reasoning,
 * and AI capability readiness status probes.
 *
 * NOTE: The success execution paths in this controller represent the production contract
 * for subsequent AI integration phases. In Phase 7, the underlying services throw NotImplementedError,
 * triggering the standard 501 NOT_IMPLEMENTED HTTP envelope.
 */

import * as ragService from '../services/ragService.js';
import * as eligibilityService from '../services/eligibilityService.js';
import * as verificationService from '../services/verificationService.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const ask = asyncHandler(async (req, res) => {
  const { question, language, conversationId, documentId, filters } = req.body;

  const result = await ragService.answerQuestion({
    question,
    language: language || req.user.language || 'en',
    user: req.user,
    conversationId,
    documentId,
    filters,
  });

  return sendSuccess(res, result, undefined, 200);
});

export const checkEligibility = asyncHandler(async (req, res) => {
  const { query, documentIds, applicant, language } = req.body;

  const result = await eligibilityService.checkEligibility({
    query,
    documentIds,
    applicant,
    language: language || req.user.language || 'en',
    user: req.user,
  });

  return sendSuccess(res, result, undefined, 200);
});

export const getStatus = asyncHandler(async (_req, res) => {
  const askAvailable = ragService.isAvailable();
  const eligibilityAvailable = eligibilityService.isAvailable();
  const verifyAvailable = verificationService.isAvailable();

  const connected = askAvailable || eligibilityAvailable || verifyAvailable;

  return sendSuccess(
    res,
    {
      connected,
      features: {
        ask: askAvailable,
        eligibility: eligibilityAvailable,
        verify: verifyAvailable,
      },
    },
    undefined,
    200
  );
});

export default {
  ask,
  checkEligibility,
  getStatus,
};
