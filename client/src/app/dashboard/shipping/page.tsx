// src/app/dashboard/shipping/page.tsx
"use client"

import { useState } from 'react'
import { Truck, Tag } from 'lucide-react'
import ShippingSettings from './components/ShippingSettings'
import ShippingAreas from './components/ShippingAreas'
import PromoCodes from './components/PromoCodes'

export interface ShippingArea {
  id: string
  name: string
  fee: number
  estimatedDays: string
  isActive: boolean
}

export interface PromoCode {
  id: string
  code: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount: number
  maxDiscountAmount?: number
  validFrom: Date
  validTo: Date
  usageLimit: number
  usedCount: number
  isActive: boolean
}

export interface ShippingSettingsType {
  freeShippingThreshold: number
  isFreeShippingEnabled: boolean
  baseRate: number
}

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'areas' | 'promos'>('settings')
  const [settings, setSettings] = useState<ShippingSettingsType>({
    freeShippingThreshold: 5000,
    isFreeShippingEnabled: true,
    baseRate: 99
  })
  const [areas, setAreas] = useState<ShippingArea[]>([
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
  ])

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    {
      id: '1',
      code: 'WELCOME20',
      description: 'Welcome discount for new customers',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 1000,
      maxDiscountAmount: 2000,
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2024-12-31'),
      usageLimit: 100,
      usedCount: 45,
      isActive: true
    },
    {
      id: '2',
      code: 'FREESHIP',
      description: 'Free shipping on all orders',
      discountType: 'fixed',
      discountValue: 0,
      minOrderAmount: 3000,
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2024-06-30'),
      usageLimit: 50,
      usedCount: 23,
      isActive: true
    },
    {
      id: '3',
      code: 'SAVE500',
      description: 'Save KES 500 on orders above KES 2500',
      discountType: 'fixed',
      discountValue: 500,
      minOrderAmount: 2500,
      validFrom: new Date('2024-02-01'),
      validTo: new Date('2024-05-31'),
      usageLimit: 200,
      usedCount: 78,
      isActive: true
    }
  ])

  const updateSettings = (newSettings: ShippingSettingsType) => {
    setSettings(newSettings)
  }

  const updateAreas = (newAreas: ShippingArea[]) => {
    setAreas(newAreas)
  }

  const updatePromoCodes = (newPromoCodes: PromoCode[]) => {
    setPromoCodes(newPromoCodes)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Truck className="w-8 h-8 text-blue-600" />
            Shipping & Promotions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage shipping settings, delivery areas, and promotional codes
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'settings'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Shipping Settings
              {activeTab === 'settings' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('areas')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'areas'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Shipping Areas
              {activeTab === 'areas' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('promos')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === 'promos'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Tag className="w-4 h-4" />
              Promo Codes
              {activeTab === 'promos' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          </nav>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'settings' && (
            <ShippingSettings settings={settings} onUpdateSettings={updateSettings} />
          )}
          {activeTab === 'areas' && (
            <ShippingAreas areas={areas} onUpdateAreas={updateAreas} />
          )}
          {activeTab === 'promos' && (
            <PromoCodes promoCodes={promoCodes} onUpdatePromoCodes={updatePromoCodes} />
          )}
        </div>
      </div>
    </div>
  )
}