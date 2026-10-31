/**
 * @fileoverview Administrator routes protected by authentication and admin role requirement.
 */

import { Router } from 'express';
import { getSession } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';

const router = Router();

// Apply authentication and admin role requirement across all admin routes
router.use(authenticate, requireRole('admin'));

router.get('/session', getSession);

export default router;
