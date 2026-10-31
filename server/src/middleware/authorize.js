/**
 * @fileoverview Authorization middleware enforcing role-based access control.
 */

import { ApiError } from '../utils/ApiError.js';

/**
 * Creates an authorization middleware restricting access to specified roles.
 *
 * @param {...string} roles - Permitted user roles (e.g. 'admin', 'citizen').
 * @returns {Function} Express middleware function.
 */
export const requireRole = (...roles) => {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(403, 'FORBIDDEN', 'Insufficient permissions to access this resource')
      );
    }
    return next();
  };
};

export default requireRole;
