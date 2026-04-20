import { Router } from 'express';
import { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  deleteAllRead,
  getUnreadCount,
  getNotificationsByType,
  deleteOldNotifications
} from '../services/notification.service';
import { GetNotificationsQuery } from '../types/notification';
import authMiddleware from '../middleware/auth';
import Notification from '../models/Notification';
import User from '../models/User';
import { Types } from 'mongoose';

const router = Router();

// Helper to check if user is admin
const isAdmin = async (userId: string): Promise<boolean> => {
  const user = await User.findById(userId).select('role');
  return user?.role === 'admin';
};

// GET /api/notifications - Get user notifications (paginated)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).userId?.toString();
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    interface QueryParams {
      read?: string;
      type?: string;
      page?: string;
      limit?: string;
    }
    const { read, type, page = '1', limit = '20' } = req.query as QueryParams;
    
    const query: GetNotificationsQuery = {};
    if (read !== undefined) {
      query.read = read === 'true';
    }
    if (type) {
      query.type = type as any;
    }
    query.page = parseInt(page);
    query.limit = parseInt(limit);

    const notifications = await getUserNotifications(userId, query);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).userId?.toString();
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const count = await getUnreadCount(userId);
    
    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch unread count' });
  }
});

// GET /api/notifications/types/:type - Get notifications by type
router.get('/types/:type', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).userId?.toString();
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { type } = req.params;
    const { limit = '50', read } = req.query;
    
    const notifications = await getNotificationsByType(
      userId, 
      type as any, 
      parseInt(limit as string),
      read === 'true' ? true : read === 'false' ? false : undefined
    );
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error: any) {
    console.error('Get notifications by type error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read - Mark single as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = (req.user as any)._id?.toString() || (req.user as any).userId?.toString();
    
    if (!Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }
    
    // Verify user owns notification BEFORE updating
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if (String(notification.userId) !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updatedNotification = await markAsRead(notificationId);
    res.json({
      success: true,
      data: updatedNotification
    });
  } catch (error: any) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: error.message || 'Failed to mark as read' });
  }
});

// POST /api/notifications/mark-all-read - Mark all as read
router.post('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).userId?.toString();
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const result = await markAllAsRead(userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: error.message || 'Failed to mark all as read' });
  }
});

// DELETE /api/notifications/:id - Delete single notification
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = (req.user as any)._id?.toString() || (req.user as any).userId?.toString();
    
    if (!Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }
    
    // Verify user owns notification BEFORE deleting
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if (String(notification.userId) !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const deleted = await deleteNotification(notificationId);
    res.json({ 
      success: true, 
      data: { deleted: true, message: 'Notification deleted' }
    });
  } catch (error: any) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete notification' });
  }
});

// DELETE /api/notifications/delete-read - Delete all read notifications
router.delete('/delete-read', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).userId?.toString();
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const result = await deleteAllRead(userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Delete read notifications error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete read notifications' });
  }
});

// DELETE /api/notifications/delete-all - Delete ALL notifications for user (admin only)
router.delete('/delete-all', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).userId?.toString();
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Check if user is admin
    const user = await User.findById(userId).select('role');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const result = await Notification.deleteMany({});
    
    res.json({
      success: true,
      data: { deletedCount: result.deletedCount, message: 'All notifications deleted' }
    });
  } catch (error: any) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete notifications' });
  }
});

// DELETE /api/notifications/cleanup/old - Delete old read notifications (admin only)
router.delete('/cleanup/old', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).userId?.toString();
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Check if user is admin
    const user = await User.findById(userId).select('role');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { days = '90' } = req.query;
    const daysOld = parseInt(days as string);
    const result = await deleteOldNotifications(daysOld);
    
    res.json({
      success: true,
      data: { deletedCount: result.deletedCount, message: `Deleted notifications older than ${daysOld} days` }
    });
  } catch (error: any) {
    console.error('Cleanup old notifications error:', error);
    res.status(500).json({ error: error.message || 'Failed to cleanup notifications' });
  }
});

// POST /api/notifications/broadcast - Send notification to all users (admin only)
router.post('/broadcast', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).userId?.toString();
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Check if user is admin
    const adminUser = await User.findById(userId).select('role name email');
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { title, message, type, actionUrl, metadata, userRole } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    
    // Build user filter
    const filter: any = { isActive: true };
    if (userRole && userRole !== 'all') {
      filter.role = userRole;
    }
    
    const users = await User.find(filter).select('_id');
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'No users found to broadcast to' });
    }
    
    const notifications = [];
    for (const user of users) {
      notifications.push({
        userId: user._id,
        type: type || 'system',
        title,
        message,
        actionUrl: actionUrl || null,
        metadata: {
          ...metadata,
          broadcastBy: adminUser.email,
          broadcastAt: new Date().toISOString()
        }
      });
    }
    
    const result = await Notification.insertMany(notifications);
    
    res.json({
      success: true,
      data: { 
        broadcastCount: result.length, 
        message: `Broadcast sent to ${result.length} user(s) successfully` 
      }
    });
  } catch (error: any) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ error: error.message || 'Failed to broadcast notifications' });
  }
});

// GET /api/notifications/admin/stats - Get notification statistics (admin only)
router.get('/admin/stats', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any)._id?.toString() || (req.user as any).userId?.toString();
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Check if user is admin
    const user = await User.findById(userId).select('role');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const stats = await Notification.aggregate([
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalNotifications: { $sum: 1 },
                unreadCount: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } },
                readCount: { $sum: { $cond: [{ $eq: ['$read', true] }, 1, 0] } }
              }
            }
          ],
          byType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                unread: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } }
              }
            }
          ],
          last30Days: [
            {
              $match: {
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
              }
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        total: stats[0].totalStats[0] || { totalNotifications: 0, unreadCount: 0, readCount: 0 },
        byType: stats[0].byType,
        last30Days: stats[0].last30Days
      }
    });
  } catch (error: any) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch statistics' });
  }
});

export default router;