/**
 * @fileoverview Ingestion queue service handling creation of asynchronous processing jobs.
 */

import { IngestionJob } from '../models/IngestionJob.js';
import { ingestionRunner } from '../jobs/ingestionRunner.js';

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

  ingestionRunner.kick();
  return job;
};

/**
 * Creates and queues a new background ingestion job for an official source endpoint.
 *
 * @param {Object} source - Source document from database.
 * @param {string|Object} requestedById - Admin user ID requesting the ingestion.
 * @returns {Promise<Object>} Created IngestionJob document.
 */
export const createJobForSource = async (source, requestedById) => {
  const job = await IngestionJob.create({
    type: 'source_fetch',
    sourceId: source._id,
    sourceUrl: source.url,
    status: 'queued',
    stage: 'queued',
    attempts: 0,
    maxAttempts: 3,
    nextRunAt: new Date(),
    requestedBy: requestedById || undefined,
  });

  ingestionRunner.kick();
  return job;
};

export default {
  createJobForDocument,
  createJobForSource,
};
