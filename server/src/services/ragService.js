/**
 * @fileoverview Retrieval-Augmented Generation (RAG) service hook shell.
 *
 * =========================================================================================
 * AI-DAY: Orchestrate query retrieval (hybrid text + vector via retrievalService),
 * prompt assembly with grounding citations, and structured answer synthesis.
 * Ensure answers strictly quote official sources and declare limitations.
 * =========================================================================================
 */

import { NotImplementedError } from '../utils/ApiError.js';

/**
 * Returns availability of question-answering RAG service.
 *
 * @returns {boolean} False until AI integration phase.
 */
export const isAvailable = () => false;

/**
 * @typedef {Object} Citation
 * @property {string} id - Citation local identifier (e.g., "c1").
 * @property {string} documentId - Document ObjectId string.
 * @property {string} chunkId - DocumentChunk ObjectId string.
 * @property {string} title - Document title.
 * @property {string|null} issuingAuthority - Issuing authority.
 * @property {string|null} sourceUrl - Official source URL.
 * @property {number} pageStart - Start page number.
 * @property {number} pageEnd - End page number.
 * @property {string|null} sectionHeading - Section heading.
 * @property {string|null} publishedAt - Publication date ISO string.
 * @property {string|null} lastUpdatedAt - Update date ISO string.
 * @property {string} fetchedAt - Ingestion date ISO string.
 * @property {string} quote - Short verbatim excerpt (max 300 chars).
 */

/**
 * @typedef {Object} Section
 * @property {string} text - Explanatory narrative text.
 * @property {Array<string>} bullets - Specific bullet points.
 * @property {'confirmed'|'not_found'|'conflicting'|'unverified'} status - Verification status.
 * @property {Array<string>} citationIds - Citation reference IDs.
 */

/**
 * @typedef {Object} AskResponseData
 * @property {string} conversationId - Conversation session ID.
 * @property {string} messageId - Message ID.
 * @property {string} language - Response language code.
 * @property {Object} answer - Structured answer sections.
 * @property {Section} answer.summary - Main summary.
 * @property {Section|null} answer.eligibility - Eligibility criteria.
 * @property {Section|null} answer.benefits - Financial or support benefits.
 * @property {Section|null} answer.documents - Required documentation.
 * @property {Section|null} answer.deadline - Application deadline.
 * @property {Section|null} answer.applicationProcess - Step-by-step application instructions.
 * @property {Array<string>} answer.limitations - Known limitations or unknowns.
 * @property {Array<Citation>} citations - Grounding source citations.
 * @property {Array<string>} relatedQuestions - Suggested follow-up civic questions.
 * @property {Object} retrieval - Search diagnostics.
 * @property {'text'|'vector'|'hybrid'} retrieval.strategy - Search strategy employed.
 * @property {number} retrieval.resultCount - Number of retrieved chunks evaluated.
 * @property {string} disclaimer - Official civic disclaimer.
 */

/**
 * Answers citizen questions using grounded civic document retrieval and LLM synthesis.
 *
 * @param {Object} params - Query parameters.
 * @param {string} params.question - Citizen question text (3-1000 chars).
 * @param {string} [params.language='en'] - Preferred language.
 * @param {Object} params.user - Current user context ({ id, role }).
 * @param {string} [params.conversationId] - Active conversation session ID.
 * @param {string} [params.documentId] - Optional document focus filter.
 * @param {Object} [params.filters] - Category, docType, or issuingAuthority filters.
 * @returns {Promise<AskResponseData>} Complete structured answer.
 * @throws {NotImplementedError} 501 NOT_IMPLEMENTED shell.
 */
export async function answerQuestion({
  question,
  language,
  user,
  conversationId,
  documentId,
  filters,
}) {
  // AI-DAY:
  // 1. Retrieve top chunks via retrievalService.retrieve({ query: question, filters, user, limit: 10 })
  // 2. Synthesize structured answer via aiService.generateStructured
  // 3. Append user & assistant messages to conversationService
  void question;
  void language;
  void user;
  void conversationId;
  void documentId;
  void filters;
  throw new NotImplementedError('ragService.answerQuestion');
}

export default {
  isAvailable,
  answerQuestion,
};
