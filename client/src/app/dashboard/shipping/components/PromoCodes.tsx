// src/app/dashboard/shipping/components/PromoCodes.tsx
"use client"

import { useState } from 'react'
import { 
  Plus, Trash2, Edit2, Save, X, Tag, DollarSign, 
  Calendar, Users, CheckCircle, AlertCircle, Percent
} from 'lucide-react'
import { PromoCode } from '../page'

interface PromoCodesProps {
  promoCodes: PromoCode[]
  onUpdatePromoCodes: (promoCodes: PromoCode[]) => void
}

export default function PromoCodes({ promoCodes, onUpdatePromoCodes }: PromoCodesProps) {
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)
  const [isAddingPromo, setIsAddingPromo] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [newPromo, setNewPromo] = useState<Partial<PromoCode>>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: undefined,
    validFrom: new Date(),
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usageLimit: 1,
    usedCount: 0,
    isActive: true
  })

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const handleAddPromo = () => {
    if (newPromo.code && newPromo.description && newPromo.discountValue && newPromo.minOrderAmount !== undefined) {
      const promo: PromoCode = {
        id: Date.now().toString(),
        code: newPromo.code.toUpperCase(),
        description: newPromo.description,
        discountType: newPromo.discountType as 'percentage' | 'fixed',
        discountValue: newPromo.discountValue,
        minOrderAmount: newPromo.minOrderAmount,
        maxDiscountAmount: newPromo.maxDiscountAmount,
        validFrom: newPromo.validFrom || new Date(),
        validTo: newPromo.validTo || new Date(),
        usageLimit: newPromo.usageLimit || 1,
        usedCount: 0,
        isActive: true
      }
      onUpdatePromoCodes([...promoCodes, promo])
      setIsAddingPromo(false)
      setNewPromo({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscountAmount: undefined,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 1,
        usedCount: 0,
        isActive: true
      })
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }
  }

  const handleUpdatePromo = () => {
    if (editingPromo) {
      onUpdatePromoCodes(promoCodes.map(promo => 
        promo.id === editingPromo.id ? editingPromo : promo
      ))
      setEditingPromo(null)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }
  }

  const handleDeletePromo = (id: string) => {
    if (confirm('Are you sure you want to delete this promo code?')) {
      onUpdatePromoCodes(promoCodes.filter(promo => promo.id !== id))
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }
  }

  const handleTogglePromoStatus = (id: string) => {
    onUpdatePromoCodes(promoCodes.map(promo =>
      promo.id === id ? { ...promo, isActive: !promo.isActive } : promo
    ))
  }

  const isExpired = (validTo: Date) => {
    return new Date() > new Date(validTo)
  }

  const isUsageExceeded = (usedCount: number, usageLimit: number) => {
    return usedCount >= usageLimit
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-20 right-4 z-50 animate-slide-down">
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>Promo code saved successfully!</span>
          </div>
        </div>
      )}

      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Promo Codes
            </h2>
          </div>
          <button
            onClick={() => setIsAddingPromo(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Promo Code
          </button>
        </div>
      </div>

      {/* Add Promo Form */}
      {isAddingPromo && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Add New Promo Code</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Promo Code
              </label>
              <input
                type="text"
                value={newPromo.code}
                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SUMMER2024"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newPromo.description}
                onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                placeholder="Brief description"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Type
              </label>
              <select
                value={newPromo.discountType}
                onChange={(e) => setNewPromo({ ...newPromo, discountType: e.target.value as 'percentage' | 'fixed' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (KES)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {newPromo.discountType === 'percentage' ? '%' : 'KES'}
                </span>
                <input
                  type="number"
                  value={newPromo.discountValue}
                  onChange={(e) => setNewPromo({ ...newPromo, discountValue: Number(e.target.value) })}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Order Amount (KES)
              </label>
              <input
                type="number"
                value={newPromo.minOrderAmount}
                onChange={(e) => setNewPromo({ ...newPromo, minOrderAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maximum Discount (Optional)
              </label>
              <input
                type="number"
                value={newPromo.maxDiscountAmount || ''}
                onChange={(e) => setNewPromo({ ...newPromo, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="No limit"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valid From
              </label>
              <input
                type="date"
                value={formatDate(newPromo.validFrom || new Date())}
                onChange={(e) => setNewPromo({ ...newPromo, validFrom: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valid To
              </label>
              <input
                type="date"
                value={formatDate(newPromo.validTo || new Date())}
                onChange={(e) => setNewPromo({ ...newPromo, validTo: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                value={newPromo.usageLimit}
                onChange={(e) => setNewPromo({ ...newPromo, usageLimit: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddPromo}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add Promo Code
            </button>
            <button
              onClick={() => {
                setIsAddingPromo(false)
                setNewPromo({
                  code: '',
                  description: '',
                  discountType: 'percentage',
                  discountValue: 0,
                  minOrderAmount: 0,
                  maxDiscountAmount: undefined,
                  validFrom: new Date(),
                  validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  usageLimit: 1,
                  usedCount: 0,
                  isActive: true
                })
              }}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Promo Codes List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {promoCodes.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No promo codes configured</p>
            <button
              onClick={() => setIsAddingPromo(true)}
              className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
            >
              Add your first promo code
            </button>
          </div>
        ) : (
          promoCodes.map((promo) => {
            const expired = isExpired(promo.validTo)
            const usageExceeded = isUsageExceeded(promo.usedCount, promo.usageLimit)
            const isInvalid = !promo.isActive || expired || usageExceeded

            return (
              <div key={promo.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                {editingPromo?.id === promo.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Promo Code
                        </label>
                        <input
                          type="text"
                          value={editingPromo.code}
                          onChange={(e) => setEditingPromo({ ...editingPromo, code: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={editingPromo.description}
                          onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Discount Type
                        </label>
                        <select
                          value={editingPromo.discountType}
                          onChange={(e) => setEditingPromo({ ...editingPromo, discountType: e.target.value as 'percentage' | 'fixed' })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (KES)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Discount Value
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {editingPromo.discountType === 'percentage' ? '%' : 'KES'}
                          </span>
                          <input
                            type="number"
                            value={editingPromo.discountValue}
                            onChange={(e) => setEditingPromo({ ...editingPromo, discountValue: Number(e.target.value) })}
                            className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Minimum Order Amount
                        </label>
                        <input
                          type="number"
                          value={editingPromo.minOrderAmount}
                          onChange={(e) => setEditingPromo({ ...editingPromo, minOrderAmount: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Valid To
                        </label>
                        <input
                          type="date"
                          value={formatDate(editingPromo.validTo)}
                          onChange={(e) => setEditingPromo({ ...editingPromo, validTo: new Date(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdatePromo}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingPromo(null)}
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
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-md font-bold text-gray-900 dark:text-white font-mono">
                          {promo.code}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          promo.isActive && !expired && !usageExceeded
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          {promo.isActive ? (expired ? 'Expired' : usageExceeded ? 'Used Up' : 'Active') : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `KES ${promo.discountValue} OFF`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {promo.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <DollarSign className="w-4 h-4" />
                          <span>Min. Order: KES {promo.minOrderAmount.toLocaleString()}</span>
                        </div>
                        {promo.maxDiscountAmount && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Percent className="w-4 h-4" />
                            <span>Max Discount: KES {promo.maxDiscountAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>Valid until: {promo.validTo.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>Used: {promo.usedCount} / {promo.usageLimit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePromoStatus(promo.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          promo.isActive && !expired && !usageExceeded
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200'
                        }`}
                        title={promo.isActive ? 'Deactivate' : 'Activate'}
                        disabled={expired || usageExceeded}
                      >
                        {promo.isActive ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingPromo(promo)}
                        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePromo(promo.id)}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
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