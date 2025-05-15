import express from 'express';
import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  getUserProjects
} from '../controllers/projectController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Use RequestHandler type to ensure type compatibility with Express
router.route('/')
  .get(protect, getAllProjects)
  .post(protect, admin, createProject);

// Get projects for current user
router.route('/user')
  .get(protect, getUserProjects);
  
// Get projects for specific user (admin only)
router.route('/user/:userId')
  .get(protect, admin, getUserProjects);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, admin, updateProject)
  .delete(protect, admin, deleteProject);

export default router; 