// app/sales/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import SalesOverview from './overview';

export default function SalesPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in and is admin, redirect to analytics
    if (isLoggedIn && user?.role === 'admin') {
      router.replace('/sales/analytics');
    }
  }, [isLoggedIn, user, router]);

  // Show loading while checking role
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  // For admin users, the useEffect will redirect, so show loading
  if (user?.role === 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  // For sales users, show the overview dashboard
  return <SalesOverview />;
}