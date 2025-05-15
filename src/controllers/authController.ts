import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// JWT token generator
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_not_for_production';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with hashed password
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // Use pre-hashed password to avoid double hashing in middleware
      role: role || 'developer', // Default role
    });

    if (user) {
      // Convert the user document to a plain object for the response
      const userObj = user.toObject();
      
      // Remove the password from the user object
      const userResponse = { ...userObj };
      delete (userResponse as any).password;
      
      res.status(201).json({
        user: userResponse,
        token: generateToken(userObj._id.toString()),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Compare passwords using bcrypt directly
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Convert the user document to a plain object for the response
    const userObj = user.toObject();
    
    // Remove the password from the user object
    const userResponse = { ...userObj };
    delete (userResponse as any).password;

    res.status(200).json({
      user: userResponse,
      token: generateToken(userObj._id.toString()),
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * @desc    Get all users (for admin functions like assigning to projects)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is set by the protect middleware
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    // Get fresh user data from the database
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find the user
    const user = await User.findById(req.user?._id);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Update user data with request body or keep existing values
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.title = req.body.title || user.title;
    user.department = req.body.department || user.department;
    user.avatar = req.body.avatar || user.avatar;
    
    // Update skills if provided
    if (req.body.skills && Array.isArray(req.body.skills)) {
      user.skills = req.body.skills;
    }
    
    // Update password if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    
    // Save updated user
    const updatedUser = await user.save();
    
    // Return updated user info without password
    const userObj = updatedUser.toObject();
    const userResponse = { ...userObj };
    delete (userResponse as any).password;
    
    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}; 