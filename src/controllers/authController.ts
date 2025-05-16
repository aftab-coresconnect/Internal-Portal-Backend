import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Developer, { IDeveloper } from '../models/Developer';
import ProjectManager from '../models/ProjectManager';
import Designer from '../models/Designer';
import Client from '../models/Client';
import mongoose from 'mongoose';
import { GenericUser } from '../types/user';
import Admin from '../models/Admin';

// JWT token generator
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_not_for_production';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

// Helper function to safely access common properties 
const safelyUpdateUserFields = (user: any, data: any) => {
  // Fields we know all user models have
  if (data.name !== undefined) user.name = data.name;
  if (data.email !== undefined) user.email = data.email;
  
  // Fields that might be specific to certain models
  if (data.title !== undefined && 'title' in user) user.title = data.title;
  if (data.department !== undefined && 'department' in user) user.department = data.department;
  if (data.avatar !== undefined && 'avatar' in user) user.avatar = data.avatar;
  if (data.isActive !== undefined && 'isActive' in user) user.isActive = data.isActive;
  
  // Skills field
  if (data.skills && Array.isArray(data.skills) && 'skills' in user) {
    user.skills = data.skills;
  }

  return user;
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Try to find the user in any of the user models
    let user: any = null;
    let userType = '';

    // Check Admin model first
    user = await Admin.findOne({ email });
    if (user) userType = 'admin';

    // If not found, check Developer model
    if (!user) {
      user = await Developer.findOne({ email });
      if (user) userType = 'developer';
    }

    // If not found, check ProjectManager model
    if (!user) {
      user = await ProjectManager.findOne({ email });
      if (user) userType = 'projectManager';
    }

    // If not found, check Designer model
    if (!user) {
      user = await Designer.findOne({ email });
      if (user) userType = 'designer';
    }

    // If not found, check Client model
    if (!user) {
      user = await Client.findOne({ email });
      if (user) userType = 'client';
    }

    // If user not found in any model
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
    // Try to find the user in any of the user models based on role
    let user: any = null;
    const userId = req.user?._id;
    
    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const role = req.user?.role;

    // Based on the role, query the appropriate model
    switch (role) {
      case 'developer':
      case 'admin':
      case 'teamLead':
        user = await Developer.findById(userId).select('-password');
        break;
      case 'projectManager':
        user = await ProjectManager.findById(userId).select('-password');
        break;
      case 'designer':
        user = await Designer.findById(userId).select('-password');
        break;
      case 'client':
        user = await Client.findById(userId).select('-password');
        break;
      default:
        // If role not specified, try all models
        user = await Developer.findById(userId).select('-password');
        if (!user) user = await ProjectManager.findById(userId).select('-password');
        if (!user) user = await Designer.findById(userId).select('-password');
        if (!user) user = await Client.findById(userId).select('-password');
    }
    
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
    const developers = await Developer.find({}).select('-password');
    const projectManagers = await ProjectManager.find({}).select('-password');
    const designers = await Designer.find({}).select('-password');
    const clients = await Client.find({}).select('-password');
    
    // Combine all users
    const allUsers = [
      ...developers,
      ...projectManagers,
      ...designers,
      ...clients
    ];
    
    res.status(200).json(allUsers);
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
    
    // Get fresh user data from the database based on role
    let user: any = null;
    const userId = req.user._id;
    const role = req.user.role;

    // Based on the role, query the appropriate model
    switch (role) {
      case 'admin':
        user = await Admin.findById(userId).select('-password');
        break;
      case 'developer':
      case 'teamLead':
        user = await Developer.findById(userId).select('-password');
        break;
      case 'projectManager':
        user = await ProjectManager.findById(userId).select('-password');
        break;
      case 'designer':
        user = await Designer.findById(userId).select('-password');
        break;
      case 'client':
        user = await Client.findById(userId).select('-password');
        break;
      default:
        // If role not specified, try all models
        user = await Developer.findById(userId).select('-password');
        if (!user) user = await ProjectManager.findById(userId).select('-password');
        if (!user) user = await Designer.findById(userId).select('-password');
        if (!user) user = await Client.findById(userId).select('-password');
    }
    
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
    // Find the user based on role
    let user: any = null;
    const userId = req.user?._id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Based on the role, query the appropriate model
    switch (role) {
      case 'developer':
      case 'admin':
      case 'teamLead':
        user = await Developer.findById(userId);
        break;
      case 'projectManager':
        user = await ProjectManager.findById(userId);
        break;
      case 'designer':
        user = await Designer.findById(userId);
        break;
      case 'client':
        user = await Client.findById(userId);
        break;
      default:
        // If role not specified, try all models
        user = await Developer.findById(userId);
        if (!user) user = await ProjectManager.findById(userId);
        if (!user) user = await Designer.findById(userId);
        if (!user) user = await Client.findById(userId);
    }
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Update user with safe property access
    user = safelyUpdateUserFields(user, req.body);
    
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

/**
 * @desc    Create a new user (Admin only)
 * @route   POST /api/auth/users
 * @access  Private/Admin
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, title, department } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    // Check if user already exists in any model
    let userExists: any = await Developer.findOne({ email });
    if (!userExists) userExists = await ProjectManager.findOne({ email });
    if (!userExists) userExists = await Designer.findOne({ email });
    if (!userExists) userExists = await Client.findOne({ email });
    
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || 'developer',
      title: title || '',
      department: department || '',
    };

    let user: any;

    // Use specific model based on role
    switch (role) {
      case 'projectManager':
        user = await ProjectManager.create(userData);
        break;
      case 'designer':
        user = await Designer.create(userData);
        break;
      case 'client':
        user = await Client.create(userData);
        break;
      default:
        // For admin, developer, and teamLead roles
        user = await Developer.create(userData);
    }

    if (user) {
      // Convert the user document to a plain object for the response
      const userObj = user.toObject();
      
      // Remove the password from the user object
      const userResponse = { ...userObj };
      delete (userResponse as any).password;
      
      res.status(201).json({
        user: userResponse,
        message: 'User created successfully',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/auth/users/:id
 * @access  Private/Admin
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    
    // Try finding the user in all models
    let user: any = await Developer.findById(userId).select('-password');
    if (!user) user = await ProjectManager.findById(userId).select('-password');
    if (!user) user = await Designer.findById(userId).select('-password');
    if (!user) user = await Client.findById(userId).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * @desc    Update user (Admin only)
 * @route   PUT /api/auth/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    
    // Find the user in any model
    let user: any = null;
    let currentModel = '';

    // Check if user exists in any model
    user = await Developer.findById(userId);
    if (user) currentModel = 'Developer';
    
    if (!user) {
      user = await ProjectManager.findById(userId);
      if (user) currentModel = 'ProjectManager';
    }
    
    if (!user) {
      user = await Designer.findById(userId);
      if (user) currentModel = 'Designer';
    }
    
    if (!user) {
      user = await Client.findById(userId);
      if (user) currentModel = 'Client';
    }
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // If role is changing, we need to transfer the user to another model
    if (role && role !== user.role) {
      // Create the new user data
      const userData = {
        ...user.toObject(),
        role,
        password: user.password, // Keep the hashed password
      };
      delete (userData as any)._id; // Remove _id to avoid duplicates
      
      // Create user in the new model
      let newUser: any;
      switch (role) {
        case 'projectManager':
          newUser = await ProjectManager.create(userData);
          break;
        case 'designer':
          newUser = await Designer.create(userData);
          break;
        case 'client':
          newUser = await Client.create(userData);
          break;
        default:
          newUser = await Developer.create(userData);
      }
      
      // Delete the old user
      await user.deleteOne();
      
      // Return the new user
      const newUserObj = newUser.toObject();
      delete (newUserObj as any).password;
      
      res.status(200).json({
        success: true,
        user: newUserObj,
        message: 'User role changed and data transferred successfully'
      });
      return;
    }
    
    // If role isn't changing, just update the user in their current model
    // Update user safely with helper function
    user = safelyUpdateUserFields(user, req.body);
    
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
      user: userResponse,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/auth/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    
    // Try to find and delete the user from any model
    let user: any = null;
    
    user = await Developer.findById(userId);
    if (user) {
      await user.deleteOne();
      res.status(200).json({ success: true, message: 'User deleted successfully' });
      return;
    }
    
    user = await ProjectManager.findById(userId);
    if (user) {
      await user.deleteOne();
      res.status(200).json({ success: true, message: 'User deleted successfully' });
      return;
    }
    
    user = await Designer.findById(userId);
    if (user) {
      await user.deleteOne();
      res.status(200).json({ success: true, message: 'User deleted successfully' });
      return;
    }
    
    user = await Client.findById(userId);
    if (user) {
      await user.deleteOne();
      res.status(200).json({ success: true, message: 'User deleted successfully' });
      return;
    }
    
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
};

/**
 * @desc    Get users filtered by role
 * @route   GET /api/auth/users/role/:role
 * @access  Private/Admin
 */
export const getUsersByRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.params;
    
    // Find users based on role
    let users = [];
    
    switch (role) {
      case 'developer':
      case 'admin':
      case 'teamLead':
        users = await Developer.find({ role }).select('-password');
        break;
      case 'projectManager':
        users = await ProjectManager.find({}).select('-password');
        break;
      case 'designer':
        users = await Designer.find({}).select('-password');
        break;
      case 'client':
        users = await Client.find({}).select('-password');
        break;
      default:
        res.status(400).json({ message: 'Invalid role specified' });
        return;
    }
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users by role:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}; 