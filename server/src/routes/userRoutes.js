/**
 * @fileoverview User routes for authenticated citizen profile access and updates.
 */

import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/userValidators.js';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', validate({ body: updateProfileSchema }), updateProfile);

export default router;
