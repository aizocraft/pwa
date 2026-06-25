// app/sales/layout.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Users2,
  FileSpreadsheet,
  ShoppingBag,
  Receipt,
  ReceiptText,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Sun,
  Moon,
  Settings,
  HelpCircle,
  TrendingUp,
  Sparkles,
  Crown,
  Zap,
  Calendar,
  Clock,
  UserCircle,
  Home,
  Package
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { useNotifications, useUnreadCount, useMarkAllAsRead } from '@/lib/notifications';
import { Notification } from '@/types/notification';

// Navigation items with icons and descriptions
const navItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    href: '/sales',
    description: 'Overview & metrics'
  },
  { 
    id: 'quotations', 
    label: 'Quotations', 
    icon: FileSpreadsheet, 
    href: '/sales/quotations',
    description: 'Create & manage'
  },
  { 
    id: 'invoices', 
    label: 'Invoices', 
    icon: ReceiptText, 
    href: '/sales/invoices',
    description: 'Track payments'
  },
  { 
    id: 'customers', 
    label: 'Customers', 
    icon: Users2, 
    href: '/sales/customers',
    description: 'Client management'
  },
  { 
    id: 'inventory', 
    label: 'Inventory', 
    icon: Package, 
    href: '/sales/inventory',
    description: 'Stock & products'
  },

  { 
    id: 'transactions', 
    label: 'Transactions', 
    icon: Receipt, 
    href: '/sales/transactions',
    description: 'Payment history'
  },

];

// Quick action items
const quickActions = [
  { label: 'New Quotation', icon: FileSpreadsheet, href: '/sales/quotations/new', color: 'cyan' },
  { label: 'New Customer', icon: Users2, href: '/sales/customers/new', color: 'purple' },
  { label: 'View Reports', icon: TrendingUp, href: '/sales/analytics', color: 'green' },
];

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, isAdminOrSales: hasSalesAccess, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    isError: notificationsError,
  } = useNotifications({ limit: 5, page: 1 });

  const { data: unreadCountData } = useUnreadCount();
  const markAllAsReadMutation = useMarkAllAsRead();

  const notifications = notificationsData?.data?.notifications ?? [];
  const unreadCount = unreadCountData?.data?.unreadCount ?? 0;

  const handleSearch = () => {
    const query = searchTerm.trim();
    if (!query) return;

    let target = pathname;
    if (!target?.startsWith('/sales') || target === '/sales' || target === '/sales/overview') {
      target = '/sales/transactions';
    }

    router.push(`${target}?search=${encodeURIComponent(query)}`);
    setSearchTerm('');
  };

  const markAllNotificationsRead = () => {
    if (markAllAsReadMutation.isPending) return;
    markAllAsReadMutation.mutate();
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle dark mode
  useEffect(() => {
    const isDarkMode = localStorage.getItem('theme') === 'dark';
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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

  const isAdmin = user?.role === 'admin';
  const displayName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const userInitial = user?.name?.charAt(0) || user?.email?.charAt(0) || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo / Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-white shadow-lg flex items-center justify-center">
                <img src="/logo.png" alt="Sales Logo" className="w-full h-full object-contain" />
              </div>
              {isAdmin && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              )}
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white hidden sm:inline">
                Sales Portal
              </span>
                {isAdmin && (
                  <span className="hidden sm:inline ml-2 text-xs px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                    Admin
                  </span>
                )}
              </div>
            </Link>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-0.5 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 relative ${
                      isActive
                        ? 'bg-white dark:bg-gray-900 text-cyan-600 dark:text-cyan-400 shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-900/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-cyan-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Search - Desktop */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 focus-within:border-cyan-500 transition-all">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-transparent border-none outline-none text-sm w-32 lg:w-48 text-gray-700 dark:text-gray-300 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="text-xs text-cyan-600 hover:text-cyan-700"
                >
                  Search
                </button>
                <kbd className="hidden lg:block text-xs text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">⌘K</kbd>
              </div>

              {/* Quick Actions - Desktop */}
              <div className="hidden lg:flex items-center gap-1">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`p-2 rounded-lg hover:bg-${action.color}-50 dark:hover:bg-${action.color}-900/20 transition-colors group`}
                    title={action.label}
                  >
                    <action.icon className={`w-4 h-4 text-${action.color}-500`} />
                  </Link>
                ))}
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-cyan-600 hover:text-cyan-700"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="space-y-2 p-3">
                          {[...Array(3)].map((_, index) => (
                            <div key={index} className="animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800 h-16" />
                          ))}
                        </div>
                      ) : notificationsError ? (
                        <div className="p-4 text-sm text-red-600 dark:text-red-400">Unable to load notifications.</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
                          No recent notifications yet.
                        </div>
                      ) : (
                        notifications.map((notification: Notification) => (
                          <div
                            key={notification._id}
                            className={`p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                              !notification.read ? 'bg-cyan-50 dark:bg-cyan-900/10' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className={`w-2 h-2 rounded-full mt-1.5 ${!notification.read ? 'bg-cyan-500' : 'bg-gray-300'}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{notification.title}</p>
                                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{formatRelativeTime(notification.createdAt)}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{notification.message}</p>
                                {notification.actionUrl && (
                                  <Link
                                    href={notification.actionUrl}
                                    className="mt-2 inline-flex text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
                                    onClick={() => setShowNotifications(false)}
                                  >
                                    View details
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-200 dark:border-gray-800">
                      <Link
                        href="/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="w-full block text-center text-sm text-cyan-600 hover:text-cyan-700 py-1"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4 text-gray-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {userInitial}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'User'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 capitalize">
                        {user.role}
                      </span>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-700 dark:text-gray-300"
                      >
                        <UserCircle className="w-4 h-4" />
                        Profile Settings
                      </Link>
                      <Link
                        href="/help"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-700 dark:text-gray-300"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Help & Support
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm text-red-600 dark:text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              {/* Mobile Search */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl mb-3">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm flex-1 text-gray-700 dark:text-gray-300 placeholder:text-gray-400"
                />
              </div>

              {/* Mobile Navigation */}
              <nav className="grid grid-cols-2 gap-1 mb-3">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <div>
                        <span className="text-sm font-medium block">{item.label}</span>
                        <span className="text-xs text-gray-500">{item.description}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Quick Actions */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-3">
                <p className="text-xs text-gray-500 px-3 mb-2">Quick Actions</p>
                <div className="grid grid-cols-3 gap-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg bg-${action.color}-50 dark:bg-${action.color}-900/20 hover:bg-${action.color}-100 dark:hover:bg-${action.color}-800/30 transition-colors`}
                    >
                      <action.icon className={`w-4 h-4 text-${action.color}-500`} />
                      <span className="text-xs text-gray-700 dark:text-gray-300">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile User Info */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {userInitial}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    <span className="text-xs text-cyan-600 dark:text-cyan-400 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>©Sales Portal</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs">v2.0.0</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</Link>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs">System Online</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}