// server/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User';

// Extend Express Request type to add custom properties to the existing user object


const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me') as any;
    const user = await UserModel.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Token is not valid' });
    }

    // Populate complete user object matching global Express types
    req.user = {
      userId: user._id.toString(),
      role: user.role,
      id: user._id.toString(),
      email: user.email
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export default authMiddleware;