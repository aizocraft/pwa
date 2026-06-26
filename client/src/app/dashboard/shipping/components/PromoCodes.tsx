"use client"

import { useState } from 'react'
import { 
  Plus, Trash2, Edit2, Save, X, Tag, DollarSign, Percent, 
  CheckCircle, AlertCircle, Calendar 
} from 'lucide-react'
import { PromoCode } from '@/types/order'
import { 
  getPromoCodes, 
  createPromoCode, 
  updatePromoCode, 
  deletePromoCode 
} from '@/lib/api'
import toast from 'react-hot-toast'

interface PromoCodesProps {
  promoCodes: PromoCode[]
  onUpdatePromoCodes: (promoCodes: PromoCode[]) => void
}

export default function PromoCodes({ promoCodes, onUpdatePromoCodes }: PromoCodesProps) {
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)
  const [isAddingPromo, setIsAddingPromo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newPromoData, setNewPromoData] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: 0,
    maxUses: 100,
    minSubtotal: 0,
    expiryDate: ''
  })

  const reloadPromoCodes = async () => {
    try {
      const response = await getPromoCodes()
      onUpdatePromoCodes(response.promos)
      return response.promos
    } catch (error) {
      toast.error('Failed to reload promo codes')
      return promoCodes
    }
  }

  const handleAddPromo = async () => {
    if (!newPromoData.code.trim() || newPromoData.value <= 0) {
      toast.error('Code and value are required')
      return
    }

    setLoading(true)
    try {
      await createPromoCode({
        code: newPromoData.code.toUpperCase().trim(),
        type: newPromoData.type,
        value: newPromoData.value,
        maxUses: newPromoData.maxUses,
        minSubtotal: newPromoData.minSubtotal,
        expiryDate: newPromoData.expiryDate || undefined
      })
      await reloadPromoCodes()
      setIsAddingPromo(false)
      setNewPromoData({ code: '', type: 'percent', value: 0, maxUses: 100, minSubtotal: 0, expiryDate: '' })
    
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create promo')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePromo = async () => {
    if (!editingPromo) return

    setLoading(true)
    try {
      await updatePromoCode(editingPromo._id, {
        code: editingPromo.code,
        type: editingPromo.type as 'percent' | 'fixed',
        value: editingPromo.value,
        maxUses: editingPromo.maxUses,
        minSubtotal: editingPromo.minSubtotal,
        expiryDate: editingPromo.expiryDate,
        isActive: editingPromo.isActive
      })
      await reloadPromoCodes()
      setEditingPromo(null)

    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update promo')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Delete this promo code?')) return

    setLoading(true)
    try {
      await deletePromoCode(id)
      await reloadPromoCodes()
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (promo: PromoCode) => {
    setEditingPromo(promo)
  }

  const formatDate = (dateString: string) => dateString.split('T')[0]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Promo Codes 
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
              ({promoCodes?.length || 0})
            </span>
          </h2>
          <button
            onClick={() => setIsAddingPromo(true)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Code
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAddingPromo || editingPromo) && (
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
            {editingPromo ? 'Edit' : 'New'} Promo Code
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Code *
              </label>
              <input
                type="text"
                value={editingPromo?.code || newPromoData.code}
                onChange={(e) => editingPromo ? setEditingPromo({
                  ...editingPromo,
                  code: e.target.value.toUpperCase()
                }) : setNewPromoData({
                  ...newPromoData,
                  code: e.target.value.toUpperCase()
                })}
                placeholder="e.g., SUMMER20"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200"
                disabled={loading}
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Type
              </label>
              <select
                value={editingPromo?.type || newPromoData.type}
                onChange={(e) => {
                  const type = e.target.value as 'percent' | 'fixed'
                  editingPromo ? setEditingPromo({...editingPromo, type}) : setNewPromoData({...newPromoData, type})
                }}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                disabled={loading}
              >
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount (KES)</option>
              </select>
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Value *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingPromo?.value || newPromoData.value}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    editingPromo ? setEditingPromo({...editingPromo, value: val}) : setNewPromoData({...newPromoData, value: val})
                  }}
                  placeholder="0.00"
                  className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200"
                  disabled={loading}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                  {(editingPromo?.type || newPromoData.type) === 'percent' ? '%' : 'KES'}
                </span>
              </div>
            </div>

            {/* Min Subtotal */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Minimum Subtotal (KES)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={editingPromo?.minSubtotal || newPromoData.minSubtotal}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  editingPromo ? setEditingPromo({...editingPromo, minSubtotal: val}) : setNewPromoData({...newPromoData, minSubtotal: val})
                }}
                placeholder="0"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200"
                disabled={loading}
              />
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Maximum Uses
              </label>
              <input
                type="number"
                min="1"
                value={editingPromo?.maxUses || newPromoData.maxUses}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  editingPromo ? setEditingPromo({...editingPromo, maxUses: val}) : setNewPromoData({...newPromoData, maxUses: val})
                }}
                placeholder="100"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200"
                disabled={loading}
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Expiry Date
              </label>
              <input
                type="date"
                value={editingPromo?.expiryDate ? formatDate(editingPromo.expiryDate) : newPromoData.expiryDate}
                onChange={(e) => {
                  editingPromo ? setEditingPromo({...editingPromo, expiryDate: e.target.value}) : setNewPromoData({...newPromoData, expiryDate: e.target.value})
                }}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={editingPromo ? handleUpdatePromo : handleAddPromo}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : editingPromo ? (
                <>
                  <Save className="w-4 h-4" />
                  Update Promo
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Promo
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsAddingPromo(false)
                setEditingPromo(null)
                setNewPromoData({ code: '', type: 'percent', value: 0, maxUses: 100, minSubtotal: 0, expiryDate: '' })
              }}
              className="py-3 px-6 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Promo Codes List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {(promoCodes || []).map((promo) => {
          const isExpired = promo.expiryDate && new Date(promo.expiryDate) < new Date()
          const isUsedUp = promo.usedCount >= promo.maxUses
          const isInactive = !promo.isActive || isExpired || isUsedUp

          return (
            <div 
              key={promo._id} 
              className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
                isInactive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-mono font-bold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-gray-900 dark:text-white">
                      {promo.code}
                    </h3>
                    
                    {/* Status Badges */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      promo.isActive && !isExpired && !isUsedUp
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {promo.isActive && !isExpired && !isUsedUp ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" />
                          Inactive
                        </>
                      )}
                    </span>

                    {isExpired && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Expired
                      </span>
                    )}

                    {isUsedUp && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Used Up
                      </span>
                    )}
                  </div>

                  <div className="flex gap-4 text-sm flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {promo.type === 'percent' ? `${promo.value}% off` : `KES ${promo.value.toLocaleString()} off`}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Min: KES {promo.minSubtotal.toLocaleString()}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {promo.usedCount}/{promo.maxUses} used
                    </span>
                    {promo.expiryDate && (
                      <span className={`flex items-center gap-1 ${
                        isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        Exp: {new Date(promo.expiryDate).toLocaleDateString()}
                      </span>
                    )}
                  
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1 flex-shrink-0 ml-4">
                  <button 
                    onClick={() => startEditing(promo)} 
                    className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors text-blue-700 dark:text-blue-400"
                    title="Edit promo code"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeletePromo(promo._id)} 
                    className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors text-red-700 dark:text-red-400"
                    title="Delete promo code"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {promoCodes.length === 0 && !isAddingPromo && (
        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
          <Tag className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400 dark:text-gray-600" />
          <p className="mb-2">No promo codes yet.</p>
          <button 
            onClick={() => setIsAddingPromo(true)} 
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Create your first promo code
          </button>
        </div>
      )}
    </div>
  )
}