import express from 'express';
import authRoutes from './authRoutes';
import projectRoutes from './projectRoutes';
import milestoneRoutes from './milestoneRoutes';
import clientRoutes from './clientRoutes';
import uploadRoutes from './uploadRoutes';
import projectManagerRoutes from './projectManagerRoutes';
import designerRoutes from './designerRoutes';

const router = express.Router();

// Define routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/clients', clientRoutes);
router.use('/upload', uploadRoutes);
router.use('/project-managers', projectManagerRoutes);
router.use('/designers', designerRoutes);

export default router; 