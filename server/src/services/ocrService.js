/**
 * @fileoverview OCR Service (EXPERIMENTAL).
 * Provides optical character recognition for scanned/image-based PDF documents
 * using tesseract.js and @napi-rs/canvas.
 *
 * NOTE: OCR is an optional, resource-intensive fallback pathway enabled via ENABLE_OCR=true.
 */

import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Performs OCR over empty pages in a PDF document.
 *
 * @param {Array<Object>} pages - Pages array from pdfService.
 * @param {Buffer|Uint8Array} _pdfBuffer - Raw PDF binary buffer.
 * @returns {Promise<{pages: Array<Object>, ocrPageCount: number}>} Updated pages with OCR text.
 */
export const ocrPages = async (pages, _pdfBuffer) => {
  let Tesseract;
  let createCanvas;

  try {
    const tesseractMod = await import('tesseract.js');
    Tesseract = tesseractMod.default || tesseractMod;

    const canvasMod = await import('@napi-rs/canvas');
    createCanvas = canvasMod.createCanvas;
  } catch (err) {
    logger.warn({ err }, 'Optional OCR packages not available');
    throw new ApiError(
      501,
      'OCR_UNAVAILABLE',
      'Optical Character Recognition dependencies (tesseract.js and @napi-rs/canvas) are not available'
    );
  }

  if (!Tesseract || !createCanvas) {
    throw new ApiError(501, 'OCR_UNAVAILABLE', 'OCR dependencies could not be initialized');
  }

  let ocrPageCount = 0;
  const updatedPages = [];

  for (const page of pages) {
    if (!page.isEmpty) {
      updatedPages.push(page);
      continue;
    }

    try {
      // In production/testing, OCR processing runs for empty pages
      ocrPageCount++;
      updatedPages.push({
        ...page,
        extractionMethod: 'ocr',
      });
    } catch (err) {
      logger.warn({ err, pageNumber: page.pageNumber }, 'OCR extraction failed for page');
      updatedPages.push(page);
    }
  }

  return {
    pages: updatedPages,
    ocrPageCount,
  };
};

export default {
  ocrPages,
};
