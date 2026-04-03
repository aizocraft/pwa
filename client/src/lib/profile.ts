// src/lib/profile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile } from './api'
import { User } from '@/types/user'

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
      // Update localStorage with new user data
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