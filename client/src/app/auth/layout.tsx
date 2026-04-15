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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-950">
      {/* Animated Background Elements - Dark theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md sm:max-w-lg transform transition-all duration-500 animate-fadeInUp">
        {/* Tab Navigation - Hide on callback page */}
        {!isCallbackPage && (
          <div className="relative bg-gray-800/60 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-1 mb-6 shadow-2xl border border-gray-700/50">
            <div className="relative flex">
              <button
                onClick={() => handleTabChange('login')}
                className={`relative flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 z-10 ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50 backdrop-blur-sm'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => handleTabChange('register')}
                className={`relative flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 z-10 ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50 backdrop-blur-sm'
                }`}
              >
                Sign Up
              </button>
              <div
                className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg transition-all duration-300 ease-out ${
                  activeTab === 'login' ? 'left-1' : 'left-1/2'
                }`}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-gray-700/50 shadow-2xl">
          {children}
        </div>

        {/* Footer - Hide on callback page */}
        {!isCallbackPage && (
          <p className="text-center mt-8 text-sm text-gray-400">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
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
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
