/**
 * @fileoverview Administrator controller handling administrative operations.
 */

import { logAudit } from '../services/auditService.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Validates active administrator session and returns admin credentials summary.
 */
export const getSession = asyncHandler(async (req, res) => {
  await logAudit({
    actorId: req.user.id,
    actorRole: req.user.role,
    action: 'admin.session',
    resourceType: 'User',
    resourceId: req.user.id,
    outcome: 'success',
    requestId: req.id,
  });

  return sendSuccess(
    res,
    {
      id: req.user.id,
      role: req.user.role,
    },
    undefined,
    200
  );
});
