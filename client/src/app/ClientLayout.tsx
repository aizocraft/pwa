// src/app/ClientLayout.tsx
'use client'

import type { ReactNode } from 'react';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import { QueryProvider } from '@/lib/query-provider';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/context/ThemeContext';
import WhatsAppButton from '@/components/WhatsAppButton';
import './globals.css';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isSales = pathname?.startsWith('/sales');
  const isCheckout = pathname?.startsWith('/checkout');
  const isAdmin = pathname?.startsWith('/admin');
  const [mounted, setMounted] = useState(false);
  const hasInitialized = useRef(false);

  // Check if we should show WhatsApp button (hide on dashboard, sales, checkout, and admin)
  const shouldShowWhatsApp = !isDashboard && !isSales && !isCheckout && !isAdmin;

  useEffect(() => {
    setMounted(true);
    
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const initialSync = async () => {
        try {
          const { useCartStore } = await import('@/store/cart');
          const state = useCartStore.getState();
          
          if (!state.isHydrated) {
            await state.loadInitialData();
          }
        } catch (error) {
          console.error('Failed to load cart data:', error);
        }
      };
      initialSync();
    }
  }, []);

  return (
    <QueryProvider>
      <ThemeProvider>
        {!isDashboard && !isSales && <Navbar />}
        <main className="min-h-screen">
          {children}
        </main>
        {!isDashboard && !isSales && <Footer />}
        
        {/* WhatsApp Button */}
        {shouldShowWhatsApp && <WhatsAppButton />}
        
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