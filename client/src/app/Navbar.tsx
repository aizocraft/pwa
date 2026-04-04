// src/app/Navbar.tsx - Fully responsive with optimized logo sizing
"use client"

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingCart, LogOut, Sun, Moon, Menu, X, Search } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/context/ThemeContext'
import { useCompanySettings } from '@/lib/use-company-settings'
import { getLogoUrl } from '@/lib/company'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { totalItems } = useCartStore()
  const { user, isLoggedIn: queryLoggedIn, loading: authLoading, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { data: companySettings } = useCompanySettings()
  const logoUrl = getLogoUrl(companySettings) || '/logo.png' // Fallback to public/logo.png

  const router = useRouter()

  const toggleProfileMenu = () => {
    setShowProfileMenu(prev => !prev)
  }

  const handleLogout = async () => {
    logout()
    router.push('/auth/login')
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile menu when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
        setShowProfileMenu(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Don't render auth parts until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-16 sm:h-20" />
    )
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Logo - Responsive sizing for all devices */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
                {logoUrl ? (
                  <div className="relative">
                    {/* Responsive logo dimensions */}
                    <div className="h-8 w-24 sm:h-10 sm:w-28 md:h-12 md:w-32 lg:h-14 lg:w-36 xl:h-16 xl:w-40">
                      <Image
                        src={logoUrl}
                        alt="Company Logo"
                        fill
                        className="object-contain"
                        priority
                        sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, (max-width: 1024px) 128px, 160px"
                        unoptimized={logoUrl.includes('/company/logo/')}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    PlasmaWater
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Menu - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Home
              </Link>
              <Link 
                href="/products" 
                className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Products
              </Link>
              <Link 
                href="/categories" 
                className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Categories
              </Link>
              <Link 
                href="/orders" 
                className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Orders
              </Link>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              
              {/* Sign In Button - Desktop only */}
              {!queryLoggedIn && !authLoading && (
                <Link
                  href="/auth/login"
                  className="hidden md:block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 lg:px-5 py-2 rounded-lg text-sm lg:text-base font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Sign In
                </Link>
              )}

              {/* User Profile Menu - Desktop only */}
              {queryLoggedIn && user && (
                <div className="relative hidden md:block">
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center gap-2 p-1.5 lg:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-xs lg:text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                  
                  {showProfileMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowProfileMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 py-2">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>

                        {isAdmin && (
                          <Link 
                            href="/dashboard" 
                            className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center gap-3"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                        )}
                        <Link 
                          href="/orders" 
                          className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center gap-3"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          My Orders
                        </Link>
                        <button 
                          onClick={() => {
                            handleLogout()
                            setShowProfileMenu(false)
                          }} 
                          className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:text-red-400 transition-colors flex items-center gap-3"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Loading skeleton */}
              {authLoading && (
                <div className="hidden md:block w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
              )}

              {/* Search Button */}
              <button
                className="p-2 sm:p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-300"
                aria-label="Search"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Cart Button */}
              <Link 
                href="/cart" 
                className="group relative p-2 sm:p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-300"
                title="Shopping Cart"
                aria-label="Cart"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center shadow-lg animate-pulse group-hover:scale-110 transition-all">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 sm:p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-300"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 sm:p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Slide down animation */}
        <div 
          className={`md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 block px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 block px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 block px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/orders"
              className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 block px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Orders
            </Link>
            
            {/* Mobile Auth Section */}
            {queryLoggedIn && user && (
              <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                {isAdmin && (
                  <Link
                    href="/dashboard"
                    className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center gap-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:text-red-400 transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
            
            {!queryLoggedIn && !authLoading && (
              <Link
                href="/auth/login"
                className="mt-3 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 block px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16 sm:h-20" />
    </>
  )
}