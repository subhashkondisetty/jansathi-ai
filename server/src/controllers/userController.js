/**
 * @fileoverview User controller handling profile retrieval and updates.
 */

import { getUserProfile, updateUserProfile } from '../services/userService.js';
import { logAudit } from '../services/auditService.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Retrieves the currently authenticated user's profile.
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);
  return sendSuccess(res, { user }, undefined, 200);
});

/**
 * Updates the authenticated user's profile attributes.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  try {
    const user = await updateUserProfile(req.user.id, req.body);

    await logAudit({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'users.profile.update',
      resourceType: 'User',
      resourceId: req.user.id,
      outcome: 'success',
      requestId: req.id,
      metadata: { updatedFields: Object.keys(req.body) },
    });

    return sendSuccess(res, { user }, undefined, 200);
  } catch (err) {
    await logAudit({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'users.profile.update',
      resourceType: 'User',
      resourceId: req.user.id,
      outcome: 'failure',
      requestId: req.id,
      metadata: { reason: err.code || 'PROFILE_UPDATE_FAILED' },
    });
    throw err;
  }
});
