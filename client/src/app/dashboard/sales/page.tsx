'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardSalesPage() {
  const router = useRouter();
  
  useEffect(() => {
    // The layout will handle showing the quotations tab by default
    // This page just needs to exist for the route
  }, [router]);
  
  // This page won't actually render because the layout handles everything
  // But we need it for the route to work
  return null;
}