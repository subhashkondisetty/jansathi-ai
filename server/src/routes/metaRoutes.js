/**
 * @fileoverview Metadata routes serving global configurations and option lists.
 */

import { Router } from 'express';
import { getOptions } from '../controllers/metaController.js';

const router = Router();

router.get('/options', getOptions);

export default router;
