// server/routes/auth.routes.ts
import { Router, Request, Response } from 'express';
import passport from 'passport';
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
      isActive: true,
      provider: 'local'
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
        isActive: user.isActive,
        avatar: user.avatar,
        provider: user.provider
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
    
    // Check if user is using Google auth
    if (user.provider === 'google') {
      return res.status(401).json({ 
        error: 'This account uses Google Sign-In. Please sign in with Google.',
        provider: 'google'
      });
    }
    
    // Verify password for local users
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
        isActive: user.isActive,
        avatar: user.avatar,
        provider: user.provider
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// GOOGLE AUTH ROUTES

// Initiate Google authentication
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google authentication callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret_change_me',
        { expiresIn: '7d' }
      );
      
      // Get frontend URL from env or use default
      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      
      // Redirect to frontend with token and user info
      const userData = encodeURIComponent(JSON.stringify({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        avatar: user.avatar,
        provider: user.provider
      }));
      
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${userData}`);
    } catch (error) {
      console.error('Google callback error:', error);
      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
  }
);

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
    
    // Don't allow email change for Google users (optional)
    const user = await UserModel.findById(req.user.userId);
    if (user?.provider === 'google' && email !== user.email) {
      return res.status(400).json({ error: 'Cannot change email for Google-authenticated accounts' });
    }
    
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

// GET /api/auth/google/status - Check if Google auth is configured
router.get('/google/status', (req: Request, res: Response) => {
  const isConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  res.json({ 
    configured: isConfigured,
    message: isConfigured ? 'Google auth is available' : 'Google auth is not configured'
  });
});

export default router;