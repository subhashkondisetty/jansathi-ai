/**
 * @fileoverview Pure text cleaning functions for document ingestion.
 * Preserves Indic scripts (Telugu, Hindi, Tamil) via Unicode NFC normalization.
 */

/**
 * Strips unprintable control characters while preserving tabs, newlines, and carriage returns.
 * Uses character code inspection to avoid ESLint no-control-regex warnings.
 *
 * @param {string} text - Raw input string.
 * @returns {string} Cleaned string without unprintable control characters.
 */
export const stripControlChars = (text) => {
  if (!text) return '';
  const chars = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Keep tab (9), newline (10), carriage return (13), and printable characters (>= 32, not 127)
    if (code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127)) {
      chars.push(text[i]);
    }
  }
  return chars.join('');
};

/**
 * Determines whether a single trimmed line represents a page number indicator.
 * Examples: "12", "Page 12", "12 of 45", "Page 3 / 10", "- 5 -".
 *
 * @param {string} line - Trimmed line text.
 * @returns {boolean} True if line is a page number indicator.
 */
export const isPageNumberLine = (line) => {
  if (!line) return false;
  const trimmed = line.trim();
  const pageNumPattern =
    /^(?:[-–—\s]*)?(?:page|pg\.?)?\s*\d+\s*(?:(?:of|\/)\s*\d+)?(?:[-–—\s]*)?$/i;
  return pageNumPattern.test(trimmed);
};

/**
 * Normalizes and cleans a single text string:
 * 1. Unicode NFC normalization.
 * 2. Unprintable control character stripping (retaining tab and newline).
 * 3. Line ending unification (\r\n and \r to \n).
 * 4. De-hyphenation of Latin words split across line breaks (e.g., "exam-\nination" -> "examination").
 * 5. Removal of lines that consist only of page numbers.
 * 6. Horizontal space run collapsing and 3+ newline collapsing to paragraph breaks (\n\n).
 *
 * @param {string} text - Input text.
 * @returns {string} Cleaned, normalized text.
 */
export const cleanText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // 1. Unicode NFC Normalization (crucial for Indic scripts and composite glyphs)
  let cleaned = text.normalize('NFC');

  // 2. Strip unprintable control characters
  cleaned = stripControlChars(cleaned);

  // 3. Unify line endings to \n
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 4. De-hyphenate Latin words split across line breaks
  cleaned = cleaned.replace(/([A-Za-z])-[\n]+([A-Za-z])/g, '$1$2');

  // 5. Split into lines and filter out standalone page number lines
  const lines = cleaned.split('\n');
  const filteredLines = lines.filter((line) => !isPageNumberLine(line));
  cleaned = filteredLines.join('\n');

  // 6. Collapse runs of horizontal spaces/tabs (preserving newlines)
  cleaned = cleaned.replace(/[^\S\n]+/g, ' ');

  // 7. Collapse 3 or more consecutive newlines into 2 (paragraph break)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
};

/**
 * Cleans an array of extracted document pages.
 * If the document has at least 4 pages, identifies and removes conservative exact-match
 * headers and footers repeated on more than 50% of the pages.
 *
 * @param {Array<{pageNumber: number, text: string, sectionHeading?: string, extractionMethod?: string}>} pages
 * @returns {Array<{pageNumber: number, text: string, charCount: number, isEmpty: boolean, sectionHeading?: string, extractionMethod: string}>}
 */
export const cleanPages = (pages) => {
  if (!Array.isArray(pages)) {
    return [];
  }

  // 1. Detect repeated headers and footers if pages >= 4
  const repeatedLines = new Set();
  const pageCount = pages.length;

  if (pageCount >= 4) {
    const candidateCounts = new Map();

    pages.forEach((p) => {
      if (!p.text) return;
      const lines = p.text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !isPageNumberLine(l));

      if (lines.length === 0) return;

      // Inspect up to first 3 and last 3 non-empty lines per page
      const candidates = new Set();
      const topCandidates = lines.slice(0, 3);
      const bottomCandidates = lines.slice(Math.max(0, lines.length - 3));

      [...topCandidates, ...bottomCandidates].forEach((line) => {
        // Exclude generic very short lines to prevent over-filtering
        if (line.length >= 4) {
          candidates.add(line);
        }
      });

      candidates.forEach((cand) => {
        candidateCounts.set(cand, (candidateCounts.get(cand) || 0) + 1);
      });
    });

    const threshold = pageCount * 0.5;
    for (const [line, count] of candidateCounts.entries()) {
      if (count > threshold) {
        repeatedLines.add(line);
      }
    }
  }

  // 2. Clean each page and remove identified repeated header/footer lines
  return pages.map((page) => {
    let rawText = page.text || '';

    if (repeatedLines.size > 0 && rawText) {
      const lines = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
      const filtered = lines.filter((l) => !repeatedLines.has(l.trim()));
      rawText = filtered.join('\n');
    }

    const cleanedText = cleanText(rawText);
    const charCount = cleanedText.length;
    const isEmpty = charCount < 20;

    return {
      pageNumber: page.pageNumber,
      sectionHeading: page.sectionHeading ? page.sectionHeading.trim() : undefined,
      text: cleanedText,
      charCount,
      isEmpty,
      extractionMethod: page.extractionMethod || 'text',
    };
  });
};

export default {
  stripControlChars,
  isPageNumberLine,
  cleanText,
  cleanPages,
};
