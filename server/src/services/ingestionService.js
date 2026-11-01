/**
 * @fileoverview Ingestion orchestration service.
 * Manages full lifecycle processing for uploaded PDFs and official source endpoints,
 * including extraction, cleaning, chunking, deduplication, versioning, and bounded retries.
 */

import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { calculateBufferSha256 } from '../utils/checksum.js';
import { detectLanguage } from '../utils/scriptDetect.js';
import { cleanPages } from './textCleaner.js';
import { chunkPages } from './chunkingService.js';
import { extractPages } from './pdfService.js';
import { extractSections } from './htmlService.js';
import { ocrPages } from './ocrService.js';
import { fetchSource } from './fetchService.js';
import { readFile, deleteFile } from './fileStorageService.js';
import { Document } from '../models/Document.js';
import { DocumentPage } from '../models/DocumentPage.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import { IngestionJob } from '../models/IngestionJob.js';
import { Source } from '../models/Source.js';

/**
 * Determines whether an error is transient and eligible for automatic retry.
 *
 * @param {Error|Object} err - Error object.
 * @returns {boolean} True if error is retriable.
 */
export const isRetriableError = (err) => {
  if (!err) return false;

  const code = err.code || '';
  const status = err.status || err.statusCode || 0;

  // Non-retriable error codes
  const nonRetriableCodes = [
    'PDF_ENCRYPTED',
    'PDF_CORRUPT',
    'PDF_EMPTY',
    'PDF_TOO_MANY_PAGES',
    'OCR_REQUIRED',
    'OCR_UNAVAILABLE',
    'UNSUPPORTED_CONTENT',
    'SSRF_BLOCKED',
    'FILE_NOT_FOUND',
    'VALIDATION_ERROR',
    'MAX_REDIRECTS_EXCEEDED',
  ];

  if (nonRetriableCodes.includes(code)) {
    return false;
  }

  // HTTP client/server codes
  if (status === 404 || status === 410 || status === 401 || status === 403 || status === 415) {
    return false;
  }

  if (status === 429 || (status >= 500 && status <= 599)) {
    return true;
  }

  // Network and database transients
  const retriableNetworkCodes = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNABORTED',
    'ENOTFOUND',
    'EAI_AGAIN',
  ];
  if (retriableNetworkCodes.includes(code)) {
    return true;
  }

  if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
    return true;
  }

  return false;
};

/**
 * Persists an array of items in batches to MongoDB to prevent memory pressure.
 *
 * @param {import('mongoose').Model} Model - Target Mongoose model.
 * @param {Array<Object>} items - Array of plain document objects.
 * @param {number} [batchSize=200] - Batch size.
 */
const batchInsert = async (Model, items, batchSize = 200) => {
  if (!items || items.length === 0) return;
  for (let i = 0; i < items.length; i += batchSize) {
    const slice = items.slice(i, i + batchSize);
    await Model.insertMany(slice, { ordered: false });
  }
};

/**
 * Processes an IngestionJob from start to finish.
 *
 * @param {string|Object} jobId - IngestionJob ID.
 * @returns {Promise<Object>} Processed job document.
 */
