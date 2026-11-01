/**
 * @fileoverview Eligibility reasoning service hook shell.
 *
 * =========================================================================================
 * AI-DAY: Parse structured eligibility criteria from scheme chunks and evaluate applicant
 * attributes against requirements deterministically, with LLM reasoning for nuanced terms.
 * Never claim guaranteed eligibility; always declare disclaimer.
 * =========================================================================================
 */

import { NotImplementedError } from '../utils/ApiError.js';

/**
 * Returns availability of eligibility reasoning engine.
 *
 * @returns {boolean} False until AI integration phase.
 */
export const isAvailable = () => false;

/**
 * @typedef {Object} CriterionResult
 * @property {string} id - Criterion ID (e.g., "crit_1").
 * @property {string} requirement - Requirement statement from official document.
 * @property {'match'|'no_match'|'unknown'} status - Match evaluation outcome.
 * @property {string|number|null} applicantValue - Corresponding applicant profile value evaluated.
 * @property {string} reason - Detailed justification for status.
 * @property {Array<string>} citationIds - Citation reference IDs.
 */

/**
 * @typedef {Object} SchemeEligibilityResult
 * @property {string|null} documentId - Scheme document ID.
 * @property {string} schemeTitle - Name of government scheme.
 * @property {string|null} sourceUrl - Official portal or scheme document URL.
 * @property {'likely_match'|'possible_match'|'not_match'|'insufficient_information'} overall - Aggregate evaluation.
 * @property {Array<CriterionResult>} criteria - Individual criteria breakdown.
 * @property {Object} deadline - Deadline status and text.
 * @property {string|null} deadline.text - Extracted deadline date or clause.
 * @property {'confirmed'|'not_confirmed'} deadline.status - Deadline verification status.
 * @property {Array<string>} deadline.citationIds - Citation reference IDs.
 * @property {Array<string>} notes - Important conditions or guidance notes.
 */

/**
 * @typedef {Object} EligibilityResponseData
 * @property {string} language - Response language.
 * @property {Array<SchemeEligibilityResult>} results - Evaluated schemes list.
 * @property {Array<Object>} citations - Grounding citations.
 * @property {string} disclaimer - Cautionary legal disclaimer.
 */

/**
 * Extracts eligibility rules from document chunk text.
 *
 * @param {Object} params - Extraction params.
 * @param {Array<Object>} params.chunks - Document chunks.
 * @returns {Promise<Array<Object>>} Extracted criteria list.
 * @throws {NotImplementedError} 501 NOT_IMPLEMENTED shell.
 */
export async function extractCriteria({ chunks }) {
  // AI-DAY: Extract demographic, education, and income rules using structured LLM schema
  void chunks;
  throw new NotImplementedError('eligibilityService.extractCriteria');
}

/**
 * Evaluates citizen eligibility across targeted government schemes.
 *
 * @param {Object} params - Evaluation parameters.
 * @param {string} [params.query] - Optional scheme keyword search (3-500 chars).
 * @param {Array<string>} [params.documentIds] - Specific scheme document IDs (max 5).
 * @param {Object} params.applicant - Applicant attributes (educationLevel, income, state, etc.).
 * @param {string} [params.language='en'] - Output language.
 * @param {Object} params.user - Current user context.
 * @returns {Promise<EligibilityResponseData>} Complete evaluation assessment.
 * @throws {NotImplementedError} 501 NOT_IMPLEMENTED shell.
 */
export async function checkEligibility({ query, documentIds, applicant, language, user }) {
  // AI-DAY:
  // 1. Retrieve scheme chunks matching query or documentIds
  // 2. Extract and match criteria against applicant profile
  // 3. Synthesize citations and overall eligibility status
  void query;
  void documentIds;
  void applicant;
  void language;
  void user;
  throw new NotImplementedError('eligibilityService.checkEligibility');
}

export default {
  isAvailable,
  extractCriteria,
  checkEligibility,
};
