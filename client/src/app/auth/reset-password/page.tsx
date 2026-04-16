
'use client'

import { useState, FormEvent, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { resetPassword } from '@/lib/api'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: ''
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const validateForm = () => {
    let isValid = true
    const newErrors = { password: '', confirmPassword: '' }

    if (!password) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      isValid = false
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
      isValid = false
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast.error('Invalid reset link. No token provided.')
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await resetPassword(token, password)
      setResetSuccess(true)
      toast.success('Password reset successfully!')
    } catch (error: any) {
      console.error('Reset password error:', error)
      toast.error(error.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  // Invalid token - no token in URL
  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Invalid Reset Link
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This password reset link is invalid or missing. Please request a new one.
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Request New Reset Link
        </Link>
      </div>
    )
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Password Reset Successful!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Sign In Now
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Password
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Please enter your new password below
        </p>
      </div>

      {/* New Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          New Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors({ ...errors, password: '' })
            }}
            className={`w-full pl-11 pr-10 py-3 border rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter new password (min. 6 characters)"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Confirm New Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
            }}
            className={`w-full pl-11 pr-10 py-3 border rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Confirm your new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Password Requirements */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-xs space-y-1">
        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Password requirements:</p>
        <ul className="space-y-0.5 text-gray-500 dark:text-gray-400">
          <li className={`flex items-center gap-1 ${password.length >= 6 ? 'text-green-500' : ''}`}>
            • Minimum 6 characters
          </li>
          <li className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-500' : ''}`}>
            • At least one uppercase letter (optional but recommended)
          </li>
          <li className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-500' : ''}`}>
            • At least one number (optional but recommended)
          </li>
        </ul>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !password || !confirmPassword}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Resetting Password...
          </>
        ) : (
          'Reset Password'
        )}
      </button>

      {/* Back to Login Link */}
      <div className="text-center pt-2">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </form>
  )
}

// Main component with Suspense for useSearchParams
export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}