// server/routes/user.routes.ts
import { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/auth';
import UserModel from '../models/User';

const router = Router();

// Check if user has admin or sales role
const isAdminOrSales = (req: Request & { user?: any }) => {
  return req.user?.role === 'admin' || req.user?.role === 'sales';
};

// GET /api/users - Get all users (admin and sales can view)
router.get('/', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdminOrSales(req)) {
      return res.status(403).json({ error: 'Admin or Sales access required' });
    }

    const { role, search, isActive, page = '1', limit = '20' } = req.query;
    
    const query: any = {};
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      UserModel.countDocuments(query)
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - Get single user (admin and sales)
router.get('/:id', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!isAdminOrSales(req)) {
      return res.status(403).json({ error: 'Admin or Sales access required' });
    }

    const user = await UserModel.findById(req.params.id).select('-password -__v');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users - Create user (admin only for sales/roles)
router.post('/', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required to create users' });
    }

    const { name, email, password, role, phone } = req.body;
    
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new UserModel({ 
      name, 
      email, 
      password, 
      role: role || 'user',
      phone,
      isActive: true
    });
    await user.save();

    const userData = await UserModel.findById(user._id).select('-password -__v');

    res.status(201).json({ 
      message: 'User created successfully', 
      user: userData 
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create user' });
  }
});

// PUT /api/users/:id - Update user (admin only for role changes, sales can update basic info)
router.put('/:id', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, isActive } = req.body;
    
    const targetUser = await UserModel.findById(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build update data
    const updateData: any = { name, email, phone };
    
    // Only admin can change role and active status
    if (req.user.role === 'admin') {
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.json({ 
      message: 'User updated successfully', 
      user: updatedUser 
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    
    // Prevent self-deletion
    if (id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// POST /api/users/:id/toggle-status - Toggle user active status (admin only)
router.post('/:id/toggle-status', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

export default router;