// app/dashboard/sales/layout.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  FileSpreadsheet,
  ReceiptText,
  Users2,
  Receipt,
  BarChart3,
  ShoppingBag,
  Truck,
  TrendingUp,
  Package as PackageIcon,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';

// Import the pages as components
import QuotationsPage from '@/app/sales/quotations/page';
import InvoicesPage from '@/app/sales/invoices/page';
import CustomersPage from '@/app/sales/customers/page';
import TransactionsPage from '@/app/sales/transactions/page';
import AnalyticsPage from '@/app/sales/analytics/page';
import OrdersPage from '@/app/sales/orders/page';
import SuppliersPage from './suppliers/page';
import ProfitsPage from './profits/page';
import InventoryPage from './inventory/page';

// Tab configuration with routes
const tabs = [
  { id: 'quotations', label: 'Quotations', icon: FileSpreadsheet, component: QuotationsPage, route: '/dashboard/sales' },
  { id: 'invoices', label: 'Invoices', icon: ReceiptText, component: InvoicesPage, route: '/dashboard/sales/invoices' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, component: OrdersPage, route: '/dashboard/sales/orders' },
  { id: 'customers', label: 'Customers', icon: Users2, component: CustomersPage, route: '/dashboard/sales/customers' },
  { id: 'suppliers', label: 'Suppliers', icon: Truck, component: SuppliersPage, route: '/dashboard/sales/suppliers' },
  { id: 'inventory', label: 'Inventory', icon: PackageIcon, component: InventoryPage, route: '/dashboard/sales/inventory' },
  { id: 'profits', label: 'Profits', icon: TrendingUp, component: ProfitsPage, route: '/dashboard/sales/profits' },
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
  const { user, isLoggedIn, isAdminOrSales: hasSalesAccess } = useAuth();
  const [activeTab, setActiveTab] = useState('quotations');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Check if user has access
  useEffect(() => {
    if (!isLoggedIn || !hasSalesAccess) {
      router.push('/auth/login');
      toast.error('Please login to access sales portal');
    }
  }, [isLoggedIn, hasSalesAccess, router]);

  // Prefetch routes so tab switches feel instant.
  useEffect(() => {
    tabs.forEach((tab) => router.prefetch(tab.route));
  }, [router]);

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
    setIsNavigating(false);
  }, [pathname]);

  const handleTabChange = (tabId: string, route: string) => {
    if (activeTab === tabId) return;

    setActiveTab(tabId);
    setIsNavigating(true);
    startTransition(() => {
      router.push(route);
    });
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
      {/* Top Navigation Bar - Tabs only */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="px-4 sm:px-6">
          {/* Scrollable tabs container for mobile */}
          <div className="overflow-x-auto scrollbar-hide">
            <nav className="flex items-center gap-1 py-2 min-w-max">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id, tab.route)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {isNavigating || isPending ? (
          <div className="space-y-4 animate-pulse" aria-live="polite">
            <div className="h-8 w-56 rounded-xl bg-gray-200/80 dark:bg-gray-800/80" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-36 rounded-2xl border border-gray-200/70 bg-white/80 dark:border-gray-800 dark:bg-gray-900/70" />
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-[fadeIn_220ms_ease-out]">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}