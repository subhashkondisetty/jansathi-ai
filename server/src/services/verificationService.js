/**
 * @fileoverview Civic claim verification service hook shell.
 *
 * =========================================================================================
 * AI-DAY: Cross-examine factual claims (e.g. viral social media posts about government grants)
 * against official circulars, acts, and gazette notifications. Classify stance and produce
 * evidence citations. Persist result using claimService.createClaim.
 * =========================================================================================
 */

import { NotImplementedError } from '../utils/ApiError.js';

/**
 * Returns availability of claim verification service.
 *
 * @returns {boolean} False until AI integration phase.
 */
export const isAvailable = () => false;

/**
 * @typedef {Object} EvidenceItem
 * @property {string} citationId - Citation reference ID.
 * @property {'supports'|'contradicts'|'related'} stance - Relationship to the submitted claim.
 */

/**
 * @typedef {Object} VerifyResponseData
 * @property {string} claimId - Persisted claim assessment ID.
 * @property {'supported'|'contradicted'|'unverified'} assessment - Overall fact-check stance.
 * @property {string} explanation - Clear citizen-facing explanation of the finding.
 * @property {Array<EvidenceItem>} evidence - Supporting or refuting evidence items.
 * @property {Array<Object>} citations - Grounding citations from official sources.
 * @property {Array<string>} limitations - Missing official information or caveat notes.
 * @property {string} disclaimer - Official verification disclaimer.
 */

/**
 * Verifies a civic claim against official government publications.
 *
 * @param {Object} params - Verification parameters.
 * @param {string} params.claim - Claim text to verify (10-2000 chars).
 * @param {string} [params.language='en'] - Output language.
 * @param {Object} params.user - Current user context ({ id, role }).
 * @returns {Promise<VerifyResponseData>} Fact-check assessment outcome.
 * @throws {NotImplementedError} 501 NOT_IMPLEMENTED shell.
 */
export async function verifyClaim({ claim, language, user }) {
  // AI-DAY:
  // 1. Search government chunks for factual claims via retrievalService
  // 2. Classify claim stance ('supported'|'contradicted'|'unverified')
  // 3. Persist record via claimService.createClaim
  void claim;
  void language;
  void user;
  throw new NotImplementedError('verificationService.verifyClaim');
}

export default {
  isAvailable,
  verifyClaim,
};
