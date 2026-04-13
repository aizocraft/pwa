// app/auth/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from 'next/navigation';
import { handleGoogleCallback } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const userData = searchParams.get('user');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(errorParam === 'google_auth_failed' 
        ? 'Google authentication failed. Please try again.' 
        : 'Authentication failed');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      return;
    }

    if (token && userData) {
      handleGoogleCallback(token, userData)
        .then(({ user }) => {
          // Determine redirect path based on user role
          let redirectPath = '/orders';
          if (user.role === 'admin') {
            redirectPath = '/dashboard';
          } else if (user.role === 'sales') {
            redirectPath = '/sale';
          }
          router.push(redirectPath);
        })
        .catch((err) => {
          console.error('Callback handling failed:', err);
          setError('Failed to complete sign in');
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
        });
    } else if (searchParams.size > 0) {
      setError('Invalid callback parameters');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ {error}</div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Completing sign in...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}