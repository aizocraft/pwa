// src/lib/profile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile } from './api'
import api from './api'
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


