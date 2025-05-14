import express from 'express';
import authRoutes from './authRoutes';
import projectRoutes from './projectRoutes';
import milestoneRoutes from './milestoneRoutes';
import clientRoutes from './clientRoutes';
import uploadRoutes from './uploadRoutes';

const router = express.Router();

// Define routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/clients', clientRoutes);
router.use('/upload', uploadRoutes);

export default router; 