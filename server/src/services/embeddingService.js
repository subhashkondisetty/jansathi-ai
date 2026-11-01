/**
 * @fileoverview Embedding service hook shell.
 *
 * =========================================================================================
 * AI-DAY: Implement embedding generation via multilingual embedding models (e.g., text-embedding-004
 * or local transformer models). Generates fixed-dimension floating-point vectors for chunk
 * ingestion and search queries.
 * =========================================================================================
 */

import { NotImplementedError } from '../utils/ApiError.js';

/**
 * Returns availability of embedding generation.
 *
 * @returns {boolean} False until AI integration phase.
 */
export const isAvailable = () => false;

/**
 * Generates vector embeddings for an array of input texts.
 *
 * @param {Array<string>} texts - Batch of raw text strings.
 * @returns {Promise<Array<Array<number>>>} Array of embedding vectors.
 * @throws {NotImplementedError} 501 NOT_IMPLEMENTED shell.
 */
export async function embedTexts(texts) {
  // AI-DAY: Batch embed texts with rate-limiting, chunk batching, and dimensional verification
  void texts;
  throw new NotImplementedError('embeddingService.embedTexts');
}

/**
 * Generates vector embedding for a single search or query text.
 *
 * @param {string} text - Query text.
 * @returns {Promise<Array<number>>} Dense vector representation.
 * @throws {NotImplementedError} 501 NOT_IMPLEMENTED shell.
 */
export async function embedQuery(text) {
  // AI-DAY: Embed query text using task-type RETRIEVAL_QUERY
  void text;
  throw new NotImplementedError('embeddingService.embedQuery');
}

export default {
  isAvailable,
  embedTexts,
  embedQuery,
};
