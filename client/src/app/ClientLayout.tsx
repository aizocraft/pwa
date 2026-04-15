// src/app/ClientLayout.tsx
'use client'

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import { QueryProvider } from '@/lib/query-provider';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/context/ThemeContext'; 
import './globals.css';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const [mounted, setMounted] = useState(false);

  // 🔧 NEW: Rehydrate cart on EVERY route change + mount
  useEffect(() => {
    const rehydrateCart = async () => {
      try {
        const { useCartStore } = await import('@/store/cart');
        await useCartStore.getState().rehydrateCart();
        console.log('🔄 Cart rehydrated on route:', pathname);
      } catch (error) {
        console.error('Cart rehydration failed:', error);
      }
    };

    if (mounted) {
      rehydrateCart();
    }
  }, [pathname, mounted]);

  // 🔧 NEW: Initial mount + hydration safety
  useEffect(() => {
    setMounted(true);
    // Initial sync
    const initialSync = async () => {
      try {
        const { useCartStore } = await import('@/store/cart');
        await useCartStore.getState().rehydrateCart();
        console.log('🚀 Initial cart hydration complete');
      } catch (error) {
        console.error('Initial cart sync failed:', error);
      }
    };
    initialSync();
  }, []);

  return (
    <QueryProvider>
      <ThemeProvider>
        {!isDashboard && <Navbar />}
        <main className="min-h-screen">
          {children}
        </main>
        {!isDashboard && <Footer />}
        <Toaster 
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgb(0 0 0 / 0.9)',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
            },
            success: {
              style: {
                background: 'rgb(16 185 129 / 0.9)',
              },
              iconTheme: {
                primary: '#fff',
                secondary: 'rgb(16 185 129)',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: 'rgb(239 68 68 / 0.9)',
              },
              iconTheme: {
                primary: '#fff',
                secondary: 'rgb(239 68 68)',
              },
            },
          }}
        />
      </ThemeProvider>
    </QueryProvider>
  );
}

