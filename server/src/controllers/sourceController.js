/**
 * @fileoverview Source controller for administrative source management.
 */

import * as sourceService from '../services/sourceService.js';
import { logAudit } from '../services/auditService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createSource = asyncHandler(async (req, res) => {
  const source = await sourceService.createSource(req.body, req.user.id);

  await logAudit({
    actorId: req.user.id,
    actorRole: req.user.role,
    action: 'sources.create',
    resourceType: 'Source',
    resourceId: source.id,
    outcome: 'success',
    requestId: req.id,
  });

  return sendSuccess(res, source, undefined, 201);
});

export const listSources = asyncHandler(async (req, res) => {
  const result = await sourceService.listSources(req.query);
  return sendPaginated(
    res,
    result.items,
    {
      page: result.page,
      limit: result.limit,
      total: result.total,
    },
    200
  );
});

export const getSourceById = asyncHandler(async (req, res) => {
  const source = await sourceService.getSourceById(req.params.id);
  return sendSuccess(res, source, undefined, 200);
});

export const updateSource = asyncHandler(async (req, res) => {
  const source = await sourceService.updateSource(req.params.id, req.body);

  await logAudit({
    actorId: req.user.id,
    actorRole: req.user.role,
    action: 'sources.update',
    resourceType: 'Source',
    resourceId: source.id,
    outcome: 'success',
    requestId: req.id,
  });

  return sendSuccess(res, source, undefined, 200);
});

export const updateSourceStatus = asyncHandler(async (req, res) => {
  const source = await sourceService.updateSourceStatus(req.params.id, req.body.isActive);

  await logAudit({
    actorId: req.user.id,
    actorRole: req.user.role,
    action: 'sources.status',
    resourceType: 'Source',
    resourceId: source.id,
    outcome: 'success',
    requestId: req.id,
    metadata: { isActive: req.body.isActive },
  });

  return sendSuccess(res, source, undefined, 200);
});

export const deleteSource = asyncHandler(async (req, res) => {
  const result = await sourceService.deleteSource(req.params.id);

  await logAudit({
    actorId: req.user.id,
    actorRole: req.user.role,
    action: 'sources.delete',
    resourceType: 'Source',
    resourceId: req.params.id,
    outcome: 'success',
    requestId: req.id,
  });

  return sendSuccess(res, result, undefined, 200);
});
