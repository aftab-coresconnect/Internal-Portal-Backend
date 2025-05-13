import express from 'express';
import { registerUser, loginUser, getUserProfile, getUsers } from '../controllers/authController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);

// Admin routes
router.get('/users', protect, admin, getUsers);

export default router; 