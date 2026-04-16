// server/routes/user.routes.ts
/// <reference path="../types/express.d.ts" />
import { Router, Request, Response, NextFunction } from 'express';
import authMiddleware from '../middleware/auth';
import UserModel from '../models/User';
import OrderModel from '../models/Order';
import type { IUser } from '../models/User';
import type { AuthUser } from '../types/express';

const router = Router();

// Role-based middleware using global Request type
const requireRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes((req.user as AuthUser)!.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }
    next();
  };
};

// Admin only middleware
const adminOnly = requireRoles(['admin']);

// Admin or sales middleware
const adminOrSales = requireRoles(['admin', 'sales']);

// ==================== GET Routes ====================

/**
 * GET /api/users
 * List all users with pagination and filtering
 * Access: Admin or Sales
 */
router.get('/', authMiddleware, adminOrSales, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute queries in parallel
    const usersRaw = await UserModel.find(query)
        .select('-password -resetPasswordToken -resetPasswordExpires -__v')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean();
    
    const users: IUser[] = usersRaw as unknown as IUser[];
    const total = await UserModel.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch users' 
    });
  }
});

/**
 * GET /api/users/:id
 * Get single user by ID
 * Access: Admin or Sales
 */
router.get('/:id', authMiddleware, adminOrSales, async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpires -__v')
      .lean() as unknown as IUser;

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Get additional stats for admin
    let stats = null;
    if ((req.user as AuthUser)?.role === 'admin') {
      const [orderCount, totalSpent] = await Promise.all([
        OrderModel.countDocuments({ user: user._id }),
        OrderModel.aggregate([
          { $match: { user: user._id, status: 'delivered' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
      ]);
      
      stats = {
        orderCount,
        totalSpent: totalSpent[0]?.total || 0
      };
    }

    res.json({
      success: true,
      data: user,
      ...(stats && { stats })
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user' 
    });
  }
});

// ==================== POST Routes ====================

/**
 * POST /api/users
 * Create new user (admin only)
 * Access: Admin
 */
router.post('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, avatar } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 6 characters' 
      });
    }

    // Check existing user
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        error: 'User with this email already exists' 
      });
    }

    // Create user
    const user = new UserModel({
      name,
      email,
      password,
      role: role || 'user',
      phone,
      avatar,
      isActive: true,
      provider: 'local'
    });

    await user.save();

    // Return user without sensitive data
    const userData = await UserModel.findById(user._id)
      .select('-password -resetPasswordToken -resetPasswordExpires -__v')
      .lean() as unknown as IUser;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userData
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Failed to create user' 
    });
  }
});

/**
 * POST /api/users/:id/reset-password
 * Reset user password (admin only)
 * Access: Admin
 */
router.post('/:id/reset-password', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'New password must be at least 6 characters' 
      });
    }

    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    if (user.provider === 'google') {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot reset password for Google-authenticated accounts' 
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * POST /api/users/:id/toggle-status
 * Toggle user active status (admin only)
 * Access: Admin
 */
router.post('/:id/toggle-status', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Prevent deactivating your own account
    if (user._id.toString() === (req.user as AuthUser)?.userId && user.isActive) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot deactivate your own account' 
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: user.isActive }
    });
  } catch (error: any) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to toggle user status' 
    });
  }
});

// ==================== PUT Routes ====================

/**
 * PUT /api/users/:id
 * Update user information
 * Access: Admin (full access) or Sales (limited access)
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, isActive, avatar } = req.body;

    const targetUser = await UserModel.findById(id);
    if (!targetUser) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Build update object
    const updateData: any = {};

    // Basic fields (allowed for both admin and sales)
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Email update with validation
    if (email !== undefined && email !== targetUser.email) {
      if (targetUser.provider === 'google') {
        return res.status(400).json({ 
          success: false,
          error: 'Cannot change email for Google-authenticated accounts' 
        });
      }
      
      // Check email uniqueness
      const emailExists = await UserModel.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(409).json({ 
          success: false,
          error: 'Email already in use by another account' 
        });
      }
      
      updateData.email = email;
    }

  // Admin-only fields
if ((req.user as AuthUser)?.role === 'admin') {
  if (role && ['user', 'sales', 'admin'].includes(role)) {
    updateData.role = role;
  }
  if (typeof isActive === 'boolean') {
    // Prevent deactivating own account
    if (!isActive && targetUser._id.toString() === (req.user as AuthUser)?.userId) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot deactivate your own account' 
      });
    }
    updateData.isActive = isActive;
  }
}

    // Update user
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires -__v') as unknown as IUser;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Failed to update user' 
    });
  }
});

// ==================== DELETE Routes ====================

/**
 * DELETE /api/users/:id
 * Delete or deactivate user based on orders
 * Access: Admin only
 */
router.delete('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === (req.user as AuthUser)?.userId) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot delete your own account' 
      });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Check for existing orders
    const hasOrders = await OrderModel.exists({ user: user._id });

    if (hasOrders) {
      // Soft delete - deactivate instead
      user.isActive = false;
      await user.save();
      
      return res.json({
        success: true,
        message: 'User deactivated successfully (has existing orders)',
        data: { action: 'deactivated', userId: user._id }
      });
    }

    // Hard delete
    await user.deleteOne();
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: { action: 'deleted', userId: user._id }
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to delete user' 
    });
  }
});

// ==================== Bulk Operations ====================

/**
 * POST /api/users/bulk/status
 * Bulk update user status (admin only)
 * Access: Admin
 */
router.post('/bulk/status', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { userIds, isActive } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'User IDs array is required' 
      });
    }

    // Remove current user from bulk update if deactivating
    const filteredIds = !isActive 
      ? userIds.filter(id => id !== (req.user as AuthUser)?.userId)
      : userIds;

    const result = await UserModel.updateMany(
      { _id: { $in: filteredIds } },
      { $set: { isActive } }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} users updated successfully`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error: any) {
    console.error('Error in bulk status update:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update users' 
    });
  }
});

/**
 * GET /api/users/export/csv
 * Export users to CSV (admin only)
 * Access: Admin
 */
router.get('/export/csv', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { role, isActive } = req.query;
    
    const query: any = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await UserModel.find(query)
      .select('name email role isActive phone createdAt provider')
      .lean();

    // Generate CSV
    const csvHeaders = ['Name', 'Email', 'Role', 'Status', 'Phone', 'Provider', 'Created At'];
    const csvRows = users.map((user: any) => [
      (user as any).name,
      (user as any).email,
      (user as any).role,
      (user as any).isActive ? 'Active' : 'Inactive',
      (user as any).phone || '',
      (user as any).provider || 'local',
      new Date((user as any).createdAt).toISOString()
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=users-${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error: any) {
    console.error('Error exporting users:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to export users' 
    });
  }
});

export default router;