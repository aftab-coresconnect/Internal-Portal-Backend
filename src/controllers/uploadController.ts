import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

/**
 * @desc    Upload a file
 * @route   POST /api/upload
 * @access  Private
 */
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    // Create URL for the uploaded file
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      file: {
        filename: req.file.filename,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      message: 'Server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * @desc    Upload a profile avatar
 * @route   POST /api/upload/avatar
 * @access  Private
 */
export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    // Create URL for the uploaded file
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const avatarUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // Update user's avatar field in database if user is logged in
    if (req.user && req.user._id) {
      // User model and update logic will be handled by auth controller
      res.status(200).json({
        success: true,
        file: {
          filename: req.file.filename,
          url: avatarUrl
        }
      });
    } else {
      res.status(401).json({ message: 'User not authenticated' });
    }
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      message: 'Server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}; 