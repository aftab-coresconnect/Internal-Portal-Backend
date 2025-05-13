import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for authentication
 * @param {string} userId - The user ID to include in the token
 * @returns {string} JWT token
 */
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_not_for_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  
  // Using type assertion to handle the complex type requirements
  return jwt.sign(
    { id: userId }, 
    secret, 
    { expiresIn } as jwt.SignOptions
  );
};

export default generateToken; 