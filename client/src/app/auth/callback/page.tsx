// app/auth/callback/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    const userData = searchParams.get('user');
    const errorParam = searchParams.get('error');
    const redirect = searchParams.get('redirect');

    const processAuth = async () => {
      if (errorParam) {
        setStatus('error');
        const errorMessage = errorParam === 'google_auth_failed' 
          ? 'Google authentication failed. Please try again.' 
          : errorParam === 'no_token'
          ? 'Authentication token missing'
          : errorParam === 'invalid_user'
          ? 'Invalid user data received'
          : 'Authentication failed. Please try again.';
        
        setError(errorMessage);
        toast.error(errorMessage);
        
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
        return;
      }

      if (!token || !userData) {
        setStatus('error');
        setError('Missing authentication data');
        toast.error('Missing authentication data');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
        return;
      }

      try {
        // Parse user data
        let user;
        try {
          user = JSON.parse(decodeURIComponent(userData));
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError);
          throw new Error('Invalid user data format');
        }

        // Store auth data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setStatus('success');
       
        
        // Determine redirect path
        let redirectPath = redirect || '/';
        if (redirectPath === '/' || !redirectPath) {
          if (user.role === 'admin') {
            redirectPath = '/dashboard';
          } else if (user.role === 'sales') {
            redirectPath = '/sale';
          } else {
            redirectPath = '/orders';
          }
        }
        
        // Small delay to show success state
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      } catch (err) {
        console.error('Callback handling failed:', err);
        setStatus('error');
        setError('Failed to complete sign in. Please try again.');
        toast.error('Failed to complete sign in');
        
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    processAuth();
  }, [searchParams, router]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Authentication Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'An error occurred during authentication'}
          </p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Sign In Successful!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You have been successfully authenticated.
          </p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting you to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Completing Sign In
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Please wait while we authenticate you...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}