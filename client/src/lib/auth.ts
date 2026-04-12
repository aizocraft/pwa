// src/lib/auth.ts
import { useQuery, useQueryClient, useQueryClient as useQC } from '@tanstack/react-query'
import { useEffect } from 'react'
import { User } from '@/types/user'

export type { User }

export function getUser(): User | null {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) as User : null
  } catch {
    return null
  }
}

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function isLoggedIn(): boolean {
  return !!getUser() && !!getToken()
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin'
}

export function isSales(user: User | null): boolean {
  return user?.role === 'sales'
}

export function isAdminOrSales(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'sales'
}

export function logout(queryClient?: ReturnType<typeof useQueryClient>): void {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  queryClient?.invalidateQueries({ queryKey: ['user'] })
  queryClient?.removeQueries({ queryKey: ['user'] })
  queryClient?.invalidateQueries({ queryKey: ['profile'] })
  queryClient?.removeQueries({ queryKey: ['profile'] })
}

import { getProfile } from './api';

async function fetchProfile(): Promise<User | null> {
  const token = getToken()
  if (!token) {
    return null
  }

  try {
    const user = await getProfile();
    return user;
  } catch {
    logout()
    return null
  }
}

export function useAuth() {
  const queryClient = useQueryClient()
  const localUser = getUser()
  const { data: user, isPending: loading, isFetching } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: fetchProfile,
    initialData: localUser,
    staleTime: 60 * 1000,
refetchInterval: 300 * 1000, // 5min
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: localUser,
  })

  useEffect(() => {
    if (!getToken()) {
      queryClient.removeQueries({ queryKey: ['user'] })
    }
  }, [queryClient])

  const logoutHandler = () => logout(queryClient)

  const optimisticLoggedIn = !!localUser && !!getToken()

  return {
    user: user || null,
    isLoggedIn: optimisticLoggedIn,
    isAdmin: isAdmin(user || localUser),
    isSales: isSales(user || localUser),
    isAdminOrSales: isAdminOrSales(user || localUser),
    loading: loading || isFetching,
    logout: logoutHandler,
  }
}

export { useQC }