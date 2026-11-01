/**
 * @fileoverview Pure, deterministic document chunking service.
 * Segments document pages into search-optimized text chunks with denormalized metadata.
 */

import { env } from '../config/env.js';

/**
 * Determines whether a line resembles a section or subsection heading.
 *
 * @param {string} line - Single line of text.
 * @returns {boolean} True if line is likely a heading.
 */
export const isSectionHeading = (line) => {
  if (!line || typeof line !== 'string') return false;
  const trimmed = line.trim();

  // Headings are typically between 3 and 120 characters
  if (trimmed.length < 3 || trimmed.length > 120) return false;

  // Headings usually do not end with terminal punctuation
  if (/[.?!।,;:]$/.test(trimmed)) return false;

  // Pattern 1: Numbered headings (e.g. "1. Introduction", "2.1 Scope", "Section 4")
  if (/^(?:section\s+)?\d+(?:\.\d+)*\.?\s+\p{L}/iu.test(trimmed)) {
    return true;
  }

  // Pattern 2: ALL CAPS heading with at least 3 alphabetic characters
  const latinLetters = trimmed.match(/[A-Za-z]/g);
  if (latinLetters && latinLetters.length >= 3 && trimmed === trimmed.toUpperCase()) {
    return true;
  }

  // Pattern 3: Short title line (< 60 chars) starting with a letter
  if (trimmed.length <= 60 && /^\p{L}/u.test(trimmed) && !trimmed.includes('\n')) {
    return true;
  }

  return false;
};

/**
 * Splits a text block into sentences across paragraphs and sentence terminators.
 * Includes Western punctuation (., !, ?) and Devanagari danda (।).
 *
 * @param {string} text - Raw page text.
 * @param {number} maxChars - Hard limit for single sentences.
 * @returns {Array<string>} Array of extracted sentences.
 */
export const splitIntoSentences = (text, maxChars = 1500) => {
  if (!text) return [];

  const sentences = [];
  const paragraphs = text.split(/\n\n+/);

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    // Match sentences ending with ., ?, !, or Devanagari danda (।)
    const rawMatches = trimmedPara.match(/[^.?!।\n]+(?:[.?!।]+|$)/g) || [trimmedPara];

    for (const match of rawMatches) {
      const sentence = match.trim();
      if (!sentence) continue;

      if (sentence.length <= maxChars) {
        sentences.push(sentence);
      } else {
        // Hard-split overlong sentences on whitespace
        const words = sentence.split(/\s+/);
        let currentPart = '';

        for (const word of words) {
          if ((currentPart + ' ' + word).trim().length <= maxChars) {
            currentPart = (currentPart + ' ' + word).trim();
          } else {
            if (currentPart) sentences.push(currentPart);
            // If single word is longer than maxChars, hard slice
            if (word.length > maxChars) {
              for (let i = 0; i < word.length; i += maxChars) {
                sentences.push(word.slice(i, i + maxChars));
              }
              currentPart = '';
            } else {
              currentPart = word;
            }
          }
        }
        if (currentPart) {
          sentences.push(currentPart);
        }
      }
    }
  }

  return sentences;
};

/**
 * Chunks an array of pages into overlapping, metadata-enriched chunks.
 *
 * @param {Array<{pageNumber: number, text: string, sectionHeading?: string, isEmpty?: boolean}>} pages
 * @param {Object} metadata - Denormalized Document metadata.
 * @param {Object} [options] - Chunking configuration options.
 * @param {number} [options.targetChars] - Target chunk character length.
 * @param {number} [options.maxChars] - Maximum allowed chunk character length.
 * @param {number} [options.overlapChars] - Trailing context overlap character length.
 * @returns {Array<Object>} Deterministic array of chunk objects ready for DB persistence.
 */
