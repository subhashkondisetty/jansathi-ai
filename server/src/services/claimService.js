/**
 * @fileoverview Claim service tracking citizen factual queries and verification assessments.
 *
 * =========================================================================================
 * AI-DAY: used by verificationService to persist verified claims and source evidence.
 * =========================================================================================
 */

import { Claim } from '../models/Claim.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Creates and persists a verified claim assessment record.
 *
 * @param {Object} params - Claim parameters.
 * @param {string} [params.userId] - User ID if authenticated.
 * @param {string} params.claimText - Raw claim text verified.
 * @param {string} [params.language='en'] - Language code.
 * @param {'supported'|'contradicted'|'unverified'} params.assessment - Assessment stance.
 * @param {string} [params.explanation] - Detailed reasoning.
 * @param {Array<Object>} [params.evidence=[]] - Supporting or contradicting source evidence items.
 * @returns {Promise<Object>} Created Claim document.
 */
export const createClaim = async ({
  userId,
  claimText,
  language = 'en',
  assessment,
  explanation,
  evidence = [],
}) => {
  if (!claimText || !claimText.trim()) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Claim text cannot be empty');
  }

  const claim = await Claim.create({
    userId: userId || undefined,
    claimText: claimText.trim(),
    language,
    assessment,
    explanation,
    evidence,
  });

  return claim;
};

export default {
  createClaim,
};
