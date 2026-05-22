// app/sales/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Users2,
  FileSpreadsheet,
  ShoppingBag,
  Receipt,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';

// Navigation items for sales users (sidebar)
const salesNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/sales' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/sales/analytics' },
  { id: 'customers', label: 'Customers', icon: Users2, href: '/sales/customers' },
  { id: 'quotations', label: 'Quotations', icon: FileSpreadsheet, href: '/sales/quotations' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, href: '/sales/orders' },
  { id: 'transactions', label: 'Transactions', icon: Receipt, href: '/sales/transactions' },
];

// Navigation items for admin users - Dashboard removed
const adminNavItems = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/sales/analytics' },
  { id: 'customers', label: 'Customers', icon: Users2, href: '/sales/customers' },
  { id: 'quotations', label: 'Quotations', icon: FileSpreadsheet, href: '/sales/quotations' },
];

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, isAdminOrSales: hasSalesAccess, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  const isSales = user?.role === 'sales';

  // Check if user has access
  useEffect(() => {
    if (!isLoggedIn || !hasSalesAccess) {
      router.push('/auth/login');
      toast.error('Please login to access sales portal');
    }
  }, [isLoggedIn, hasSalesAccess, router]);

  // Handle mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    toast.success('Logged out successfully');
  };

  if (!user || !hasSalesAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  // Admin view - Clean layout with only navigation tabs, no user details/logout
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        {/* Admin Top Navigation Bar - Simplified, no user info or logout */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="px-6 py-3">
            <div className="flex items-center justify-center">
              {/* Admin Navigation Tabs - Centered, Dashboard removed */}
              <nav className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-white dark:bg-gray-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-900/50'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </header>

        {/* Admin Main Content - No sidebar margin */}
        <main className="p-6">
          {children}
        </main>
      </div>
    );
  }

  // Sales view - With Sidebar Navigation (keeps user details and logout)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${isMobile && sidebarOpen ? 'shadow-xl' : ''}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">SalesPortal</span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {salesNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Profile - Only for sales users */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name || 'Sales User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                  <span className="text-xs text-cyan-600 dark:text-cyan-400 capitalize mt-0.5 inline-block">
                    {user.role}
                  </span>
                </div>
              )}
              {sidebarOpen && (
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
            {!sidebarOpen && (
              <button
                onClick={handleLogout}
                className="mt-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full flex justify-center"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Mobile header */}
        {isMobile && (
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sales Portal
            </h1>
          </div>
        )}

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}