export const chunkPages = (pages, metadata = {}, options = {}) => {
  if (!Array.isArray(pages) || pages.length === 0) {
    return [];
  }

  const targetChars = options.targetChars || env.CHUNK_TARGET_CHARS || 1000;
  const maxChars = options.maxChars || env.CHUNK_MAX_CHARS || 1500;
  const overlapChars =
    options.overlapChars !== undefined ? options.overlapChars : env.CHUNK_OVERLAP_CHARS || 150;

  // 1. Collect all sentences with page references and section heading tracking
  const taggedSentences = [];
  let activeHeading = pages[0]?.sectionHeading || undefined;

  for (const page of pages) {
    if (page.isEmpty || !page.text) continue;

    if (page.sectionHeading) {
      activeHeading = page.sectionHeading.trim();
    }

    const lines = page.text.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (isSectionHeading(trimmedLine)) {
        activeHeading = trimmedLine;
      }

      const sentences = splitIntoSentences(trimmedLine, maxChars);
      for (const s of sentences) {
        taggedSentences.push({
          text: s,
          pageNumber: page.pageNumber,
          sectionHeading: activeHeading,
        });
      }
    }
  }

  if (taggedSentences.length === 0) {
    return [];
  }

  // 2. Pack sentences into chunks respecting targetChars and maxChars
  const rawChunks = [];
  let currentSentences = [];
  let currentLength = 0;

  for (let i = 0; i < taggedSentences.length; i++) {
    const s = taggedSentences[i];
    const projectedLength = currentLength === 0 ? s.text.length : currentLength + 1 + s.text.length;

    if (
      currentSentences.length > 0 &&
      (projectedLength > maxChars || currentLength >= targetChars)
    ) {
      // Finalize current chunk
      const chunkText = currentSentences.map((item) => item.text).join(' ');
      const pageStart = currentSentences[0].pageNumber;
      const pageEnd = currentSentences[currentSentences.length - 1].pageNumber;
      const heading = currentSentences.find((item) => item.sectionHeading)?.sectionHeading;

      rawChunks.push({
        text: chunkText,
        pageStart,
        pageEnd,
        sectionHeading: heading,
      });

      // Prepare overlap for next chunk
      const overlapSentences = [];
      let overlapLen = 0;

      if (overlapChars > 0) {
        for (let j = currentSentences.length - 1; j >= 0; j--) {
          const cand = currentSentences[j];
          if (overlapLen + cand.text.length <= overlapChars) {
            overlapSentences.unshift(cand);
            overlapLen += cand.text.length + 1;
          } else {
            break;
          }
        }
      }

      currentSentences = [...overlapSentences, s];
      currentLength = currentSentences.map((item) => item.text).join(' ').length;
    } else {
      currentSentences.push(s);
      currentLength = projectedLength;
    }
  }

  if (currentSentences.length > 0) {
    const chunkText = currentSentences.map((item) => item.text).join(' ');
    const pageStart = currentSentences[0].pageNumber;
    const pageEnd = currentSentences[currentSentences.length - 1].pageNumber;
    const heading = currentSentences.find((item) => item.sectionHeading)?.sectionHeading;

    rawChunks.push({
      text: chunkText,
      pageStart,
      pageEnd,
      sectionHeading: heading,
    });
  }

  // 3. Merge short fragments (< 100 characters) into neighbours
  const mergedChunks = [];
  for (let i = 0; i < rawChunks.length; i++) {
    const chunk = rawChunks[i];

    if (chunk.text.length < 100 && rawChunks.length > 1) {
      if (mergedChunks.length > 0) {
        // Merge into previous chunk if within maxChars
        const prev = mergedChunks[mergedChunks.length - 1];
        if (prev.text.length + 1 + chunk.text.length <= maxChars) {
          prev.text = prev.text + ' ' + chunk.text;
          prev.pageEnd = Math.max(prev.pageEnd, chunk.pageEnd);
          continue;
        }
      }
      if (i + 1 < rawChunks.length) {
        // Merge into next chunk
        const next = rawChunks[i + 1];
        next.text = chunk.text + ' ' + next.text;
        next.pageStart = Math.min(chunk.pageStart, next.pageStart);
        continue;
      }
    }

    mergedChunks.push({ ...chunk });
  }

  // 4. Denormalize document metadata onto each chunk
  return mergedChunks.map((chunk, index) => ({
    documentId: metadata.documentId,
    chunkIndex: index,
    text: chunk.text,
    charCount: chunk.text.length,
    title: metadata.title || '',
    sourceUrl: metadata.sourceUrl || '',
    issuingAuthority: metadata.issuingAuthority || '',
    docType: metadata.docType || 'other',
    category: metadata.category || 'other',
    language: metadata.language || 'unknown',
    visibility: metadata.visibility || 'private',
    ownerId: metadata.ownerId || undefined,
    isLatest: metadata.isLatest !== undefined ? metadata.isLatest : true,
    version: metadata.version || 1,
    checksum: metadata.checksum || '',
    pageStart: chunk.pageStart,
    pageEnd: chunk.pageEnd,
    sectionHeading: chunk.sectionHeading || undefined,
    publishedAt: metadata.publishedAt || undefined,
    lastUpdatedAt: metadata.lastUpdatedAt || undefined,
    fetchedAt: metadata.fetchedAt || undefined,
  }));
};

export default {
  isSectionHeading,
  splitIntoSentences,
  chunkPages,
};
