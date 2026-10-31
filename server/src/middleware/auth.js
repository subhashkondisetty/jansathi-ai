/**
 * @fileoverview Authentication middleware verifying JWT tokens and hydrating req.user from DB.
 */

import { verifyToken } from '../services/authService.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Authenticates incoming HTTP requests by validating the Bearer JWT token,
 * resolving the subject user from the database, and attaching a sanitized req.user object.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'UNAUTHENTICATED', 'Authentication token required');
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new ApiError(401, 'UNAUTHENTICATED', 'Authentication token missing');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'TOKEN_EXPIRED', 'Authentication token has expired');
    }
    throw new ApiError(401, 'UNAUTHENTICATED', 'Invalid or malformed authentication token');
  }

  if (!decoded || !decoded.sub) {
    throw new ApiError(401, 'UNAUTHENTICATED', 'Invalid token payload');
  }

  // Reload user from database on every request
  const user = await User.findById(decoded.sub).select('-passwordHash');

  if (!user || !user.isActive) {
    throw new ApiError(401, 'UNAUTHENTICATED', 'User account not found or inactive');
  }

  // Attach safe user identity to request object
  req.user = {
    id: user.id,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
  };

  next();
});

export default authenticate;
