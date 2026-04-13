"use client"

import { useState } from 'react'
import { DollarSign, Globe, Save, CheckCircle } from 'lucide-react'

interface ShippingSettingsType {
  freeShippingThreshold: number
  isFreeShippingEnabled: boolean
  baseRate: number
}

interface ShippingSettingsProps {
  settings: ShippingSettingsType
  onUpdateSettings: (settings: ShippingSettingsType) => void
}

export default function ShippingSettings({ settings, onUpdateSettings }: ShippingSettingsProps) {
  const [localSettings, setLocalSettings] = useState<ShippingSettingsType>(settings)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const handleFreeShippingChange = (value: number) => {
    setLocalSettings(prev => ({ ...prev, freeShippingThreshold: value }))
  }

  const handleToggleFreeShipping = () => {
    setLocalSettings(prev => ({ ...prev, isFreeShippingEnabled: !prev.isFreeShippingEnabled }))
  }

  const handleBaseRateChange = (value: number) => {
    setLocalSettings(prev => ({ ...prev, baseRate: value }))
  }

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings)
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  return (
    <div className="space-y-6">
      {showSuccessMessage && (
        <div className="fixed top-20 right-4 z-50 animate-slide-down">
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>Settings saved successfully!</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Free Shipping</h2>
            </div>
            <button
              onClick={handleToggleFreeShipping}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.isFreeShippingEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.isFreeShippingEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {localSettings.isFreeShippingEnabled && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Order Amount (KES)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">KES</span>
                <input
                  type="number"
                  value={localSettings.freeShippingThreshold}
                  onChange={(e) => handleFreeShippingChange(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Orders above KES {localSettings.freeShippingThreshold.toLocaleString()} get free shipping</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Default Shipping Rate</h2>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Base Rate (KES)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">KES</span>
              <input
                type="number"
                value={localSettings.baseRate}
                onChange={(e) => handleBaseRateChange(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">This rate applies to areas not specifically configured</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">How shipping rates are calculated</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              1. If order total exceeds free shipping threshold, shipping is free.<br />
              2. Otherwise, system checks if customer's area has a specific rate.<br />
              3. If no specific rate found, default base rate is applied.<br />
              4. Inactive areas will use the default base rate instead.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSaveSettings} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center gap-2">
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
      `}</style>
    </div>
  )
}