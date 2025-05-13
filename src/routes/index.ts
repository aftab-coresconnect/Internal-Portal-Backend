import express from 'express';
import authRoutes from './authRoutes';

const router = express.Router();

// Define routes
router.use('/auth', authRoutes);

export default router; 