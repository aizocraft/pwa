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
      toast.success('Promo code created!')
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
      toast.success('Promo code updated!')
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
      toast.success('Promo code deleted!')
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Promo Codes ({promoCodes?.length || 0})

          </h2>
          <button
            onClick={() => setIsAddingPromo(true)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Code
          </button>
        </div>
      </div>

      {(isAddingPromo || editingPromo) && (
        <div className="p-6 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold mb-6">{
            editingPromo ? 'Edit' : 'New'
          } Promo Code</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Code *</label>
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
                className="w-full p-3 border rounded-lg focus:ring-2"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={editingPromo?.type || newPromoData.type}
                onChange={(e) => {
                  const type = e.target.value as 'percent' | 'fixed'
                  editingPromo ? setEditingPromo({...editingPromo, type}) : setNewPromoData({...newPromoData, type})
                }}
                className="w-full p-3 border rounded-lg"
              >
                <option value="percent">%</option>
                <option value="fixed">KES</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Value *</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={editingPromo?.value || newPromoData.value}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    editingPromo ? setEditingPromo({...editingPromo, value: val}) : setNewPromoData({...newPromoData, value: val})
                  }}
                  className="w-full p-3 pl-10 border rounded-lg focus:ring-2"
                  disabled={loading}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {(editingPromo?.type || newPromoData.type) === 'percent' ? '%' : 'KES'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Min Subtotal</label>
              <input
                type="number"
                value={editingPromo?.minSubtotal || newPromoData.minSubtotal}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  editingPromo ? setEditingPromo({...editingPromo, minSubtotal: val}) : setNewPromoData({...newPromoData, minSubtotal: val})
                }}
                className="w-full p-3 border rounded-lg focus:ring-2"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Uses</label>
              <input
                type="number"
                value={editingPromo?.maxUses || newPromoData.maxUses}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  editingPromo ? setEditingPromo({...editingPromo, maxUses: val}) : setNewPromoData({...newPromoData, maxUses: val})
                }}
                className="w-full p-3 border rounded-lg focus:ring-2"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expiry</label>
              <input
                type="date"
                value={editingPromo?.expiryDate ? formatDate(editingPromo.expiryDate) : newPromoData.expiryDate}
                onChange={(e) => {
                  editingPromo ? setEditingPromo({...editingPromo, expiryDate: e.target.value}) : setNewPromoData({...newPromoData, expiryDate: e.target.value})
                }}
                className="w-full p-3 border rounded-lg focus:ring-2"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-8">
            <button
              onClick={editingPromo ? handleUpdatePromo : handleAddPromo}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium flex gap-2 justify-center"
            >
              {loading ? '...' : (editingPromo ? <><Save className="w-4 h-4"/> Update</> : <><Plus className="w-4 h-4"/> Create</>)}
            </button>
            <button
              onClick={() => {
                setIsAddingPromo(false)
                setEditingPromo(null)
                setNewPromoData({ code: '', type: 'percent', value: 0, maxUses: 100, minSubtotal: 0, expiryDate: '' })
              }}
              className="py-3 px-6 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-200">
{(promoCodes || []).map((promo) => (

          <div key={promo._id} className="p-6 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-mono font-bold bg-gray-100 px-3 py-1 rounded-full">
                    {promo.code}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    promo.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-4 text-sm mb-2 flex-wrap">
                  <span className="font-semibold">
                    {promo.type === 'percent' ? `${promo.value}%` : `KES ${promo.value}`}
                  </span>
                  <span>Min: KES {promo.minSubtotal.toLocaleString()}</span>
                  <span>{promo.usedCount}/{promo.maxUses} used</span>
                  {promo.expiryDate && <span>Exp: {new Date(promo.expiryDate).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEditing(promo)} className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeletePromo(promo._id)} className="p-2 bg-red-100 hover:bg-red-200 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {promoCodes.length === 0 && !isAddingPromo && (
        <div className="p-12 text-center text-gray-500">
          <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No promo codes. <button onClick={() => setIsAddingPromo(true)} className="text-blue-600 hover:underline">Create first one</button></p>
        </div>
      )}
    </div>
  )
}
