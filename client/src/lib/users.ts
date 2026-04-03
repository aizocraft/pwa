// src/lib/users.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, createUser, updateUser, deleteUser, toggleUserStatus } from './api'
import { User, UserListResponse, CreateUserRequest, UpdateUserRequest } from '@/types/user'
import toast from 'react-hot-toast'

export function useUsers(params?: {
  role?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient()

  const usersQuery = useQuery<UserListResponse>({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create user')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => 
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update user')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete user')
    }
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User status updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update status')
    }
  })

  return {
    users: usersQuery.data?.users || [],
    pagination: usersQuery.data?.pagination,
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
    createUser: createMutation,
    updateUser: updateMutation,
    deleteUser: deleteMutation,
    toggleUserStatus: toggleStatusMutation,
  }
}