import express from 'express';
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  linkProject,
  unlinkProject
} from '../controllers/clientController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Routes accessible only to admin
router.get('/', protect, getAllClients);
router.get('/:id', protect, getClientById);
router.post('/', protect, admin, createClient);
router.put('/:id', protect, admin, updateClient);
router.delete('/:id', protect, admin, deleteClient);
router.post('/:clientId/link-project/:projectId', protect, admin, linkProject);
router.delete('/:clientId/unlink-project/:projectId', protect, admin, unlinkProject);

export default router; 