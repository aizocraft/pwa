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
  const [redirectCountdown, setRedirectCountdown] = useState(3);

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
        
        // Countdown redirect
        const interval = setInterval(() => {
          setRedirectCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

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
        
        // Redirect after countdown
        setTimeout(() => {
          router.push(redirectPath);
        }, 3000);
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
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-6">
        <div className="w-24 h-24 bg-red-500/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border-2 border-red-500/20 p-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-400" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-300 max-w-sm leading-relaxed">
            {error || 'An error occurred during authentication'}
          </p>
        </div>
        <div className="text-sm text-gray-500 animate-pulse">
          Redirecting to login...
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-6 animate-scaleIn">
        <div className="relative">
          <div className="w-28 h-28 bg-green-500/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border-4 border-green-500/20 shadow-2xl p-6 animate-bounce-slow">
            <CheckCircle className="w-16 h-16 text-green-400 drop-shadow-lg" />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl animate-pulse opacity-75"></div>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-lg">
            Welcome!
          </h1>
          <p className="text-xl text-gray-200 font-semibold">
            You are now signed in successfully
          </p>
          <p className="text-sm text-gray-400">
            Redirecting in <span className="font-mono text-green-400 font-bold text-lg">{redirectCountdown}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl backdrop-blur-sm animate-ping opacity-75"></div>
        <div className="absolute inset-0 border-4 border-purple-500/30 rounded-2xl"></div>
        <Loader2 className="w-12 h-12 text-purple-400 relative z-10 animate-spin" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Completing Authentication
        </h2>
        <p className="text-gray-400">
          Finalizing your Google sign in...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-6">
        <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
        <p className="text-gray-400 text-lg">Loading authentication...</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

<style jsx global>{`
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-bounce-slow { animation: bounce-slow 2s infinite; }
  .animate-scaleIn { animation: scaleIn 0.5s ease-out; }
`}</style>
