import express from 'express';
import {
  getProjectMilestones,
  getMilestoneById,
  createMilestone,
  updateMilestone,
  deleteMilestone
} from '../controllers/milestoneController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Get all milestones for a project
router.get('/project/:projectId', protect, getProjectMilestones);

// Get milestone by ID
router.get('/:id', protect, getMilestoneById);

// Create new milestone
router.post('/', protect, createMilestone);

// Update milestone
router.put('/:id', protect, updateMilestone);

// Delete milestone
router.delete('/:id', protect, deleteMilestone);

export default router; 