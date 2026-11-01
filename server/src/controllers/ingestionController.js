/**
 * @fileoverview Administrative controller for IngestionJob tracking, inspection, and retries.
 */

import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from '../services/auditService.js';
import { IngestionJob } from '../models/IngestionJob.js';
import { Document } from '../models/Document.js';
import { ingestionRunner } from '../jobs/ingestionRunner.js';

/**
 * Lists ingestion jobs with filtering, sorting, and pagination.
 */
export const listIngestionJobs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    type,
    sourceId,
    documentId,
    sort = '-createdAt',
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (sourceId) filter.sourceId = sourceId;
  if (documentId) filter.documentId = documentId;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const sortObj = {};
  if (sort.startsWith('-')) {
    sortObj[sort.slice(1)] = -1;
  } else {
    sortObj[sort] = 1;
  }

  const [jobs, total] = await Promise.all([
    IngestionJob.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate('sourceId', 'name url')
      .populate('documentId', 'title status visibility')
      .lean(),
    IngestionJob.countDocuments(filter),
  ]);

  const items = jobs.map((job) => ({
    ...job,
    id: job._id,
  }));

  return sendPaginated(res, items, { page: pageNum, limit: limitNum, total });
});

/**
 * Retrieves full details for a single ingestion job.
 */
export const getIngestionJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await IngestionJob.findById(id)
    .populate('sourceId', 'name url sourceType issuingAuthority')
    .populate('documentId', 'title status visibility failure')
    .lean();

  if (!job) {
    throw new ApiError(404, 'NOT_FOUND', 'Ingestion job not found');
  }

  return sendSuccess(res, {
    ...job,
    id: job._id,
  });
});

/**
 * Manually retries a failed ingestion job.
 */
export const retryIngestionJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await IngestionJob.findById(id);
  if (!job) {
    throw new ApiError(404, 'NOT_FOUND', 'Ingestion job not found');
  }

  if (job.status !== 'failed') {
    throw new ApiError(409, 'CONFLICT', 'Only failed jobs can be manually retried');
  }

  // Reset job state for immediate re-execution
  job.status = 'queued';
  job.stage = 'queued';
  job.nextRunAt = new Date();
  job.attempts = 0;
  job.manualRetries = (job.manualRetries || 0) + 1;
  job.error = undefined;
  job.lockedAt = null;
  await job.save();

  // Reset associated Document if applicable
  if (job.documentId) {
    await Document.updateOne(
      { _id: job.documentId },
      {
        $set: { status: 'pending' },
        $unset: { failure: 1 },
      }
    );
  }

  await logAudit({
    actorId: req.user.id,
    actorRole: req.user.role,
    action: 'ingestion.retry',
    resourceType: 'IngestionJob',
    resourceId: job.id,
    outcome: 'success',
    requestId: req.id,
  });

  // Prompt worker to claim immediately
  ingestionRunner.kick();

  return sendSuccess(res, job);
});

export default {
  listIngestionJobs,
  getIngestionJob,
  retryIngestionJob,
};
