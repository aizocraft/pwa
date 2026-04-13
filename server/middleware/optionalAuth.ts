// middleware/optionalAuth.ts
import { Request, Response, NextFunction } from 'express';
// DELETE THIS LINE: import '../types/express.d.ts';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User';

interface AuthUser {
  userId: string;
  role: string;
}

const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // No token - treat as guest user
      (req as any).user = undefined;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me') as AuthUser;
    
    // Optionally verify user still exists
    const user = await UserModel.findById(decoded.userId).select('-password');
    
    if (!user) {
      // User doesn't exist - treat as guest
      (req as any).user = undefined;
      return next();
    }

    // User is authenticated
    (req as any).user = {
      userId: decoded.userId,
      role: user.role || 'user'
    };
    next();
  } catch (error) {
    // Invalid token - treat as guest
    console.error('Optional auth error:', error);
    (req as any).user = undefined;
    next();
  }
};

export default optionalAuthMiddleware;