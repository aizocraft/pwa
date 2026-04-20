// src/lib/profile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile, uploadAvatar, deleteAvatar, getAvatarUrl } from './api'
import api from './api'
import { useAuth } from './auth'
import { User } from '@/types/user'
import toast from 'react-hot-toast'
import type { ChangePasswordRequest } from '@/types/user'

export function useProfile() {
  const queryClient = useQueryClient()

  const profileQuery = useQuery<User | null>({
    queryKey: ['profile'],
    queryFn: getProfile,
  })

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    }
  })

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    refetch: profileQuery.refetch,
    update: updateMutation,
  }
}

export function useChangePassword() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await api.post('/auth/change-password', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Password changed successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to change password')
    }
  })
}

export function useDeleteProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => api.delete('/auth/profile'),
    onSuccess: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      queryClient.clear()
      toast.success('Account deleted successfully')
      window.location.href = '/'
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete account')
    }
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    },
    onSuccess: () => {
      toast.success('Password reset link sent to your email')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to send reset email')
    }
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const response = await api.post('/auth/reset-password', { token, newPassword })
      return response.data
    },
    onSuccess: () => {
      toast.success('Password reset successfully. You can now log in.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to reset password')
    }
  })
}

import { Order } from '@/types/order'

export function useUserOrders(page: number = 1, limit: number = 5) {
  return useQuery({
    queryKey: ['userOrders', page, limit],
    queryFn: () => api.get('/orders'),
    select: (data) => ({
      orders: data.data.slice((page - 1) * limit, page * limit) as Order[],
      total: data.data.length,
      page,
      limit,
      hasNext: page * limit < data.data.length
    })
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Image must be less than 5MB');
      }

      // Get user ID consistently - prioritize profile over localStorage
      const userId = user?.id || user?._id;
      console.log('[AVATAR] Attempting upload. userId:', userId, 'user:', user);
      
      if (!userId) {
        throw new Error('No user ID found. Please refresh and try again.');
      }

      console.log('[AVATAR] Uploading to /users/', userId, '/avatar');
      
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post(`/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      console.log('[AVATAR] Upload success:', data);
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Update localStorage user data
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (data.data?.avatar) {
          userData.avatar = data.data.avatar;
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
      
      toast.success('Profile picture updated successfully');
    },
    onError: (error: any) => {
      console.error('[AVATAR] Upload error:', error.response?.status, error.response?.data);
      const msg = error.response?.data?.error || error.message || 'Failed to upload image';
      toast.error(msg);
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const userId = user?.id || user?._id;
      console.log('[AVATAR] Attempting delete. userId:', userId);
      
      if (!userId) {
        throw new Error('No user ID found. Please refresh and try again.');
      }

      console.log('[AVATAR] Deleting from /users/', userId, '/avatar');
      const response = await api.delete(`/users/${userId}/avatar`);
      return response.data;
    },
    onSuccess: () => {
      console.log('[AVATAR] Delete success');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Clear localStorage avatar
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        delete userData.avatar;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      toast.success('Profile picture removed');
    },
    onError: (error: any) => {
      console.error('[AVATAR] Delete error:', error.response?.status, error.response?.data);
      const msg = error.response?.data?.error || 'Failed to remove profile picture';
      toast.error(msg);
    },
  });
}
