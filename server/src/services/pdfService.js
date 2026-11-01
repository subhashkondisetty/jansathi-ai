/**
 * @fileoverview PDF extraction service utilizing pdfjs-dist legacy build for Node.js.
 */

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const workerUrl = new URL(
  '../../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
  import.meta.url
).href;
if (pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
}

/**
 * Extracts line-ordered text, metadata, and page counts from a PDF buffer.
 *
 * @param {Buffer|Uint8Array} buffer - Raw PDF binary buffer.
 * @returns {Promise<{
 *   pages: Array<{pageNumber: number, text: string, charCount: number, isEmpty: boolean, method: string}>,
 *   metadata: {pdfTitle?: string, pdfAuthor?: string, pdfCreatedAt?: Date},
 *   pageCount: number
 * }>}
 */
export const extractPages = async (buffer) => {
  if (!buffer || buffer.length === 0) {
    throw new ApiError(422, 'PDF_EMPTY', 'PDF buffer is empty');
  }

  const uint8Data = Buffer.isBuffer(buffer) ? new Uint8Array(buffer) : buffer;
  let loadingTask = null;
  let doc = null;

  try {
    loadingTask = pdfjsLib.getDocument({
      data: uint8Data,
      disableFontFace: true,
      isEvalSupported: false,
      useSystemFonts: false,
    });

    doc = await loadingTask.promise;
  } catch (err) {
    if (loadingTask) {
      try {
        await loadingTask.destroy();
      } catch {
        // Ignore failure teardown destruction error
      }
    }

    const msg = (err && err.message) || '';
    if (err.name === 'PasswordException' || msg.includes('password') || msg.includes('encrypted')) {
      throw new ApiError(422, 'PDF_ENCRYPTED', 'PDF is password protected or encrypted');
    }
    throw new ApiError(422, 'PDF_CORRUPT', `Failed to parse PDF document: ${msg}`);
  }

  try {
    const numPages = doc.numPages;

    if (numPages === 0) {
      throw new ApiError(422, 'PDF_EMPTY', 'PDF document contains zero pages');
    }

    if (numPages > env.MAX_PDF_PAGES) {
      throw new ApiError(
        413,
        'PDF_TOO_MANY_PAGES',
        `PDF contains ${numPages} pages, exceeding the maximum allowed limit of ${env.MAX_PDF_PAGES}`
      );
    }

    // Extract PDF metadata
    let pdfMetadata = {};
    try {
      const meta = await doc.getMetadata();
      if (meta && meta.info) {
        const info = meta.info;
        pdfMetadata = {
          pdfTitle: info.Title ? String(info.Title).trim() : undefined,
          pdfAuthor: info.Author ? String(info.Author).trim() : undefined,
          pdfCreatedAt: info.CreationDate ? new Date(info.CreationDate) : undefined,
        };
      }
    } catch {
      // Non-fatal if info dictionary cannot be read
    }

    // Extract pages sequentially
    const pages = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const textContent = await page.getTextContent();

      const lines = [];
      let currentLine = [];
      let lastY = null;

      for (const item of textContent.items) {
        if (!item.str && !item.hasEOL) continue;

        const y = item.transform ? Math.round(item.transform[5]) : lastY;

        // Line break detection: vertical position difference > 4pt
        if (lastY !== null && Math.abs(y - lastY) > 4) {
          if (currentLine.length > 0) {
            lines.push(currentLine.join(' ').trim());
            currentLine = [];
          }
        }

        currentLine.push(item.str);
        lastY = y;
      }

      if (currentLine.length > 0) {
        lines.push(currentLine.join(' ').trim());
      }

      const rawPageText = lines.filter(Boolean).join('\n').trim();
      const charCount = rawPageText.length;
      const isEmpty = charCount < 20;

      pages.push({
        pageNumber: pageNum,
        text: rawPageText,
        charCount,
        isEmpty,
        method: 'text',
      });
    }

    return {
      pages,
      metadata: pdfMetadata,
      pageCount: numPages,
    };
  } finally {
    if (doc && typeof doc.cleanup === 'function') {
      try {
        await doc.cleanup();
      } catch {
        // Ignore cleanup errors on teardown
      }
    }
    if (loadingTask) {
      try {
        await loadingTask.destroy();
      } catch {
        // Ignore destruction errors on cleanup
      }
    }
  }
};

export default {
  extractPages,
};
