"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Settings, Truck,
  Menu, X, Search, Star, ChevronRight, Bell, User, LogOut, 
  BarChart3, AlertCircle, Moon, ClipboardList, Sun, AlertTriangle,
  Receipt, MessageSquare, Mail
} from 'lucide-react'
import { useCompanySettings } from '@/lib/use-company-settings'
import { getFaviconUrl, getLogoUrl } from '@/lib/company'
import { useTheme } from '@/context/ThemeContext'
import { useUnreadCount } from '@/lib/notifications'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAdmin, loading: authLoading } = useAuth()
  const { data: companySettings, isLoading: settingsLoading } = useCompanySettings()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  
  // Get unread notifications count
  const { data: unreadCountData, refetch: refetchUnreadCount } = useUnreadCount()
  const unreadCount = unreadCountData?.data?.unreadCount ?? 0
  
  // Unread count is already auto-refetched by React Query (see useUnreadCount())
  // Keeping this interval here causes double-refreshes and visible UI resets.

  
  // Prevent multiple redirects
  const hasRedirected = useRef(false)

  // Get logo URL from company settings
  const faviconUrl = getFaviconUrl(companySettings)
  const companyName = companySettings?.companyName || 'PlasmaWater'
  const companyTagline = companySettings?.slogan || 'Africa'

  // Determine active page based on current path
  const getActivePageFromPath = (path: string) => {
    if (path === '/dashboard' || path === '/dashboard/') return 'overview'
    if (path.startsWith('/dashboard/products')) return 'products'

    if (path.startsWith('/dashboard/sales')) return 'sales'
    if (path.startsWith('/dashboard/shipping')) return 'shipping'
    if (path.startsWith('/dashboard/users')) return 'users'
 
    if (path.startsWith('/dashboard/reviews')) return 'reviews'
    if (path.startsWith('/dashboard/submissions')) return 'submissions'
    if (path.startsWith('/dashboard/emails')) return 'emails'
    if (path.startsWith('/dashboard/auditlog')) return 'auditlog'
    if (path.startsWith('/dashboard/notifications')) return 'notifications'
    if (path.startsWith('/dashboard/settings')) return 'settings'
    return 'overview'
  }

  const [activePage, setActivePage] = useState<'overview'|'products'|'sales'|'shipping'|'users'|'emails'|'submissions'|'reviews'|'auditlog'|'notifications'|'settings'>(
    getActivePageFromPath(pathname)
  )

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const newActivePage = getActivePageFromPath(pathname)
    setActivePage(newActivePage)
    // Refetch unread count when navigating to notifications page
    if (pathname === '/dashboard/notifications') {
      refetchUnreadCount()
    }
  }, [pathname, refetchUnreadCount])

  // Improved auth redirect - prevents infinite loops
  useEffect(() => {
    if (authLoading) return
    
    // Only redirect once and only if necessary
    if ((!user || !isAdmin) && !hasRedirected.current && pathname !== '/orders') {
      hasRedirected.current = true
      router.push('/orders')
    }
    
    // Reset redirect flag if user becomes authenticated
    if (user && isAdmin) {
      hasRedirected.current = false
    }
  }, [user, isAdmin, authLoading, router, pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    const logoutToastId = toast.success('Successfully signed out! 👋', {
      id: 'logout-success',
      duration: 2500,
      style: {
        background: '#10B981',
        color: '#fff',
        borderRadius: '12px',
        padding: '12px 20px',
        fontWeight: '500',
      },
    })

    setTimeout(() => {
      toast.dismiss(logoutToastId)
      router.push('/auth/login')
    }, 2500)
  }

  const navigation = [
    { name: 'Overview', icon: LayoutDashboard, page: 'overview' as const, path: '/dashboard', color: 'text-blue-500' },
    { name: 'Products', icon: Package, page: 'products' as const, path: '/dashboard/products', color: 'text-emerald-500' },
   
    { name: 'Sales', icon: Receipt, page: 'sales' as const, path: '/dashboard/sales', color: 'text-rose-500' },
    { name: 'Shipping', icon: Truck, page: 'shipping' as const, path: '/dashboard/shipping', color: 'text-indigo-500' },
   
    { name: 'Users', icon: Users, page: 'users' as const, path: '/dashboard/users', color: 'text-orange-500' },
    { name: 'Reviews', icon: MessageSquare, page: 'reviews' as const, path: '/dashboard/reviews', color: 'text-pink-500' },
    { name: 'Submissions', icon: Star, page: 'submissions' as const, path: '/dashboard/submissions', color: 'text-yellow-500' },
    { name: 'Emails', icon: Mail, page: 'emails' as const, path: '/dashboard/emails', color: 'text-indigo-500' },
    { name: 'Audit Log', icon: ClipboardList, page: 'auditlog' as const, path: '/dashboard/auditlog', color: 'text-indigo-500' },
    { name: 'Notifications', icon: Bell, page: 'notifications' as const, path: '/dashboard/notifications', color: 'text-blue-500' },
    { name: 'Settings', icon: Settings, page: 'settings' as const, path: '/dashboard/settings', color: 'text-gray-500' },
  ]

  const handleNavigation = (path: string, page: typeof activePage) => {
    setActivePage(page)
    setSidebarOpen(false)
    router.push(path)
  }

  // Show loading state
  if (authLoading || !isMounted || settingsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">

        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render (redirect will happen)
  if (!user || !isAdmin) {
    return null
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="h-screen flex overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">


        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
              onClick={() => setShowLogoutModal(false)}
            />
            
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 opacity-100 animate-in slide-in-from-bottom-4">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />
              
              <div className="relative bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-2xl p-6" >

                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20 animate-pulse" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <LogOut className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                  Sign Out?
                </h3>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to sign out of your account? You'll need to sign in again to access your dashboard.
                </p>

                <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Any unsaved changes will be lost. Make sure to save your work before signing out.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium shadow-lg shadow-red-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/70 dark:border-gray-800/50 shadow-xl
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 flex flex-col
        `}>
          {/* Logo Section - Using Company Settings */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200/50 dark:border-gray-800/50 shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-gray-800 shadow-lg group-hover:scale-105 transition-transform duration-200 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  {faviconUrl ? (
                    <Image
                      src={faviconUrl}
                      alt={companyName}
                      width={40}
                      height={40}
                      className="w-full h-full object-contain p-1"
                      unoptimized={faviconUrl.includes('/company/favicon/')}
                    />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300 font-bold text-lg">
                      {companyName.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200 cursor-pointer" onClick={() => router.push('/')}>
                  {companyName}
                </span>
                <span className="text-xs text-gray-500 block -mt-1">{companyTagline}</span>
              </div>
            </Link>
            <button 
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>


          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-6">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = activePage === item.page
                // Show badge on notifications icon in sidebar if unread > 0
                const showBadge = item.page === 'notifications' && unreadCount > 0
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path, item.page as any)}
                    className={`
                      group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 w-full
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:bg-gray-800/60'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 transition-all ${isActive ? item.color : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                    <span>{item.name}</span>
                    {showBadge && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-r-full" />
                    )}
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Sign Out Button */}
          <div className="p-4 pt-0 shrink-0 border-t border-gray-200/50 dark:border-gray-800/50">
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 hover:text-red-700 font-medium transition-all group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-b border-gray-200/60 dark:border-gray-700/60 shadow-sm shrink-0">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <button 
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              
              {/* Search Bar */}
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products, orders, customers..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={() => router.push('/profile')}
                  title="Profile"
                  className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
                </button>
                
                {/* Notifications Button with Unread Count Badge */}
                <button 
                  onClick={() => router.push('/dashboard/notifications')}
                  title="Notifications"
                  className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 group"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:scale-105 transition-transform" />
                  
                  {/* Unread Count Badge */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg ring-2 ring-white dark:ring-gray-900 animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  
                  {/* Subtle indicator dot for unread */}
                  {unreadCount === 0 && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  )}
                </button>
                
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
                
                {/* Theme Toggle Button */}
                <button 
                  onClick={toggleTheme}
                  className="group relative p-2 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 dark:hover:from-orange-900/20 dark:hover:to-yellow-900/20 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:ring-offset-2" 
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  <div className="relative w-6 h-6">
                    <Sun className="w-5 h-5 text-orange-500 dark:text-gray-400 absolute inset-0 m-auto group-hover:scale-110 transition-all duration-300 opacity-100 dark:opacity-0" />
                    <Moon className="w-5 h-5 text-gray-600 dark:text-orange-400 absolute inset-0 m-auto group-hover:scale-110 transition-all duration-300 opacity-0 dark:opacity-100" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}