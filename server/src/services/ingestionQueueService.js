/**
 * @fileoverview Ingestion queue service handling creation of asynchronous processing jobs.
 */

import { IngestionJob } from '../models/IngestionJob.js';

/**
 * Creates and queues a new background ingestion job for an uploaded document.
 *
 * @param {string|Object} documentId - Document identifier.
 * @param {string|Object} requestedById - User ID requesting the ingestion.
 * @returns {Promise<Object>} Created IngestionJob document.
 */
export const createJobForDocument = async (documentId, requestedById) => {
  const job = await IngestionJob.create({
    type: 'upload',
    documentId,
    status: 'queued',
    stage: 'queued',
    attempts: 0,
    maxAttempts: 3,
    nextRunAt: new Date(),
    requestedBy: requestedById || undefined,
  });

  return job;
};
