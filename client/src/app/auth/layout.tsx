// app/auth/layout.tsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  // Check if current page is callback page
  const isCallbackPage = pathname === '/auth/callback'
  
  // Set active tab based on pathname, but only if not on callback page
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    pathname === '/auth/register' ? 'register' : 'login'
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update active tab when pathname changes, but only for non-callback pages
  useEffect(() => {
    if (!isCallbackPage) {
      setActiveTab(pathname === '/auth/register' ? 'register' : 'login')
    }
  }, [pathname, isCallbackPage])

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab)
    router.push(`/auth/${tab === 'login' ? 'login' : 'register'}`)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md transform transition-all duration-500 animate-fadeInUp">
       

        {/* Tab Navigation - Hide on callback page */}
        {!isCallbackPage && (
          <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl p-1 mb-6 shadow-xl border border-white/20 dark:border-gray-700/50">
            <div className="relative flex">
              <button
                onClick={() => handleTabChange('login')}
                className={`relative flex-1 py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 z-10 ${
                  activeTab === 'login'
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => handleTabChange('register')}
                className={`relative flex-1 py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 z-10 ${
                  activeTab === 'register'
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Sign Up
              </button>
              <div
                className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl transition-all duration-300 ease-out ${
                  activeTab === 'login' ? 'left-1' : 'left-1/2'
                }`}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/40 dark:border-gray-700/50 shadow-2xl transform transition-all duration-500 animate-scaleIn">
          {children}
        </div>

        {/* Footer - Hide on callback page */}
        {!isCallbackPage && (
          <p className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400 animate-fadeIn animation-delay-200">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium transition-colors">
              Privacy Policy
            </Link>.
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  )
}