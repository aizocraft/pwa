// app/dashboard/sales/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  FileSpreadsheet,
  Users2,
  Receipt,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';

// Import the pages as components
import QuotationsPage from '@/app/sales/quotations/page';
import CustomersPage from '@/app/sales/customers/page';
import TransactionsPage from '@/app/sales/transactions/page';
import AnalyticsPage from '@/app/sales/analytics/page';
import OrdersPage from '@/app/sales/orders/page';

// Tab configuration with routes
const tabs = [
  { id: 'quotations', label: 'Quotations', icon: FileSpreadsheet, component: QuotationsPage, route: '/dashboard/sales' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, component: OrdersPage, route: '/dashboard/sales/orders' },
  { id: 'customers', label: 'Customers', icon: Users2, component: CustomersPage, route: '/dashboard/sales/customers' },
  { id: 'transactions', label: 'Transactions', icon: Receipt, component: TransactionsPage, route: '/dashboard/sales/transactions' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, component: AnalyticsPage, route: '/dashboard/sales/analytics' },
];

export default function DashboardSalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, isAdminOrSales: hasSalesAccess, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('quotations');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user has access
  useEffect(() => {
    if (!isLoggedIn || !hasSalesAccess) {
      router.push('/auth/login');
      toast.error('Please login to access sales portal');
    }
  }, [isLoggedIn, hasSalesAccess, router]);

  // Set active tab based on current pathname (persist on refresh)
  useEffect(() => {
    const currentTab = tabs.find(tab => {
      if (tab.route === '/dashboard/sales' && pathname === '/dashboard/sales') return true;
      if (tab.route !== '/dashboard/sales' && pathname?.startsWith(tab.route)) return true;
      return false;
    });
    if (currentTab) {
      setActiveTab(currentTab.id);
    }
  }, [pathname]);

  const handleTabChange = (tabId: string, route: string) => {
    setActiveTab(tabId);
    router.push(route);
    setMobileMenuOpen(false);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
           
            {/* Desktop Tabs - Centered */}
            <nav className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id, tab.route)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-gray-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-900/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              <nav className="flex flex-col gap-1">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id, tab.route)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
                <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'Sales User'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Renders the child page based on route */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}