export const processJob = async (jobId) => {
  const startTime = Date.now();
  const job = await IngestionJob.findById(jobId);
  if (!job) {
    logger.warn({ jobId }, 'Ingestion job not found for processing');
    return null;
  }

  logger.info(
    { jobId: job.id, type: job.type, stage: job.stage },
    'Starting ingestion job processing'
  );

  let document = null;
  let source = null;

  try {
    if (job.documentId) {
      document = await Document.findById(job.documentId);
    }
    if (job.sourceId) {
      source = await Source.findById(job.sourceId);
    }

    // 1. Idempotency cleanup: purge any partial pages or chunks for this document
    if (document) {
      await DocumentPage.deleteMany({ documentId: document._id });
      await DocumentChunk.deleteMany({ documentId: document._id });
      document.status = 'processing';
      await document.save();
    }

    // =========================================================================
    // PATHWAY A: UPLOAD JOB
    // =========================================================================
    if (job.type === 'upload') {
      if (!document) {
        throw new Error('Upload job has no associated Document');
      }

      const storedName = document.storage?.storedName;
      if (!storedName) {
        const notFoundErr = new Error(`Stored file is missing for document ${document.id}`);
        notFoundErr.code = 'FILE_NOT_FOUND';
        throw notFoundErr;
      }

      job.stage = 'extracting';
      await job.save();

      // Read stored PDF file from disk
      const pdfBuffer = await readFile(storedName);

      // Extract pages via pdfjs-dist
      const { pages: rawPages, metadata: pdfMeta, pageCount } = await extractPages(pdfBuffer);

      // Check empty pages ratio for OCR evaluation
      const emptyCount = rawPages.filter((p) => p.isEmpty).length;
      const emptyRatio = pageCount > 0 ? emptyCount / pageCount : 0;
      let extractionMethod = 'text';
      let ocrCount = 0;
      let finalPages = rawPages;

      if (emptyRatio > 0.8) {
        if (!env.ENABLE_OCR) {
          logger.warn(
            { documentId: document.id, emptyRatio },
            'Document requires OCR but ENABLE_OCR is false'
          );
          const ocrErr = new Error('Document consists mostly of scanned images and requires OCR');
          ocrErr.code = 'OCR_REQUIRED';
          throw ocrErr;
        }

        job.stage = 'extracting';
        await job.save();
        const ocrResult = await ocrPages(rawPages, pdfBuffer);
        finalPages = ocrResult.pages;
        ocrCount = ocrResult.ocrPageCount;
        extractionMethod = ocrCount === pageCount ? 'ocr' : 'mixed';
      }

      // Stage: Cleaning
      job.stage = 'cleaning';
      await job.save();
      const cleanedPages = cleanPages(finalPages);

      // Stage: Chunking
      job.stage = 'chunking';
      await job.save();

      // Concatenate text for language identification
      const combinedText = cleanedPages.map((p) => p.text).join(' ');
      const detectedLang = detectLanguage(combinedText);

      const chunkMetadata = {
        documentId: document._id,
        title: document.title,
        sourceUrl: document.sourceUrl,
        issuingAuthority: document.issuingAuthority,
        docType: document.docType,
        category: document.category,
        language: detectedLang,
        visibility: document.visibility,
        ownerId: document.uploadedBy,
        isLatest: document.isLatest,
        version: document.version,
        checksum: document.checksum,
        publishedAt: document.publishedAt,
        lastUpdatedAt: document.lastUpdatedAt,
        fetchedAt: new Date(),
      };

      const chunks = chunkPages(cleanedPages, chunkMetadata);

      // Stage: Storing
      job.stage = 'storing';
      await job.save();

      const pageDocs = cleanedPages.map((p) => ({
        documentId: document._id,
        pageNumber: p.pageNumber,
        sectionHeading: p.sectionHeading,
        text: p.text,
        charCount: p.charCount,
        isEmpty: p.isEmpty,
        extractionMethod,
      }));

      await batchInsert(DocumentPage, pageDocs, 200);
      await batchInsert(DocumentChunk, chunks, 200);

      // Update Document status and extraction statistics
      document.status = 'ready';
      document.pageCount = cleanedPages.length;
      document.chunkCount = chunks.length;
      document.fetchedAt = new Date();
      document.language = detectedLang;
      document.extraction = {
        method: extractionMethod,
        emptyPageCount: emptyCount,
        ocrPageCount: ocrCount,
      };

      if (pdfMeta.pdfTitle) document.metadata.pdfTitle = pdfMeta.pdfTitle;
      if (pdfMeta.pdfAuthor) document.metadata.pdfAuthor = pdfMeta.pdfAuthor;
      if (pdfMeta.pdfCreatedAt) document.metadata.pdfCreatedAt = pdfMeta.pdfCreatedAt;

      // Retain or delete file based on KEEP_UPLOADED_FILES
      if (!env.KEEP_UPLOADED_FILES && document.storage?.storedName) {
        await deleteFile(document.storage.storedName);
        document.storage.storedName = undefined;
      }

      document.failure = undefined;
      await document.save();

      // Complete Job
      job.status = 'succeeded';
      job.stage = 'done';
      job.finishedAt = new Date();
      job.stats = {
        pageCount: cleanedPages.length,
        chunkCount: chunks.length,
        emptyPages: emptyCount,
        ocrPages: ocrCount,
        durationMs: Date.now() - startTime,
      };
      job.error = undefined;
      await job.save();

      logger.info(
        {
          jobId: job.id,
          documentId: document.id,
          pages: cleanedPages.length,
          chunks: chunks.length,
          durationMs: job.stats.durationMs,
        },
        'Upload ingestion job completed successfully'
      );
      return job;
    }

    // =========================================================================
    // PATHWAY B: SOURCE FETCH JOB
    // =========================================================================
    if (job.type === 'source_fetch') {
      if (!source) {
        throw new Error('Source fetch job has no associated Source');
      }

      job.stage = 'fetching';
      await job.save();

      // Fetch from official source endpoint
      const fetchResult = await fetchSource(source);
      const { buffer, contentType, httpLastModified } = fetchResult;

      // Extract and clean content based on sourceType
      let rawPages = [];
      let extractionMethod = source.sourceType === 'html' ? 'html' : 'text';
      let pdfMeta = {};

      if (source.sourceType === 'pdf') {
        const pdfResult = await extractPages(buffer);
        rawPages = pdfResult.pages;
        pdfMeta = pdfResult.metadata || {};
      } else {
        const htmlResult = await extractSections(buffer);
        rawPages = htmlResult.pages;
      }

      const cleanedPages = cleanPages(rawPages);
      const combinedCleanedText = cleanedPages.map((p) => p.text).join(' ');

      // Checksum computation: binary for PDF, cleaned text for HTML
      const checksum =
        source.sourceType === 'pdf'
          ? calculateBufferSha256(buffer)
          : calculateBufferSha256(Buffer.from(combinedCleanedText, 'utf-8'));

      // Deduplication & Versioning Check:
      // 1. If an identical public document exists anywhere in the library:
      const existingDoc = await Document.findOne({ scopeKey: 'public', checksum });
      if (existingDoc) {
        logger.info(
          { sourceId: source.id, existingDocId: existingDoc.id },
          'Source content is identical to existing public document (skipped duplicate)'
        );
        existingDoc.fetchedAt = new Date();
        await existingDoc.save();

        source.lastFetchedAt = new Date();
        source.lastFetchStatus = 'ok';
        source.lastFetchError = undefined;
        source.lastDocumentId = existingDoc._id;
        await source.save();

        job.status = 'skipped_duplicate';
        job.stage = 'done';
        job.documentId = existingDoc._id;
        job.finishedAt = new Date();
        job.stats = {
          pageCount: existingDoc.pageCount,
          chunkCount: existingDoc.chunkCount,
          emptyPages: 0,
          ocrPages: 0,
          durationMs: Date.now() - startTime,
        };
        job.error = undefined;
        await job.save();
        return job;
      }

      // 2. Check previous version of this source
      const prevDoc = await Document.findOne({ sourceId: source._id, isLatest: true });
      let version = 1;
      let supersedesId = undefined;

      if (prevDoc) {
        if (prevDoc.checksum === checksum) {
          logger.info({ sourceId: source.id }, 'Source content unchanged (skipped duplicate)');
          prevDoc.fetchedAt = new Date();
          await prevDoc.save();

          source.lastFetchedAt = new Date();
          source.lastFetchStatus = 'ok';
          source.lastFetchError = undefined;
          await source.save();

          job.status = 'skipped_duplicate';
          job.stage = 'done';
          job.documentId = prevDoc._id;
          job.finishedAt = new Date();
          job.stats = {
            pageCount: prevDoc.pageCount,
            chunkCount: prevDoc.chunkCount,
            emptyPages: 0,
            ocrPages: 0,
            durationMs: Date.now() - startTime,
          };
          job.error = undefined;
          await job.save();
          return job;
        }

        // New version: increment version and demote previous version
        version = prevDoc.version + 1;
        supersedesId = prevDoc._id;

        await Document.updateOne({ _id: prevDoc._id }, { isLatest: false });
        await DocumentChunk.updateMany({ documentId: prevDoc._id }, { isLatest: false });
      }

      // Create new Document record
      job.stage = 'chunking';
      await job.save();

      const detectedLang = detectLanguage(combinedCleanedText);

      document = await Document.create({
        title: source.name,
        issuingAuthority: source.issuingAuthority,
        sourceUrl: source.url,
        sourceId: source._id,
        origin: 'fetched',
        visibility: 'public',
        scopeKey: 'public',
        checksum,
        version,
        isLatest: true,
        supersedesId,
        docType: source.docType || 'other',
        category: source.category || 'other',
        language: detectedLang,
        lastUpdatedAt: httpLastModified ? new Date(httpLastModified) : undefined,
        fetchedAt: new Date(),
        status: 'processing',
        metadata: {
          httpLastModified,
          contentType,
          pdfTitle: pdfMeta.pdfTitle,
          pdfAuthor: pdfMeta.pdfAuthor,
          pdfCreatedAt: pdfMeta.pdfCreatedAt,
        },
      });

      job.documentId = document._id;
      await job.save();

      // Chunk pages
      const chunkMetadata = {
        documentId: document._id,
        title: document.title,
        sourceUrl: document.sourceUrl,
        issuingAuthority: document.issuingAuthority,
        docType: document.docType,
        category: document.category,
        language: detectedLang,
        visibility: 'public',
        ownerId: undefined,
        isLatest: true,
        version,
        checksum,
        publishedAt: document.publishedAt,
        lastUpdatedAt: document.lastUpdatedAt,
        fetchedAt: document.fetchedAt,
      };

      const chunks = chunkPages(cleanedPages, chunkMetadata);

      // Stage: Storing
      job.stage = 'storing';
      await job.save();

      const pageDocs = cleanedPages.map((p) => ({
        documentId: document._id,
        pageNumber: p.pageNumber,
        sectionHeading: p.sectionHeading,
        text: p.text,
        charCount: p.charCount,
        isEmpty: p.isEmpty,
        extractionMethod,
      }));

      await batchInsert(DocumentPage, pageDocs, 200);
      await batchInsert(DocumentChunk, chunks, 200);

      // Finalize document
      document.status = 'ready';
      document.pageCount = cleanedPages.length;
      document.chunkCount = chunks.length;
      document.extraction = {
        method: extractionMethod,
        emptyPageCount: cleanedPages.filter((p) => p.isEmpty).length,
        ocrPageCount: 0,
      };
      await document.save();

      // Update Source
      source.lastFetchedAt = new Date();
      source.lastFetchStatus = 'ok';
      source.lastFetchError = undefined;
      source.lastDocumentId = document._id;
      await source.save();

      // Complete Job
      job.status = 'succeeded';
      job.stage = 'done';
      job.finishedAt = new Date();
      job.stats = {
        pageCount: cleanedPages.length,
        chunkCount: chunks.length,
        emptyPages: cleanedPages.filter((p) => p.isEmpty).length,
        ocrPages: 0,
        durationMs: Date.now() - startTime,
      };
      job.error = undefined;
      await job.save();

      logger.info(
        {
          jobId: job.id,
          sourceId: source.id,
          documentId: document.id,
          version,
          pages: cleanedPages.length,
          chunks: chunks.length,
        },
        'Source fetch ingestion job completed successfully'
      );
      return job;
    }
  } catch (err) {
    logger.error(
      { jobId: job.id, error: err.message, code: err.code, stage: job.stage },
      'Ingestion job encountered an error'
    );

    const retriable = isRetriableError(err);
    const maxAttempts = job.maxAttempts || env.INGESTION_MAX_ATTEMPTS || 3;

    if (retriable && job.attempts < maxAttempts) {
      // Calculate exponential backoff delay with random jitter (base: 5000ms)
      const baseDelay = env.INGESTION_RETRY_BASE_DELAY_MS || 5000;
      const exponentialDelay = baseDelay * Math.pow(2, job.attempts - 1);
      const jitter = Math.floor(Math.random() * 1000);
      const delayMs = exponentialDelay + jitter;

      job.status = 'queued';
      job.nextRunAt = new Date(Date.now() + delayMs);
      job.lockedAt = null;
      job.error = {
        code: err.code || 'RETRY_SCHEDULED',
        message: err.message || 'Transient error encountered, retry scheduled',
        retriable: true,
      };
      await job.save();

      logger.info(
        { jobId: job.id, attempt: job.attempts, nextRunAt: job.nextRunAt, delayMs },
        'Job scheduled for bounded exponential retry'
      );
    } else {
      // Non-retriable failure or exceeded maximum attempts
      const errorCode = err.code || (retriable ? 'MAX_RETRIES_EXCEEDED' : 'INGESTION_FAILED');
      const errorMessage = err.message || 'Ingestion processing failed';

      job.status = 'failed';
      job.finishedAt = new Date();
      job.error = {
        code: errorCode,
        message: errorMessage,
        retriable: false,
      };
      await job.save();

      // Update associated Document
      if (document) {
        document.status = errorCode === 'OCR_REQUIRED' ? 'needs_ocr' : 'failed';
        document.failure = {
          code: errorCode,
          message: errorMessage,
        };
        await document.save();
      }

      // Update associated Source
      if (source) {
        source.lastFetchedAt = new Date();
        source.lastFetchStatus = 'failed';
        source.lastFetchError = {
          code: errorCode,
          message: errorMessage,
        };
        await source.save();
      }
    }

    return job;
  }
};

export default {
  isRetriableError,
  processJob,
};
