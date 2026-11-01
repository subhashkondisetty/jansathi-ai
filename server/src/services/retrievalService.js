/**
 * @fileoverview Retrieval service providing MongoDB full-text search with metadata filters
 * and visibility gating. Serves as the primary content retrieval abstraction for citizen search
 * and RAG pipelines.
 *
 * =========================================================================================
 * AI-DAY: add a vector strategy ($vectorSearch) and optional hybrid merge here;
 * keep this input/output shape.
 * =========================================================================================
 */

import { Document } from '../models/Document.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Extracts a ~300 character window of plain text surrounding the first matched search term.
 * Removes HTML tags and cleans boundary whitespace.
 *
 * @param {string} text - Raw chunk content.
 * @param {string} query - Cleaned query terms.
 * @param {number} [targetLen=300] - Desired snippet length.
 * @returns {string} Plain text snippet.
 */
export const extractSnippet = (text, query, targetLen = 300) => {
  if (!text) return '';

  // Strip HTML tags and normalize spacing
  const plain = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= targetLen) {
    return plain;
  }

  // Find index of first occurring query term (terms with >= 2 letters)
  const cleanPhrase = query.trim().toLowerCase();
  const lowerText = plain.toLowerCase();
  let matchIndex = -1;

  if (cleanPhrase.length >= 3 && lowerText.includes(cleanPhrase)) {
    matchIndex = lowerText.indexOf(cleanPhrase);
  } else {
    const terms = query
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((t) => t.length >= 2);

    for (const term of terms) {
      const idx = lowerText.indexOf(term);
      if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
        matchIndex = idx;
      }
    }
  }

  if (matchIndex === -1) {
    // Fallback: take start of text
    let cut = plain.slice(0, targetLen);
    const lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > 200) {
      cut = cut.slice(0, lastSpace);
    }
    return `${cut}...`;
  }

  // Calculate balanced window around match
  const half = Math.floor(targetLen / 2);
  let start = Math.max(0, matchIndex - half);
  let end = Math.min(plain.length, matchIndex + half);

  // Align start to preceding whitespace
  if (start > 0) {
    const spaceIdx = plain.indexOf(' ', start);
    if (spaceIdx !== -1 && spaceIdx < matchIndex) {
      start = spaceIdx + 1;
    }
  }

  // Align end to following whitespace
  if (end < plain.length) {
    const spaceIdx = plain.lastIndexOf(' ', end);
    if (spaceIdx > matchIndex) {
      end = spaceIdx;
    }
  }

  let snippet = plain.slice(start, end).trim();
  if (start > 0) snippet = `...${snippet}`;
  if (end < plain.length) snippet = `${snippet}...`;

  return snippet;
};

/**
 * Returns current retrieval strategy name.
 *
 * @returns {'text'} Strategy identifier.
 */
export const getStrategy = () => 'text';

/**
 * Returns availability of the text retrieval service.
 *
 * @returns {boolean} True for MongoDB text search.
 */
export const isAvailable = () => true;

/**
 * Executes full-text search with metadata filtering, document status validation,
 * and strict visibility scoping.
 *
 * AI-DAY: add a vector strategy ($vectorSearch) and optional hybrid merge here; keep this input/output shape.
 *
 * @param {Object} params - Search parameters.
 * @param {string} params.query - Keyword query text.
 * @param {Object} [params.filters={}] - Optional metadata filters.
 * @param {number} [params.limit=8] - Page size limit (capped at 20).
 * @param {number} [params.page=1] - Page number.
 * @param {Object} params.user - Current authenticated user context ({ id, role }).
 * @param {boolean} [params.includeText=true] - Whether to include full chunk text.
 * @param {boolean} [params.includeOlderVersions=false] - Whether to include deprecated document chunks.
 * @returns {Promise<{strategy: string, query: string, total: number, results: Array<Object>}>}
 */
