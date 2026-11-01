/**
 * @fileoverview HTML content extraction service using Cheerio.
 * Cleans web pages and segments content by h1-h3 heading tags into page sections.
 */

import * as cheerio from 'cheerio';
import { ApiError } from '../utils/ApiError.js';

/**
 * Extracts structured sections from HTML buffer, splitting on h1-h3 headings.
 *
 * @param {Buffer|string} buffer - Raw HTML buffer or string.
 * @returns {Promise<{
 *   pages: Array<{pageNumber: number, sectionHeading?: string, text: string, charCount: number, isEmpty: boolean, extractionMethod: string}>,
 *   pageCount: number
 * }>}
 */
export const extractSections = async (buffer) => {
  if (!buffer || buffer.length === 0) {
    throw new ApiError(422, 'HTML_EMPTY', 'HTML buffer is empty');
  }

  const html = Buffer.isBuffer(buffer) ? buffer.toString('utf-8') : String(buffer);
  const $ = cheerio.load(html);

  // Remove irrelevant and non-content elements
  $('script, style, nav, header, footer, aside, form, noscript, iframe, svg').remove();

  const sections = [];
  let currentHeading = undefined;
  let currentParagraphs = [];

  const flushSection = () => {
    const text = currentParagraphs.join('\n\n').trim();
    if (text || currentHeading) {
      sections.push({
        sectionHeading: currentHeading,
        text,
      });
    }
    currentParagraphs = [];
  };

  // Traverse body elements in document order
  const elements = $('body').find('*');

  if (elements.length === 0) {
    // If no body or empty tags, fallback to body text
    const text = $('body').text().trim();
    return {
      pages: [
        {
          pageNumber: 1,
          sectionHeading: undefined,
          text,
          charCount: text.length,
          isEmpty: text.length < 20,
          extractionMethod: 'html',
        },
      ],
      pageCount: 1,
    };
  }

  $('body')
    .find('h1, h2, h3, p, div, li, article, section')
    .each((_, el) => {
      const tagName = el.tagName.toLowerCase();
      const node = $(el);

      // Only inspect direct element text without nested duplicates
      if (['h1', 'h2', 'h3'].includes(tagName)) {
        const headingText = node.text().trim();
        if (headingText) {
          flushSection();
          currentHeading = headingText;
        }
      } else if (['p', 'li'].includes(tagName)) {
        const paraText = node.text().trim();
        if (paraText) {
          currentParagraphs.push(paraText);
        }
      }
    });

  flushSection();

  // If heading traversal produced 0 sections, fall back to plain text
  if (sections.length === 0) {
    const fullText = $('body').text().replace(/\s+/g, ' ').trim();
    sections.push({
      sectionHeading: undefined,
      text: fullText,
    });
  }

  const pages = sections.map((sec, idx) => {
    const charCount = sec.text.length;
    return {
      pageNumber: idx + 1,
      sectionHeading: sec.sectionHeading,
      text: sec.text,
      charCount,
      isEmpty: charCount < 20,
      extractionMethod: 'html',
    };
  });

  return {
    pages,
    pageCount: pages.length,
  };
};

export default {
  extractSections,
};
