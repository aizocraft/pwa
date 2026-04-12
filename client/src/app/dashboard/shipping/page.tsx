// src/app/dashboard/shipping/page.tsx
"use client"

import { useState } from 'react'
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  MapPin, 
  Truck, 
  DollarSign,
  Globe,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ShippingArea {
  id: string
  name: string
  fee: number
  estimatedDays: string
  isActive: boolean
}

interface ShippingSettings {
  freeShippingThreshold: number
  isFreeShippingEnabled: boolean
  baseRate: number
  areas: ShippingArea[]
}

export default function ShippingPage() {
  const [settings, setSettings] = useState<ShippingSettings>({
    freeShippingThreshold: 5000,
    isFreeShippingEnabled: true,
    baseRate: 99,
    areas: [
      {
        id: '1',
        name: 'Nairobi CBD',
        fee: 150,
        estimatedDays: '1-2 business days',
        isActive: true
      },
      {
        id: '2',
        name: 'Nairobi Suburbs',
        fee: 250,
        estimatedDays: '1-3 business days',
        isActive: true
      },
      {
        id: '3',
        name: 'Major Cities (Mombasa, Kisumu, Nakuru)',
        fee: 450,
        estimatedDays: '2-4 business days',
        isActive: true
      },
      {
        id: '4',
        name: 'Other Towns',
        fee: 600,
        estimatedDays: '3-5 business days',
        isActive: true
      },
      {
        id: '5',
        name: 'Remote Areas',
        fee: 1000,
        estimatedDays: '5-7 business days',
        isActive: false
      }
    ]
  })

  const [editingArea, setEditingArea] = useState<ShippingArea | null>(null)
  const [isAddingArea, setIsAddingArea] = useState(false)
  const [newArea, setNewArea] = useState<Partial<ShippingArea>>({
    name: '',
    fee: 0,
    estimatedDays: '',
    isActive: true
  })
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const handleFreeShippingChange = (value: number) => {
    setSettings(prev => ({ ...prev, freeShippingThreshold: value }))
  }

  const handleToggleFreeShipping = () => {
    setSettings(prev => ({ ...prev, isFreeShippingEnabled: !prev.isFreeShippingEnabled }))
  }

  const handleBaseRateChange = (value: number) => {
    setSettings(prev => ({ ...prev, baseRate: value }))
  }

  const handleSaveSettings = () => {
    // Here you would typically save to backend
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  const handleAddArea = () => {
    if (newArea.name && newArea.fee && newArea.estimatedDays) {
      const area: ShippingArea = {
        id: Date.now().toString(),
        name: newArea.name,
        fee: newArea.fee,
        estimatedDays: newArea.estimatedDays,
        isActive: newArea.isActive || true
      }
      setSettings(prev => ({
        ...prev,
        areas: [...prev.areas, area]
      }))
      setIsAddingArea(false)
      setNewArea({ name: '', fee: 0, estimatedDays: '', isActive: true })
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }
  }

  const handleUpdateArea = () => {
    if (editingArea) {
      setSettings(prev => ({
        ...prev,
        areas: prev.areas.map(area => 
          area.id === editingArea.id ? editingArea : area
        )
      }))
      setEditingArea(null)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }
  }

  const handleDeleteArea = (id: string) => {
    if (confirm('Are you sure you want to delete this shipping area?')) {
      setSettings(prev => ({
        ...prev,
        areas: prev.areas.filter(area => area.id !== id)
      }))
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }
  }

  const handleToggleAreaStatus = (id: string) => {
    setSettings(prev => ({
      ...prev,
      areas: prev.areas.map(area =>
        area.id === id ? { ...area, isActive: !area.isActive } : area
      )
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Truck className="w-8 h-8 text-blue-600" />
            Shipping Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure shipping rates, free shipping thresholds, and manage delivery areas
          </p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-20 right-4 z-50 animate-slide-down">
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Settings saved successfully!</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Shipping Rules */}
          <div className="lg:col-span-1 space-y-6">
            {/* Free Shipping Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Free Shipping
                  </h2>
                </div>
                <button
                  onClick={handleToggleFreeShipping}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.isFreeShippingEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.isFreeShippingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {settings.isFreeShippingEnabled && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Minimum Order Amount (KES)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">KES</span>
                    <input
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={(e) => handleFreeShippingChange(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Orders above KES {settings.freeShippingThreshold.toLocaleString()} get free shipping
                  </p>
                </div>
              )}
            </div>

            {/* Base Rate Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Default Shipping Rate
                </h2>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Base Rate (KES)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">KES</span>
                  <input
                    type="number"
                    value={settings.baseRate}
                    onChange={(e) => handleBaseRateChange(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This rate applies to areas not specifically configured
                </p>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save All Settings
            </button>
          </div>

          {/* Right Column - Shipping Areas */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Shipping Areas & Rates
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsAddingArea(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Area
                  </button>
                </div>
              </div>

              {/* Add Area Form */}
              {isAddingArea && (
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Add New Shipping Area</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Area Name
                      </label>
                      <input
                        type="text"
                        value={newArea.name}
                        onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                        placeholder="e.g., Nairobi West"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Shipping Fee (KES)
                      </label>
                      <input
                        type="number"
                        value={newArea.fee}
                        onChange={(e) => setNewArea({ ...newArea, fee: Number(e.target.value) })}
                        placeholder="e.g., 200"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Estimated Delivery
                      </label>
                      <input
                        type="text"
                        value={newArea.estimatedDays}
                        onChange={(e) => setNewArea({ ...newArea, estimatedDays: e.target.value })}
                        placeholder="e.g., 2-3 business days"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newArea.isActive}
                          onChange={(e) => setNewArea({ ...newArea, isActive: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleAddArea}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Add Area
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingArea(false)
                        setNewArea({ name: '', fee: 0, estimatedDays: '', isActive: true })
                      }}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Areas List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {settings.areas.length === 0 ? (
                  <div className="p-12 text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No shipping areas configured</p>
                    <button
                      onClick={() => setIsAddingArea(true)}
                      className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add your first shipping area
                    </button>
                  </div>
                ) : (
                  settings.areas.map((area) => (
                    <div key={area.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      {editingArea?.id === area.id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Area Name
                              </label>
                              <input
                                type="text"
                                value={editingArea.name}
                                onChange={(e) => setEditingArea({ ...editingArea, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Shipping Fee (KES)
                              </label>
                              <input
                                type="number"
                                value={editingArea.fee}
                                onChange={(e) => setEditingArea({ ...editingArea, fee: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Estimated Delivery
                              </label>
                              <input
                                type="text"
                                value={editingArea.estimatedDays}
                                onChange={(e) => setEditingArea({ ...editingArea, estimatedDays: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handleUpdateArea}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              Save Changes
                            </button>
                            <button
                              onClick={() => setEditingArea(null)}
                              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                                {area.name}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                area.isActive 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                              }`}>
                                {area.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  KES {area.fee.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Truck className="w-4 h-4" />
                                <span>{area.estimatedDays}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleAreaStatus(area.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                area.isActive
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200'
                                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200'
                              }`}
                              title={area.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {area.isActive ? (
                                <AlertCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setEditingArea(area)}
                              className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteArea(area.id)}
                              className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    How shipping rates are calculated
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    1. If order total exceeds free shipping threshold, shipping is free.<br />
                    2. Otherwise, system checks if customer's area has a specific rate.<br />
                    3. If no specific rate found, default base rate is applied.<br />
                    4. Inactive areas will use the default base rate instead.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}