export async function retrieve({
  query,
  filters = {},
  limit = 8,
  page = 1,
  user,
  includeText = true,
  includeOlderVersions = false,
}) {
  // 1. Sanitize query
  if (!query || typeof query !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Search query cannot be empty');
  }

  const cleanQuery = query.trim().replace(/\s+/g, ' ');
  if (!cleanQuery) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Search query cannot be empty');
  }

  if (cleanQuery.length > 200) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Search query cannot exceed 200 characters');
  }

  // 2. Resolve ready documents to enforce "only chunks of documents with status ready"
  const readyDocs = await Document.find({ status: 'ready' }).select('_id').lean();
  const readyDocIds = readyDocs.map((d) => d._id);

  const mongoFilter = {
    $text: { $search: cleanQuery },
    // Strict visibility rule: public documents OR owned private documents
    $or: [{ visibility: 'public' }, { ownerId: user.id }],
  };

  // Document ID scoping: intersect with ready documents
  if (filters.documentIds && filters.documentIds.length > 0) {
    const requested = (
      Array.isArray(filters.documentIds) ? filters.documentIds : [filters.documentIds]
    ).map((id) => String(id));

    const validIds = readyDocIds.filter((id) => requested.includes(String(id)));
    mongoFilter.documentId = { $in: validIds };
  } else {
    mongoFilter.documentId = { $in: readyDocIds };
  }

  // Version scoping
  if (!includeOlderVersions) {
    mongoFilter.isLatest = true;
  }

  // Metadata filters
  if (filters.category) mongoFilter.category = filters.category;
  if (filters.docType) mongoFilter.docType = filters.docType;
  if (filters.issuingAuthority) mongoFilter.issuingAuthority = filters.issuingAuthority.trim();
  if (filters.language) mongoFilter.language = filters.language;

  if (filters.publishedFrom || filters.publishedTo) {
    mongoFilter.publishedAt = {};
    if (filters.publishedFrom) mongoFilter.publishedAt.$gte = new Date(filters.publishedFrom);
    if (filters.publishedTo) mongoFilter.publishedAt.$lte = new Date(filters.publishedTo);
  }

  // 3. Pagination & limits (capped at 20)
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(20, Math.max(1, Number(limit) || 8));
  const skip = (pageNum - 1) * limitNum;

  // 4. Query execution
  const [chunks, total] = await Promise.all([
    DocumentChunk.find(mongoFilter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' }, _id: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    DocumentChunk.countDocuments(mongoFilter),
  ]);

  // 5. Transform results to standard RetrievedChunk interface
  const results = chunks.map((chunk) => {
    const chunkObj = {
      chunkId: chunk._id.toString(),
      documentId: chunk.documentId.toString(),
      score: typeof chunk.score === 'number' ? Number(chunk.score.toFixed(4)) : 1,
      snippet: extractSnippet(chunk.text, cleanQuery),
      title: chunk.title,
      issuingAuthority: chunk.issuingAuthority || null,
      sourceUrl: chunk.sourceUrl || null,
      category: chunk.category,
      docType: chunk.docType,
      language: chunk.language,
      pageStart: chunk.pageStart || 1,
      pageEnd: chunk.pageEnd || 1,
      sectionHeading: chunk.sectionHeading || null,
      publishedAt: chunk.publishedAt ? chunk.publishedAt.toISOString() : null,
      lastUpdatedAt: chunk.lastUpdatedAt ? chunk.lastUpdatedAt.toISOString() : null,
      fetchedAt: chunk.fetchedAt ? chunk.fetchedAt.toISOString() : null,
      version: chunk.version || 1,
      isLatest: chunk.isLatest !== false,
    };

    if (includeText) {
      chunkObj.text = chunk.text;
    }

    return chunkObj;
  });

  return {
    strategy: 'text',
    query: cleanQuery,
    total,
    results,
  };
}

export default {
  retrieve,
  getStrategy,
  isAvailable,
  extractSnippet,
};
