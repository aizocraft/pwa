// app/sales/page.tsx
'use client';

import { useAuth } from '@/lib/auth';
import SalesOverview from './overview';

export default function SalesPage() {
  const { user, isLoggedIn } = useAuth();

  // Show loading while checking auth
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  // Both admin and sales users see the same dashboard
  return <SalesOverview />;
}