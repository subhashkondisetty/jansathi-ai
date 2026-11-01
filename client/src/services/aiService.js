/**
 * @fileoverview Citizen AI API service layer.
 * Connects directly to existing Express /api/ai and /api/verify endpoints.
 * Handles HTTP 501 NOT_IMPLEMENTED honestly and transparently.
 */

import api, { normalizeApiError } from './api.js';

/**
 * Probes the backend AI status hook.
 *
 * @returns {Promise<{connected: boolean, features: {ask: boolean, eligibility: boolean, verify: boolean}}>}
 */
export const getAiStatus = async () => {
  try {
    const res = await api.get('/ai/status');
    return (
      res.data?.data || {
        connected: false,
        features: { ask: false, eligibility: false, verify: false },
      }
    );
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Submits a citizen query to the Conversational RAG assistant.
 * Note: Currently returns HTTP 501 NOT_IMPLEMENTED as planned.
 *
 * @param {Object} payload - Assistant query payload.
 * @param {string} payload.question - Citizen question (3–1000 characters).
 * @param {string} [payload.language] - Language code ('en', 'te', 'hi', 'ta').
 * @param {string} [payload.conversationId] - MongoDB ObjectId of conversation.
 * @param {string} [payload.documentId] - MongoDB ObjectId of focused document.
 * @param {Object} [payload.filters] - Category, docType, or issuingAuthority filters.
 * @returns {Promise<Object>}
 */
export const askQuestion = async (payload) => {
  try {
    const res = await api.post('/ai/ask', payload);
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Submits applicant demographic criteria and target scheme for eligibility evaluation.
 * Note: Currently returns HTTP 501 NOT_IMPLEMENTED as planned.
 *
 * @param {Object} payload - Eligibility check payload.
 * @param {string} [payload.query] - Target scheme or benefit query (3–500 characters).
 * @param {string[]} [payload.documentIds] - Array of up to 5 document ObjectIds.
 * @param {Object} [payload.applicant] - Demographic applicant details.
 * @param {string} [payload.language] - Language code ('en', 'te', 'hi', 'ta').
 * @returns {Promise<Object>}
 */
export const evaluateEligibility = async (payload) => {
  try {
    const res = await api.post('/ai/eligibility', payload);
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

/**
 * Submits a public claim, circular, or rumor for cross-verification.
 * Note: Currently returns HTTP 501 NOT_IMPLEMENTED as planned.
 *
 * @param {Object} payload - Verification payload.
 * @param {string} payload.claim - Public claim text (10–2000 characters).
 * @param {string} [payload.language] - Language code ('en', 'te', 'hi', 'ta').
 * @returns {Promise<Object>}
 */
export const verifyClaim = async (payload) => {
  try {
    const res = await api.post('/verify/claim', payload);
    return res.data?.data;
  } catch (err) {
    throw normalizeApiError(err);
  }
};

export default {
  getAiStatus,
  askQuestion,
  evaluateEligibility,
  verifyClaim,
};
