// src/app/dashboard/settings/components/PreferencesSettings.tsx
'use client'

import { Palette, Sun, Moon, Globe, Clock } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

interface PreferencesSettingsProps {
  preferences: {
    theme: string
    language: string
    timezone: string
  }
  setPreferences: (preferences: any) => void
}

export default function PreferencesSettings({ preferences, setPreferences }: PreferencesSettingsProps) {
  const { theme, toggleTheme, setTheme } = useTheme()

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    setPreferences({ ...preferences, theme: newTheme })
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-600" />
          Preferences
        </h2>
        <p className="text-sm text-gray-500 mt-1">Customize your experience</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className={`text-sm ${theme === 'light' ? 'text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                Light
              </span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                Dark
              </span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Current theme: <span className="font-medium capitalize">{theme}</span>
          </p>
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            Language
          </label>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="sw">Kiswahili</option>
          </select>
        </div>

        {/* Timezone Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            Timezone
          </label>
          <select
            value={preferences.timezone}
            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          >
            <option value="Africa/Nairobi">Africa/Nairobi (EAT) - UTC+3</option>
            <option value="Africa/Lagos">Africa/Lagos (WAT) - UTC+1</option>
            <option value="Africa/Johannesburg">Africa/Johannesburg (SAST) - UTC+2</option>
            <option value="Africa/Cairo">Africa/Cairo (EET) - UTC+2</option>
            <option value="Africa/Casablanca">Africa/Casablanca (WET) - UTC+0</option>
            <option value="UTC">UTC (Coordinated Universal Time)</option>
          </select>
        </div>

        {/* Preview Section */}
        <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview</p>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div>
              <div className={`h-2 w-20 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              <div className={`h-2 w-14 rounded mt-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-400'}`}></div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Theme changes apply instantly across the entire application.
          </p>
        </div>
      </div>
    </div>
  )
}