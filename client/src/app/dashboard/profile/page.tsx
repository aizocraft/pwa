'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useProfile } from '@/lib/profile'
import { UserIcon, Edit, Save, X, Camera, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { Check } from 'lucide-react'

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await profile.update.mutateAsync(formData)
      setEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      setAvatarPreview(preview)
      // TODO: upload to server
    }
  }

  if (isLoading || !profile) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <UserIcon className="h-8 w-8 text-pink-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Update your account information</p>
        </div>
      </div>

      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-3xl font-bold text-white shadow-2xl overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-all group">
                <Camera className="w-5 h-5 text-gray-600 group-hover:text-pink-500 transition-colors" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-xl shadow-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  {profile?.role === 'admin' ? 'Administrator' : 'Customer'}
                </span>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-pink-500" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-transparent text-lg font-semibold placeholder-gray-500"
              placeholder="Enter your full name"
              disabled={!editing}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4 text-pink-500" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-transparent text-lg placeholder-gray-500"
              placeholder="your.email@example.com"
              disabled={!editing}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Edit className="h-5 w-5" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setFormData({ name: user?.name || '', email: user?.email || '' })
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold py-3 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <X className="h-5 w-5" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-3xl border border-pink-200/50 dark:border-pink-800/50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Member Since</h3>
          <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Account Status</h3>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Active</p>
        </div>
      </div>
    </div>
  )
}
