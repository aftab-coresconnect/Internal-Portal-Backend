import express from 'express';
import { uploadFile, uploadAvatar } from '../controllers/uploadController';
import { protect } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

// Protected routes
router.post('/', protect, upload.single('file'), uploadFile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

export default router; 