// src/app/dashboard/settings/components/ProfileSettings.tsx
'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, Edit3, Save, X, Loader2, CheckCircle } from 'lucide-react'
import { settingsErrorToast, settingsSuccessToast } from '@/lib/settingsToast'



interface ProfileSettingsProps {
  profile: any
  updateProfile: any
}

export default function ProfileSettings({ profile, updateProfile }: ProfileSettingsProps) {
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (profile) {
      setProfileForm({ 
        name: profile.name || '', 
        email: profile.email || '',
        phone: profile.phone || ''
      })
    }
  }, [profile])

  const handleProfileSubmit = async (e: React.FormEvent) => {

    e.preventDefault()
    
    if (!profileForm.name?.trim()) {
      settingsErrorToast('Name is required')

      return
    }
    
    if (!profileForm.email?.trim()) {
      settingsErrorToast('Email is required')

      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profileForm.email)) {
      settingsErrorToast('Please enter a valid email')

      return
    }
    
    setLoading(true)
    setSaveSuccess(false)
    try {
      await updateProfile.mutateAsync(profileForm)
      settingsSuccessToast('Profile updated successfully!', 3000)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      setEditingProfile(false)

    } catch (error: any) {
      settingsErrorToast(error?.message || 'Failed to update profile', 3000)

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Profile Information
            </h2>
            <p className="text-sm text-gray-500 mt-1">Update your account details</p>
          </div>
          {!editingProfile ? (
            <button
              onClick={() => setEditingProfile(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleProfileSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span className="hidden sm:inline">Save</span>
              </button>
              <button
                onClick={() => setEditingProfile(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            </div>
          )}
        </div>
        {saveSuccess && !editingProfile && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            Profile updated successfully
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              disabled={!editingProfile}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              disabled={!editingProfile}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              disabled={!editingProfile}
              placeholder="+254 700 000 000"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Optional. Used for order notifications</p>
        </div>
      </div>
    </div>
  )
}