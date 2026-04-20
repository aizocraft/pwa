import { Types, Document } from 'mongoose';


export interface INotification {
  /** User who receives the notification */
  userId: Types.ObjectId | string;
  
  /** Notification type/category */
  type: 'order' | 'payment' | 'stock' | 'user' | 'system' | 'shipping' | 'review';
  
  /** Short title (dashboard display) */
  title: string;
  
  /** Detailed message */
  message: string;
  
  /** Read status */
  read: boolean;
  
  /** Optional action link */
  actionUrl?: string;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
  
  /** User reference (populated) */
  user?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };
}

export interface INotificationDocument extends INotification, Document {}

export interface CreateNotificationInput {
  userId: string;
  type: INotification['type'];
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface UpdateNotificationInput {
  read?: boolean;
}

export interface GetNotificationsQuery {
  userId?: string;
  read?: boolean;
  type?: INotification['type'];
  limit?: number;
  page?: number;
  sort?: 'createdAt' | 'read';
}

export interface NotificationListResponse {
  notifications: INotificationDocument[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface BulkMarkReadResponse {
  markedCount: number;
  totalUnread: number;
}

