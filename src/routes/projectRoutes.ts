import express from 'express';
import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject 
} from '../controllers/projectController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Use RequestHandler type to ensure type compatibility with Express
router.route('/')
  .get(protect, getAllProjects)
  .post(protect, admin, createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, admin, updateProject)
  .delete(protect, admin, deleteProject);

export default router; 