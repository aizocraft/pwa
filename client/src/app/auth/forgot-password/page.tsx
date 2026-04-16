"use client"

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { forgotPassword } from '@/lib/api'  // Changed from '@/lib/auth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const result = await forgotPassword(email)
      // The api.ts version already shows toast, but we'll handle it gracefully
      if (result?.message) {
        toast.success(result.message)
      }
      setSent(true)
    } catch (error: any) {
      // Error toast is already shown in api.ts, but we'll catch to prevent double toast
      console.error('Forgot password error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Check your email
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We've sent a password reset link to <strong className="text-blue-600 dark:text-blue-400">{email}</strong>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          If you don't see it, check your spam folder.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </div>
  )
}