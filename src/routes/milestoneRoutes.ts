import express from 'express';
import {
  getProjectMilestones,
  getMilestoneById,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  getUserMilestones
} from '../controllers/milestoneController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Get all milestones for a project
router.get('/project/:projectId', protect, getProjectMilestones);

// Get milestones for current user
router.get('/user', protect, getUserMilestones);

// Get milestones for specific user (admin only)
router.get('/user/:userId', protect, admin, getUserMilestones);

// Create new milestone
router.post('/', protect, createMilestone);

// Milestone by ID routes
router.route('/:id')
  .get(protect, getMilestoneById)
  .put(protect, updateMilestone)
  .delete(protect, admin, deleteMilestone);

export default router; 