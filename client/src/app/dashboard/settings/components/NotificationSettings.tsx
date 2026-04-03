// src/app/dashboard/settings/components/NotificationSettings.tsx
'use client'

import { Bell } from 'lucide-react'

interface NotificationSettingsProps {
  notifications: {
    email: boolean
    push: boolean
    orderUpdates: boolean
    promotions: boolean
  }
  setNotifications: (notifications: any) => void
}

export default function NotificationSettings({ notifications, setNotifications }: NotificationSettingsProps) {
  const notificationItems = [
    { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
    { key: 'push', label: 'Push Notifications', desc: 'Get real-time browser alerts' },
    { key: 'orderUpdates', label: 'Order Updates', desc: 'New orders and status changes' },
    { key: 'promotions', label: 'Promotions & News', desc: 'Product updates and offers' },
  ]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Notifications
        </h2>
        <p className="text-sm text-gray-500 mt-1">Choose what alerts you receive</p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {notificationItems.map((item) => (
          <div key={item.key} className="p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{item.label}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications[item.key as keyof typeof notifications]}
                onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}