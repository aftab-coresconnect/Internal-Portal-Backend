import express from 'express';
import { 
  loginUser, 
  getUserProfile, 
  getUsers, 
  getCurrentUser, 
  updateUserProfile,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByRole
} from '../controllers/authController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateUserProfile);

// Admin routes
router.get('/users', protect, admin, getUsers);
router.post('/users', protect, admin, createUser);
router.get('/users/role/:role', protect, admin, getUsersByRole);
router.get('/users/:id', protect, admin, getUserById);
router.put('/users/:id', protect, admin, updateUser);
router.delete('/users/:id', protect, admin, deleteUser);

export default router; 