// src/app/dashboard/settings/components/SecuritySettings.tsx
'use client'

import { useState } from 'react'
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import { settingsErrorToast, settingsSuccessToast } from '@/lib/settingsToast'

export default function SecuritySettings() {
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.new !== passwordForm.confirm) {
      settingsErrorToast('New passwords do not match')
      return
    }
    if (passwordForm.new.length < 6) {
      settingsErrorToast('Password must be at least 6 characters')
      return
    }

    
    setLoading(true)
    try {
      // TODO: Implement password change API
      await new Promise(resolve => setTimeout(resolve, 1000))
settingsSuccessToast('Password changed successfully!', 3000)
      setPasswordForm({ current: '', new: '', confirm: '' })
    } catch (error: any) {
      settingsErrorToast(error?.message || 'Failed to change password')
    } finally {

      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Security
        </h2>
        <p className="text-sm text-gray-500 mt-1">Manage your password and security settings</p>
      </div>

      <div className="p-6 space-y-8">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Change Password</h3>
          
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}