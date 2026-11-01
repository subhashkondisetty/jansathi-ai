/**
 * @fileoverview Core AI interaction and LLM generation service hook shell.
 *
 * =========================================================================================
 * AI-DAY: Implement structured JSON output generation and cross-lingual translation using
 * official Gemini API or local inference runners. Must enforce strict schema validation
 * and safety filtering.
 * =========================================================================================
 */

import { NotImplementedError } from '../utils/ApiError.js';

/**
 * Returns availability of core LLM generation.
 *
 * @returns {boolean} False until AI integration phase.
 */
export const isAvailable = () => false;

/**
 * Generates a structured JSON object adhering strictly to a JSON Schema or Zod specification.
 *
 * @param {Object} params - Generation parameters.
 * @param {string} params.systemPrompt - System guidelines and governance instructions.
 * @param {string} params.userPrompt - User prompt containing context and specific question.
 * @param {Object} params.schema - JSON Schema for structured output validation.
 * @param {string} [params.language='en'] - Output language code ('en'|'te'|'hi'|'ta').
 * @returns {Promise<Object>} Structured JSON output object.
 * @throws {NotImplementedError} 501 NOT_IMPLEMENTED shell.
 */
export async function generateStructured({ systemPrompt, userPrompt, schema, language }) {
  // AI-DAY: Call LLM with responseSchema: schema and temperature: 0.1 for high fidelity
  void systemPrompt;
  void userPrompt;
  void schema;
  void language;
  throw new NotImplementedError('aiService.generateStructured');
}

/**
 * Translates arbitrary civic text between supported Indian languages.
 *
 * @param {Object} params - Translation parameters.
 * @param {string} params.text - Source text to translate.
 * @param {string} params.targetLanguage - Target ISO language code ('en'|'te'|'hi'|'ta').
 * @returns {Promise<string>} Translated text string.
 * @throws {NotImplementedError} 501 NOT_IMPLEMENTED shell.
 */
export async function translate({ text, targetLanguage }) {
  // AI-DAY: Translate government terms preserving terminology accuracy and official titles
  void text;
  void targetLanguage;
  throw new NotImplementedError('aiService.translate');
}

export default {
  isAvailable,
  generateStructured,
  translate,
};
