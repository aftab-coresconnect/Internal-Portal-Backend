import express from 'express';
import {
  getAllDesigners,
  getDesignerById,
  updateDesignerProfile,
  updateDesignerMetrics,
  getDesignerMetrics
} from '../controllers/designerController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Get all designers (admin only)
router.get('/', protect, admin, getAllDesigners);

// Get designer by ID
router.get('/:id', protect, getDesignerById);

// Update designer profile
router.put('/:id/profile', protect, updateDesignerProfile);

// Update designer metrics (admin only)
router.put('/:id/metrics', protect, admin, updateDesignerMetrics);

// Get designer's performance metrics
router.get('/:id/metrics', protect, getDesignerMetrics);

export default router; 