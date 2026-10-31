/**
 * @fileoverview Authentication controller handling registration and login requests.
 */

import { registerUser, loginUser } from '../services/userService.js';
import { logAudit } from '../services/auditService.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Handles citizen registration.
 */
export const register = asyncHandler(async (req, res) => {
  try {
    const { user, token } = await registerUser(req.body);

    await logAudit({
      actorId: user.id,
      actorRole: user.role,
      action: 'auth.register',
      resourceType: 'User',
      resourceId: user.id,
      outcome: 'success',
      requestId: req.id,
    });

    return sendSuccess(res, { user, token }, undefined, 201);
  } catch (err) {
    await logAudit({
      action: 'auth.register',
      resourceType: 'User',
      outcome: 'failure',
      requestId: req.id,
      metadata: { reason: err.code || 'REGISTRATION_FAILED' },
    });
    throw err;
  }
});

/**
 * Handles user authentication with timing protection and credential verification.
 */
export const login = asyncHandler(async (req, res) => {
  try {
    const { user, token } = await loginUser(req.body);

    await logAudit({
      actorId: user.id,
      actorRole: user.role,
      action: 'auth.login',
      resourceType: 'User',
      resourceId: user.id,
      outcome: 'success',
      requestId: req.id,
    });

    return sendSuccess(res, { user, token }, undefined, 200);
  } catch (err) {
    // For failures do NOT store the attempted email or password
    await logAudit({
      action: 'auth.login',
      resourceType: 'User',
      outcome: 'failure',
      requestId: req.id,
      metadata: { reason: err.code || 'LOGIN_FAILED' },
    });
    throw err;
  }
});
