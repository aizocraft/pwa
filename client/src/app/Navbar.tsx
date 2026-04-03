// src/app/Navbar.tsx - Updated version with favicon from company settings
"use client"

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingCart, LogOut, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/context/ThemeContext'
import { useCompanySettings } from '@/lib/use-company-settings'
import { getLogoUrl } from '@/lib/company'  // Change from getFaviconUrl to getLogoUrl

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { totalItems } = useCartStore()
  const { user, isLoggedIn: queryLoggedIn, loading: authLoading, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { data: companySettings } = useCompanySettings()
  const logoUrl = getLogoUrl(companySettings)  // Change from faviconUrl to logoUrl

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Don't render auth parts until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-20" />
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
        {/* Logo - Using Logo from Company Settings */}
{/* Logo - Using Logo from Company Settings */}
<div className="flex-shrink-0">
  <Link href="/" className="flex items-center">
    {logoUrl ? (
      <div className="relative h-40 w-80">
        <Image
          src={logoUrl}
          alt="Company Logo"
          fill
          className="object-contain hover:scale-105 transition-transform duration-200"
          priority
          unoptimized={logoUrl.includes('/company/logo/')}
        />
      </div>
    ) : (
      <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        PlasmaWater
      </span>
    )}
  </Link>
</div>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
              Products
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
              Categories
            </Link>
            
            <Link href="/orders" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
              Orders
            </Link>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-3">
            {!queryLoggedIn && !authLoading && (
              <Link
                href="/auth/login"
                className="hidden md:block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
              >
                Sign In
              </Link>
            )}
            {queryLoggedIn && user && (
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name}
                  </span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 py-2">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <Link href="/dashboard" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center gap-3">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    )}
                    <Link href="/orders" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center gap-3">
                      <ShoppingCart className="w-4 h-4" />
                      Orders
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:text-red-400 transition-colors flex items-center gap-3">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
            {authLoading && (
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}

            {/* Search Button */}
            <button
              className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-300"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <Link 
              href="/cart" 
              className="group relative p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-300"
              title="Shopping Cart"
              aria-label="Cart"
            >
              <svg className="w-5 h-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse group-hover:scale-110 transition-all">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Dark Mode Toggle - Using Theme Context */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-300"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200"
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 pt-2 pb-4 space-y-1">
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
              href="/about"
              className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 block px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 block px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            {queryLoggedIn && user && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 pb-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center gap-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center gap-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Orders
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:text-red-400 transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
            {!queryLoggedIn && !authLoading && (
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 block px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}