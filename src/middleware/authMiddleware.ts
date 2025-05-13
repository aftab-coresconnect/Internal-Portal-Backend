import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { TokenData } from '../types/jwt';

// Extend the Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
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

      // Set req.user to the authenticated user
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        res.status(401).json({ message: 'User not found' });
        return;
      }

      // Assigning user to req.user with type assertion
      req.user = user as IUser;

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

export { protect, authorize }; 