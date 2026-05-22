// app/auth/login/page.tsx (updated)
'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { loginUser } from "@/lib/api"
import GoogleLoginButton from "@/components/auth/GoogleLoginButton"
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    startTransition(async () => {
      try {
        const { token, user } = await loginUser(formData);
        
        queryClient.invalidateQueries({ queryKey: ["user"] })
        queryClient.refetchQueries({ queryKey: ["user"] })
        
  
        // Determine redirect path based on user role
        let redirectPath = "/orders"
        
        if (user.role === "admin") {
          redirectPath = "/dashboard"
        } else if (user.role === "sales") {
          redirectPath = "/sales"
        } else {
          redirectPath = "/orders"
        }
        
        router.push(redirectPath)
        router.refresh()

      } catch (err: any) {
        // Handle Google account error
        if (err.response?.data?.provider === 'google') {
          toast.error('This account uses Google Sign-In. Please use the Google button below.')
        } else {
          toast.error(err.response?.data?.error || err.message || "Network error. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div className="group">
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <div className={`relative transition-all duration-300 ${focusedField === "email" ? "transform scale-[1.02]" : ""}`}>
          <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
            focusedField === "email" ? "text-blue-500" : "text-gray-400"
          }`} />
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            disabled={loading}
            className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="group">
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Password
        </label>
        <div className={`relative transition-all duration-300 ${focusedField === "password" ? "transform scale-[1.02]" : ""}`}>
          <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
            focusedField === "password" ? "text-blue-500" : "text-gray-400"
          }`} />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            disabled={loading}
            className="w-full pl-12 pr-12 py-3.5 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="••••••••"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110 disabled:opacity-50"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 text-sm cursor-pointer group">
          <input 
            type="checkbox" 
            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 shadow-sm focus:ring-blue-500 focus:ring-2 cursor-pointer transition-all duration-200 group-hover:scale-110" 
            disabled={loading}
          />
          <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Remember me
          </span>
        </label>
        <Link 
          href="/auth/forgot-password" 
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-all duration-200 hover:scale-105 inline-block"
        >
          Forgot Password?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || isPending}
        className="relative w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-500/50 focus:outline-none overflow-hidden group disabled:cursor-not-allowed disabled:transform-none"
      >
        <span className="relative z-10 flex items-center justify-center space-x-2">
          {loading || isPending ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span>Sign In</span>
            </>
          )}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 backdrop-blur-sm">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google Login Button */}
      <GoogleLoginButton disabled={loading || isPending} />

      {/* Sign Up Link */}
      <div className="text-center pt-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link 
            href="/auth/register" 
            className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 hover:underline inline-flex items-center gap-1 group"
          >
            Sign Up
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </span>
      </div>
    </form>
  )
}