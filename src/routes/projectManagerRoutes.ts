import express from 'express';
import {
  getAllProjectManagers,
  getProjectManagerById,
  updateProjectManagerMetrics,
  getProjectManagerMetrics
} from '../controllers/projectManagerController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Get all project managers (admin only)
router.get('/', protect, admin, getAllProjectManagers);

// Get project manager by ID
router.get('/:id', protect, getProjectManagerById);

// Update project manager metrics (admin only)
router.put('/:id/metrics', protect, admin, updateProjectManagerMetrics);

// Get project manager's performance metrics
router.get('/:id/metrics', protect, getProjectManagerMetrics);

export default router; 