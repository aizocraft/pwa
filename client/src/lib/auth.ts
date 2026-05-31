// src/lib/auth.ts
"use client";

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
  if (typeof window === 'undefined') return null
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

// Google Auth helper functions
export function isGoogleUser(user: User | null): boolean {
  return user?.provider === 'google'
}

export function isLocalUser(user: User | null): boolean {
  return user?.provider === 'local'
}

export function getAuthProvider(): 'local' | 'google' | null {
  const user = getUser()
  return user?.provider || null
}

export function logout(queryClient?: ReturnType<typeof useQueryClient>): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  
  if (queryClient) {
    queryClient.invalidateQueries({ queryKey: ['user'] })
    queryClient.removeQueries({ queryKey: ['user'] })
    queryClient.invalidateQueries({ queryKey: ['profile'] })
    queryClient.removeQueries({ queryKey: ['profile'] })
  }
}

import { getProfile } from './api';

async function fetchProfile(): Promise<User | null> {
  const token = getToken()
  if (!token) {
    return null
  }

  try {
    const user = await getProfile();
    // Ensure provider is set (backward compatibility)
    if (user && !user.provider) {
      user.provider = 'local'
    }
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

  // Ensure user object has provider field
  const enhancedUser = user || localUser
  if (enhancedUser && !enhancedUser.provider) {
    enhancedUser.provider = 'local'
  }

  return {
    user: enhancedUser,
    isLoggedIn: optimisticLoggedIn,
    isAdmin: isAdmin(enhancedUser),
    isSales: isSales(enhancedUser),
    isAdminOrSales: isAdminOrSales(enhancedUser),
    isGoogleUser: isGoogleUser(enhancedUser),
    isLocalUser: isLocalUser(enhancedUser),
    authProvider: getAuthProvider(),
    loading: loading || isFetching,
    logout: logoutHandler,
  }
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  }).then(res => res.json());
}

export { useQC }
