// src/app/dashboard/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, User, Shield, Bell, Palette, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useProfile } from '@/lib/profile'
import { useCompanySettings } from '@/lib/use-company-settings'
import CompanySettings from './components/CompanySettings'
import ProfileSettings from './components/ProfileSettings'
import SecuritySettings from './components/SecuritySettings'
import NotificationSettings from './components/NotificationSettings'
import PreferencesSettings from './components/PreferencesSettings'

const tabs = [
  { id: 'general', icon: Building2, label: 'Company', description: 'Store information and branding' },
  { id: 'profile', icon: User, label: 'Profile', description: 'Your account information' },
  { id: 'security', icon: Shield, label: 'Security', description: 'Password and security settings' },
  { id: 'notifications', icon: Bell, label: 'Notifications', description: 'Alert preferences' },
  { id: 'preferences', icon: Palette, label: 'Preferences', description: 'Appearance and language' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const { user } = useAuth()
  const { profile, update: updateProfile, isLoading: profileLoading } = useProfile()
  const { isLoading: companyLoading } = useCompanySettings() // Just for loading state
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    orderUpdates: true,
    promotions: false
  })
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'en',
    timezone: 'Africa/Nairobi'
  })

  useEffect(() => {
    const savedTab = localStorage.getItem('settings_active_tab')
    if (savedTab && tabs.some(tab => tab.id === savedTab)) {
      setActiveTab(savedTab)
    }
  }, [])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    localStorage.setItem('settings_active_tab', tabId)
  }

  if (profileLoading || companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your store and account preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      group w-full text-left px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-l-4 border-blue-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                      <div>
                        <div className={`font-medium ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {tab.label}
                        </div>
                        <div className="text-xs text-gray-500 hidden lg:block">{tab.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Main Content - No props passed to CompanySettings */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            {activeTab === 'general' && <CompanySettings />}
            {activeTab === 'profile' && (
              <ProfileSettings 
                profile={profile}
                updateProfile={updateProfile}
              />
            )}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'notifications' && (
              <NotificationSettings 
                notifications={notifications}
                setNotifications={setNotifications}
              />
            )}
            {activeTab === 'preferences' && (
              <PreferencesSettings 
                preferences={preferences}
                setPreferences={setPreferences}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}