/**
 * @fileoverview Background runner polling and executing queued IngestionJobs.
 * Implements atomic job claiming, bounded concurrency, graceful shutdown,
 * and automatic recovery of stale running jobs.
 */

import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { IngestionJob } from '../models/IngestionJob.js';
import { processJob } from '../services/ingestionService.js';

class IngestionRunner {
  constructor() {
    this.isRunning = false;
    this.isStopping = false;
    this.activeCount = 0;
    this.pollTimer = null;
  }

  /**
   * Recovers jobs that were stuck in the 'running' state beyond INGESTION_STALE_MINUTES.
   */
  async recoverStaleJobs() {
    try {
      const staleMinutes = env.INGESTION_STALE_MINUTES || 10;
      const staleThreshold = new Date(Date.now() - staleMinutes * 60 * 1000);

      const result = await IngestionJob.updateMany(
        {
          status: 'running',
          lockedAt: { $lt: staleThreshold },
        },
        {
          $set: {
            status: 'queued',
            lockedAt: null,
          },
        }
      );

      if (result.modifiedCount > 0) {
        logger.info(
          { recoveredCount: result.modifiedCount },
          'Recovered stale running ingestion jobs back to queued state'
        );
      }
    } catch (err) {
      logger.error({ err: err.message }, 'Failed to recover stale ingestion jobs');
    }
  }

  /**
   * Starts the background ingestion runner.
   */
  async start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.isStopping = false;
    logger.info('Starting background IngestionRunner...');

    // Recover any orphaned jobs from unexpected prior crashes
    await this.recoverStaleJobs();

    const interval = env.INGESTION_POLL_INTERVAL_MS || 3000;
    this.pollTimer = setInterval(() => {
      this.tick();
    }, interval);

    // Initial trigger
    this.tick();
  }

  /**
   * Immediately triggers a polling tick (e.g. after a new job is enqueued).
   */
  kick() {
    if (this.isRunning && !this.isStopping) {
      setImmediate(() => this.tick());
    }
  }

  /**
   * Single polling execution loop.
   */
  async tick() {
    if (!this.isRunning || this.isStopping) {
      return;
    }

    const concurrency = env.INGESTION_CONCURRENCY || 1;
    if (this.activeCount >= concurrency) {
      return;
    }

    try {
      // Atomically claim the next eligible job
      const job = await IngestionJob.findOneAndUpdate(
        {
          status: 'queued',
          nextRunAt: { $lte: new Date() },
        },
        {
          $set: {
            status: 'running',
            lockedAt: new Date(),
            startedAt: new Date(),
          },
          $inc: { attempts: 1 },
        },
        {
          sort: { nextRunAt: 1, createdAt: 1 },
          new: true,
        }
      );

      if (!job) {
        return;
      }

      this.activeCount++;
      logger.info(
        { jobId: job.id, type: job.type, attempt: job.attempts },
        'Claimed ingestion job'
      );

      // Process asynchronously
      processJob(job._id)
        .catch((err) => {
          logger.error({ jobId: job.id, err: err.message }, 'Unexpected error in processJob');
        })
        .finally(() => {
          this.activeCount--;
          if (this.isRunning && !this.isStopping) {
            this.tick();
          }
        });

      // If concurrency permits more parallel work, tick again
      if (this.activeCount < concurrency) {
        this.tick();
      }
    } catch (err) {
      logger.error({ err: err.message }, 'Error in IngestionRunner tick');
    }
  }

  /**
   * Gracefully shuts down the runner, waiting up to 10 seconds for active jobs.
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }

    logger.info('Shutting down IngestionRunner...');
    this.isStopping = true;

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    // Wait for in-flight jobs to finish
    const maxWaitMs = 10000;
    const startTime = Date.now();

    while (this.activeCount > 0 && Date.now() - startTime < maxWaitMs) {
      logger.info(
        { activeJobs: this.activeCount },
        'Waiting for in-flight ingestion jobs to complete...'
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    this.isRunning = false;
    this.isStopping = false;
    logger.info('IngestionRunner stopped.');
  }
}

export const ingestionRunner = new IngestionRunner();
export default ingestionRunner;
