import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import metaRoutes from './metaRoutes.js';
import adminRoutes from './adminRoutes.js';
import documentRoutes from './documentRoutes.js';
import searchRoutes from './searchRoutes.js';
import historyRoutes from './historyRoutes.js';
import aiRoutes from './aiRoutes.js';
import verifyRoutes from './verifyRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/meta', metaRoutes);
router.use('/admin', adminRoutes);
router.use('/documents', documentRoutes);
router.use('/search', searchRoutes);
router.use('/history', historyRoutes);
router.use('/ai', aiRoutes);
router.use('/verify', verifyRoutes);

export default router;
