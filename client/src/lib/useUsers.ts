'use client'

import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword,
  bulkUpdateUserStatus,
  exportUsersToCSV
} from './api'
import { User, CreateUserRequest, UpdateUserRequest, BulkStatusResponse } from '@/types/user'
import toast from 'react-hot-toast'
// import { getCurrentUser } from './api' // for auth checks - localStorage function, not used

export interface UsersQueryParams {
  role?: string
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function useUsers(params: UsersQueryParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await getUser(id);
      return response.data;
    },
    staleTime: 60 * 1000,
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      toast.success('User created successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['userDashboardStats'] })
      queryClient.refetchQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create user')
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => 
      updateUser(id, data),
    onSuccess: (_, variables) => {
      toast.success('User updated successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update user')
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete user')
    },
  })
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => toggleUserStatus(id),
    onSuccess: () => {
      toast.success('User status updated')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update status')
    },
  })
}

export function useResetUserPassword() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) => 
      resetUserPassword(id, newPassword),
    onSuccess: () => {
      toast.success('Password reset successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to reset password')
    },
  })
}

export function useBulkUpdateUserStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userIds, isActive }: { userIds: string[]; isActive: boolean }) => 
      bulkUpdateUserStatus(userIds, isActive),
    onSuccess: () => {
      toast.success('Bulk update completed')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Bulk update failed')
    },
  })
}

export function useExportUsers() {
  return useMutation({
    mutationFn: (params?: { role?: string; isActive?: boolean }) => 
      exportUsersToCSV(params),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Users exported successfully')
    },
  })
}

// Combined hook for convenience (replaces old useUsers)
export function useUsersPage(params: UsersQueryParams) {
  const usersQuery = useUsers(params)
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()
  const toggleMutation = useToggleUserStatus()
  
  const refetch = () => usersQuery.refetch()
  
  return {
    users: usersQuery.data?.users || [],
    pagination: usersQuery.data?.pagination,
    isLoading: usersQuery.isLoading,
    isFetching: usersQuery.isFetching,
    error: usersQuery.error,
    refetch,
    
    // Mutations
    createUser: createMutation,
    updateUser: updateMutation,
    deleteUser: deleteMutation,
    toggleUserStatus: toggleMutation,
  }
}
