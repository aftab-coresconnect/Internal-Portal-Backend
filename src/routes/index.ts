import express from 'express';
import authRoutes from './authRoutes';
import projectRoutes from './projectRoutes';
import milestoneRoutes from './milestoneRoutes';

const router = express.Router();

// Define routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/milestones', milestoneRoutes);

export default router; 