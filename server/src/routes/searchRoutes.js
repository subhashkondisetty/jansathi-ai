/**
 * @fileoverview Search routes protected by authentication.
 */

import { Router } from 'express';
import { search } from '../controllers/searchController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { searchQuerySchema } from '../validators/searchValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', validate({ query: searchQuerySchema }), search);

export default router;
