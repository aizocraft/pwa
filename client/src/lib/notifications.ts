import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from './api';
import { 
  Notification, 
  NotificationsResponse, 
  UnreadCountResponse, 
  BulkMarkReadResponse,
  GetNotificationsParams,
  NOTIFICATION_QUERY_KEYS 
} from '@/types/notification';
import { getToken } from './auth';

export const notificationsApi = {
  /**
   * Get user notifications (paginated)
   */
  getNotifications: async (params: GetNotificationsParams = {}): Promise<NotificationsResponse> => {
    const query = new URLSearchParams();
    if (params.read !== undefined) query.append('read', params.read.toString());
    if (params.type) query.append('type', params.type);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const response = await api.get(`/notifications?${query.toString()}`);
    return response.data;
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<BulkMarkReadResponse> => {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  },

  /**
   * Delete single notification
   */
  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  /**
   * Delete all read notifications
   */
  deleteAllRead: async (): Promise<BulkMarkReadResponse> => {
    const response = await api.delete('/notifications/delete-read');
    return response.data;
  }
};

// 🪝 React Query Hooks
export const useNotifications = (params: GetNotificationsParams = {}) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list(params),
    queryFn: () => notificationsApi.getNotifications(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
    queryFn: notificationsApi.getUnreadCount,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: (_, notificationId) => {
      // Optimistically update all notification lists
      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.lists(),
        (old: any) => {
          if (!old?.data?.notifications) return old;
          return {
            ...old,
            data: {
              ...old.data,
              notifications: old.data.notifications.map((n: Notification) =>
                n._id === notificationId 
                  ? { ...n, read: true }
                  : n
              )
            }
          };
        }
      );
      
      // Update unread count
      queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.unreadCount, (old: any) => {
        if (!old?.data?.unreadCount) return old;
        return {
          ...old,
          data: {
            ...old.data,
            unreadCount: Math.max(0, old.data.unreadCount - 1)
          }
        };
      });

      toast.success('Marked as read');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to mark as read');
    }
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      // Invalidate all queries
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
      toast.success('All notifications marked as read');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to mark all as read');
    }
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.lists(),
        (old: any) => {
          if (!old?.data?.notifications) return old;
          return {
            ...old,
            data: {
              ...old.data,
              notifications: old.data.notifications.filter((n: Notification) => n._id !== notificationId)
            }
          };
        }
      );
      
      toast.success('Notification deleted');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to delete notification');
    }
  });
};

export const useDeleteAllRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.deleteAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
      toast.success('Read notifications cleared');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to clear read notifications');
    }
  });
};

// 🔄 Auto-sync hook for real-time unread badge
export const useNotificationSync = () => {
  const unreadQuery = useUnreadCount();
  
  return {
    unreadCount: unreadQuery.data?.data?.unreadCount ?? 0,
    isLoading: unreadQuery.isLoading,
    refetch: unreadQuery.refetch
  };
};

