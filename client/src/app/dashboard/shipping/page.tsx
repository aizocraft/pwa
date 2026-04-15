// src/app/dashboard/shipping/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { Truck, Tag } from 'lucide-react'
import ShippingSettings from './components/ShippingSettings'
import ShippingAreas from './components/ShippingAreas'
import PromoCodes from './components/PromoCodes'
import { ShippingArea, PromoCode } from '@/types/order'
import { getShippingAreas, getPromoCodes } from '@/lib/api'

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState<'areas' | 'promos'>('areas')
  const [shippingAreas, setShippingAreas] = useState<ShippingArea[]>([])
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [areasResult, promosResult] = await Promise.all([
          getShippingAreas(),
          getPromoCodes()
        ])
        setShippingAreas(areasResult.areas || [])
        setPromoCodes(promosResult.promos || [])


      } catch (error) {
        console.error('Failed to load shipping data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const updateAreas = (newAreas: ShippingArea[]) => {
    setShippingAreas(newAreas)
  }

  const updatePromoCodes = (newPromoCodes: PromoCode[]) => {
    setPromoCodes(newPromoCodes)
  }


  if (loading) {
    return <div>Loading...</div>
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
            {/* Settings tab hidden for now as no backend endpoint */}
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
          {/* ShippingSettings temporarily disabled */}
          {activeTab === 'areas' && (
            <ShippingAreas areas={shippingAreas} onUpdateAreas={updateAreas} />
          )}
{activeTab === 'promos' && (
            <PromoCodes promoCodes={promoCodes || []} onUpdatePromoCodes={updatePromoCodes} />
          )}

        </div>
      </div>
    </div>
  )
}