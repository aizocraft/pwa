// server/routes/auth.routes.ts
import { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/auth';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Only allow 'user' role for public registration
    const allowedRole = role === 'sales' ? 'user' : 'user';
    
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new UserModel({ 
      name, 
      email, 
      password, 
      role: allowedRole,
      isActive: true
    });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_change_me',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isActive: user.isActive 
      }
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    
    // Check if user exists and is active
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or account disabled' });
    }
    
    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_change_me',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// GET /api/auth/profile
router.get('/profile', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = await UserModel.findById(req.user.userId).select('-password -__v');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { name, email, phone, avatar } = req.body;
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.userId,
      { name, email, phone, avatar },
      { new: true, runValidators: true }
    ).select('-password -__v');
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update profile' });
  }
});

export default router;