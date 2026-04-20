import Notification from '../models/Notification';
import { CreateNotificationInput, INotificationDocument } from '../types/notification';
import { GetNotificationsQuery, NotificationListResponse } from '../types/notification';
import { Types } from 'mongoose';

/**
 * Create notification for user
 */
export const createNotification = async (input: CreateNotificationInput): Promise<INotificationDocument> => {
  const notification = new Notification(input);
  await notification.save();
  return notification;
};

/**
 * Create multiple notifications at once
 */
export const createBulkNotifications = async (inputs: CreateNotificationInput[]): Promise<INotificationDocument[]> => {
  const notifications = await Notification.insertMany(inputs);
  return notifications;
};

/**
 * Get user notifications (paginated)
 */
export const getUserNotifications = async (
  userId: string, 
  query: GetNotificationsQuery = {}
): Promise<NotificationListResponse> => {
  const {
    read = undefined,
    type,
    limit = 20,
    page = 1,
    sort = '-createdAt'
  } = query;

  const filter: any = { userId };
  
  if (read !== undefined) {
    filter.read = read;
  }
  if (type) {
    filter.type = type;
  }

  const skip = (page - 1) * limit;
  
  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .populate('userId', 'name email')
      .sort(sort)
      .limit(limit)
      .skip(skip),
    Notification.countDocuments(filter)
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    }
  };
};

/**
 * Get notifications by type
 */
export const getNotificationsByType = async (
  userId: string,
  type: string,
  limit: number = 50,
  read?: boolean
): Promise<INotificationDocument[]> => {
  const filter: any = { userId, type };
  if (read !== undefined) {
    filter.read = read;
  }
  
  return Notification.find(filter)
    .sort('-createdAt')
    .limit(limit)
    .populate('userId', 'name email');
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  return Notification.countDocuments({ 
    userId, 
    read: false 
  });
};

/**
 * Mark single notification as read
 */
export const markAsRead = async (notificationId: string): Promise<INotificationDocument | null> => {
  return Notification.findByIdAndUpdate(
    notificationId,
    { read: true },
    { new: true }
  ).populate('userId', 'name email');
};

/**
 * Mark all user notifications as read
 */
export const markAllAsRead = async (userId: string): Promise<{ markedCount: number }> => {
  const result = await Notification.updateMany(
    { userId, read: false },
    { read: true }
  );
  return { markedCount: result.modifiedCount };
};

/**
 * Delete single notification
 */
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  const result = await Notification.findByIdAndDelete(notificationId);
  return !!result;
};

/**
 * Delete all read notifications for user
 */
export const deleteAllRead = async (userId: string): Promise<{ deletedCount: number }> => {
  const result = await Notification.deleteMany({ 
    userId, 
    read: true 
  });
  return { deletedCount: result.deletedCount };
};

/**
 * Delete old notifications (older than specified days)
 */
export const deleteOldNotifications = async (daysOld: number = 90): Promise<{ deletedCount: number }> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const result = await Notification.deleteMany({
    createdAt: { $lt: cutoffDate },
    read: true
  });
  
  return { deletedCount: result.deletedCount };
};

/**
 * Preset notification templates
 */
export const NOTIFICATION_TEMPLATES = {
  newOrder: (orderNumber: string, customerName: string, total: number) => ({
    title: `🛍️ New Order #${orderNumber}`,
    message: `${customerName} placed an order worth KES ${total.toFixed(2)}`,
    type: 'order' as const,
    actionUrl: `/dashboard/orders`
  }),
  
  orderStatus: (orderNumber: string, status: string) => ({
    title: `📦 Order #${orderNumber} Updated`,
    message: `Your order status has been updated to: ${status.toUpperCase()}`,
    type: 'order' as const,
    actionUrl: `/orders/${orderNumber}`
  }),
  
  lowStock: (productName: string, stock: number) => ({
    title: '⚠️ Low Stock Alert',
    message: `${productName} only has ${stock} units left. Please restock soon.`,
    type: 'stock' as const,
    actionUrl: `/dashboard/products`
  }),
  
  paymentReceived: (orderNumber: string, amount: number) => ({
    title: '💰 Payment Received',
    message: `KES ${amount.toFixed(2)} payment received for order #${orderNumber}`,
    type: 'payment' as const,
    actionUrl: `/orders/${orderNumber}`
  }),
  
  paymentFailed: (orderNumber: string, reason: string) => ({
    title: '❌ Payment Failed',
    message: `Payment failed for order #${orderNumber}. Reason: ${reason}`,
    type: 'payment' as const,
    actionUrl: `/orders/${orderNumber}/payment`
  }),
  
  orderShipped: (orderNumber: string, trackingNumber?: string) => ({
    title: '🚚 Order Shipped',
    message: `Your order #${orderNumber} has been shipped${trackingNumber ? ` with tracking #${trackingNumber}` : ''}`,
    type: 'shipping' as const,
    actionUrl: `/orders/${orderNumber}`
  }),
  
  orderDelivered: (orderNumber: string) => ({
    title: '✅ Order Delivered',
    message: `Your order #${orderNumber} has been delivered. Thank you for shopping with us!`,
    type: 'shipping' as const,
    actionUrl: `/orders/${orderNumber}`
  }),
  
  reviewRequest: (orderNumber: string, productName: string) => ({
    title: '📝 Review Request',
    message: `How was your experience with ${productName}? Leave a review for order #${orderNumber}`,
    type: 'review' as const,
    actionUrl: `/products/review`
  }),
  
  welcome: (userName: string) => ({
    title: '👋 Welcome to Our Store!',
    message: `Hi ${userName}, thank you for joining us. Start exploring our products!`,
    type: 'user' as const,
    actionUrl: `/products`
  }),
  
  promoCode: (code: string, discount: string) => ({
    title: '🎉 Special Offer!',
    message: `Use code ${code} to get ${discount} off your next purchase`,
    type: 'system' as const,
    actionUrl: `/promo/${code}`
  })
} as const;

