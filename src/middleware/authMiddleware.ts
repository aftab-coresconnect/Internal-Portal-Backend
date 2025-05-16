import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Developer, { IDeveloper } from '../models/Developer';
import ProjectManager from '../models/ProjectManager';
import Designer from '../models/Designer';
import Client from '../models/Client';
import Admin from '../models/Admin';
import { TokenData } from '../types/jwt';
import { GenericUser } from '../types/user';

// Extend the Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: GenericUser;
    }
  }
}

// JWT token payload interface
interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

/**
 * Middleware to protect routes that require authentication
 */
const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // Check if token exists in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_not_for_production';
      const decoded = jwt.verify(token, secret) as TokenData;

      // Try to find the user in any of the models
      let user = null;
      
      // Check Admin model first
      user = await Admin.findById(decoded.id).select('-password');
      
      // If not found, check Developer model
      if (!user) {
        user = await Developer.findById(decoded.id).select('-password');
      }
      
      // If not found, check ProjectManager model
      if (!user) {
        user = await ProjectManager.findById(decoded.id).select('-password');
      }
      
      // If not found, check Designer model
      if (!user) {
        user = await Designer.findById(decoded.id).select('-password');
      }
      
      // If not found, check Client model
      if (!user) {
        user = await Client.findById(decoded.id).select('-password');
      }
      
      if (!user) {
        res.status(401).json({ message: 'User not found' });
        return;
      }

      // Assigning user to req.user with type assertion
      req.user = user as GenericUser;

      next();
      return;
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};

/**
 * Middleware to check if user has the required role
 * @param {string[]} roles - Array of roles that have access
 */
const authorize = (roles: string[] = []): ((req: Request, res: Response, next: NextFunction) => void) => {
  if (typeof roles === 'string') {
    roles = [roles as string];
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, no user' });
      return;
    }

    if (roles.length && !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
const admin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized, no user' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
    return;
  }

  next();
};

export { protect, authorize, admin }; 