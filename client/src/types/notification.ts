// Notification types matching backend exactly
export interface Notification {
  _id: string;
  userId: string;
  type: 'order' | 'payment' | 'stock' | 'user' | 'system' | 'shipping' | 'review';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

// API Request Types
export interface MarkNotificationReadRequest {
  notificationId: string;
}

export interface GetNotificationsParams {
  read?: boolean;
  type?: Notification['type'];
  page?: number;
  limit?: number;
}

// API Response Types
export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

export interface BulkMarkReadResponse {
  success: boolean;
  data: {
    markedCount: number;
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

// React Query Keys
export const NOTIFICATION_QUERY_KEYS = {
  all: ['notifications'] as const,
  lists: () => [...NOTIFICATION_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any> = {}) => [...NOTIFICATION_QUERY_KEYS.lists(), filters] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
  details: (id: string) => [...NOTIFICATION_QUERY_KEYS.all, 'detail', id] as const
} as const;

