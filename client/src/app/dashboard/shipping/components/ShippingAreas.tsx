"use client"

import { useState } from 'react'
import { 
  Plus, Trash2, Edit2, Save, X, MapPin, DollarSign, 
  CheckCircle, AlertCircle, Truck, ShoppingBag 
} from 'lucide-react'
import { ShippingArea, CreateShippingAreaRequest, UpdateShippingAreaRequest } from '@/types/order'
import { 
  getShippingAreas, 
  createShippingArea, 
  updateShippingArea, 
  deleteShippingArea 
} from '@/lib/api'

import toast from 'react-hot-toast'

interface ShippingAreasProps {
  areas: ShippingArea[]
  onUpdateAreas: (areas: ShippingArea[]) => void
}

export default function ShippingAreas({ areas, onUpdateAreas }: ShippingAreasProps) {
  const [editingArea, setEditingArea] = useState<ShippingArea | null>(null)
  const [isAddingArea, setIsAddingArea] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newArea, setNewArea] = useState<Partial<CreateShippingAreaRequest>>({
    name: '',
    regions: [],
    baseCost: 0,
    freeThreshold: 0
  })
  const [regionsInput, setRegionsInput] = useState('')
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false)

  const reloadAreas = async () => {
    try {
      const result = await getShippingAreas()
      const freshAreas = result.areas || []
      onUpdateAreas(freshAreas)
      return freshAreas

    } catch (error) {
      toast.error('Failed to reload shipping areas')
      return areas
    }
  }

  const handleAddArea = async () => {
    if (!newArea.name?.trim() || newArea.baseCost === undefined || newArea.baseCost < 0) {
      toast.error('Name and base cost are required')
      return
    }

    setLoading(true)
    try {
      const regions = regionsInput.split(',').map(r => r.trim()).filter(Boolean)
      const areaData: CreateShippingAreaRequest = {
        name: newArea.name,
        regions,
        baseCost: newArea.baseCost,
        freeThreshold: freeShippingEnabled ? (newArea.freeThreshold || 0) : 0
      }

      await createShippingArea(areaData)
      await reloadAreas()
      setIsAddingArea(false)
      setNewArea({ name: '', regions: [], baseCost: 0, freeThreshold: 0 })
      setRegionsInput('')
      setFreeShippingEnabled(false)
     
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create shipping area')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateArea = async () => {
    if (!editingArea) return

    setLoading(true)
    try {
      const regions = regionsInput.split(',').map(r => r.trim()).filter(Boolean)
      const updateData: UpdateShippingAreaRequest = {
        name: editingArea.name,
        regions,
        baseCost: editingArea.baseCost,
        freeThreshold: freeShippingEnabled ? editingArea.freeThreshold : 0,
        isActive: editingArea.isActive
      }

      await updateShippingArea(editingArea._id, updateData)
      await reloadAreas()
      setEditingArea(null)
      setRegionsInput('')
      setFreeShippingEnabled(false)
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update shipping area')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteArea = async (id: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) return

    setLoading(true)
    try {
      await deleteShippingArea(id)
      await reloadAreas()
     
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAreaStatus = async (id: string) => {
    setLoading(true)
    try {
      await updateShippingArea(id, { isActive: !areas.find(a => a._id === id)?.isActive })
      await reloadAreas()
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFreeShipping = async (area: ShippingArea, enabled: boolean, threshold?: number) => {
    setLoading(true)
    try {
      const updateData: UpdateShippingAreaRequest = {
        name: area.name,
        regions: area.regions,
        baseCost: area.baseCost,
        freeThreshold: enabled ? (threshold || area.freeThreshold || 5000) : 0,
        isActive: area.isActive
      }

      await updateShippingArea(area._id, updateData)
      await reloadAreas()
      toast.success(enabled ? `Free shipping enabled (over KES ${threshold || area.freeThreshold})` : 'Free shipping disabled')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update free shipping')
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (area: ShippingArea) => {
    setEditingArea(area)
    setRegionsInput(area.regions.join(', '))
    setFreeShippingEnabled(area.freeThreshold > 0)
  }

  const getRegionsDisplay = (regions: string[]) => regions.length > 0 ? regions.slice(0, 3).join(', ') + (regions.length > 3 ? ` +${regions.length - 3}` : '') : 'Nationwide'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Shipping Areas ({areas.length})
            </h2>
          </div>
          <button
            onClick={() => setIsAddingArea(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Area
          </button>
        </div>
      </div>

      {(isAddingArea || editingArea) && (
        <div className="p-6 border-b bg-gray-50 dark:bg-gray-900/30">
          <h3 className="text-lg font-semibold mb-6">
            {editingArea ? 'Edit' : 'New'} Shipping Area
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={editingArea?.name || newArea.name || ''}
                onChange={(e) => editingArea ? setEditingArea({...editingArea, name: e.target.value}) : setNewArea({...newArea, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                disabled={loading}
                placeholder="e.g., Nairobi Metro"
              />
            </div>

 <div>
  <label className="block text-sm font-medium mb-2">Base Cost (KES) *</label>
  <input
    type="number"
    min="0"
    step="10"
    value={editingArea?.baseCost !== undefined ? editingArea.baseCost : (newArea.baseCost ?? '')}
    onChange={(e) => {
      const val = e.target.value === '' ? 0 : Number(e.target.value)
      if (!isNaN(val) && val >= 0) {
        if (editingArea) {
          setEditingArea({...editingArea, baseCost: val})
        } else {
          setNewArea({...newArea, baseCost: val})
        }
      }
    }}
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
    disabled={loading}
    placeholder="0"
  />
</div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Regions (comma separated)</label>
              <textarea
                value={regionsInput}
                onChange={(e) => setRegionsInput(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                placeholder="Nairobi, Kiambu, Nakuru, Mombasa..."
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for nationwide shipping</p>
            </div>

            {/* Free Shipping Toggle Section */}
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-600" />
                  <label className="text-sm font-medium">Free Shipping</label>
                </div>
                <button
                  type="button"
                  onClick={() => setFreeShippingEnabled(!freeShippingEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    freeShippingEnabled ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      freeShippingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {freeShippingEnabled && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Free Shipping Threshold (KES)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingArea?.freeThreshold || newArea.freeThreshold || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      editingArea ? setEditingArea({...editingArea, freeThreshold: val}) : setNewArea({...newArea, freeThreshold: val})
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                    placeholder="5000"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Orders above this amount get free shipping
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={editingArea ? handleUpdateArea : handleAddArea}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? '...' : (editingArea ? <><Save className="w-4 h-4"/> Update</> : <><Plus className="w-4 h-4"/> Create</>)}
            </button>
            <button
              onClick={() => {
                setIsAddingArea(false)
                setEditingArea(null)
                setRegionsInput('')
                setFreeShippingEnabled(false)
                setNewArea({ name: '', regions: [], baseCost: 0, freeThreshold: 0 })
              }}
              className="px-6 bg-gray-300 hover:bg-gray-400 text-gray-700 p-3 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {areas.map((area) => (
          <div key={area._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{area.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    area.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {area.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {area.freeThreshold > 0 && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Free Shipping Over KES {area.freeThreshold.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm mb-2">
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">
                    KES {area.baseCost.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    {getRegionsDisplay(area.regions)}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                {/* Free Shipping Toggle Button */}
                <button
                  onClick={() => {
                    const enabled = area.freeThreshold === 0
                    if (enabled) {
                      const threshold = prompt('Enter free shipping threshold (KES):', '5000')
                      if (threshold && !isNaN(Number(threshold))) {
                        handleToggleFreeShipping(area, true, Number(threshold))
                      }
                    } else {
                      handleToggleFreeShipping(area, false)
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    area.freeThreshold > 0 
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  title={area.freeThreshold > 0 ? `Free shipping over KES ${area.freeThreshold}` : 'Click to enable free shipping'}
                >
                  <Truck className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleToggleAreaStatus(area._id)}
                  className={`p-2 rounded-lg transition-colors ${
                    area.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  title={area.isActive ? 'Deactivate' : 'Activate'}
                >
                  {area.isActive ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => startEditing(area)}
                  className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDeleteArea(area._id)}
                  className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {areas.length === 0 && !isAddingArea && (
        <div className="p-12 text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No shipping areas. <button onClick={() => setIsAddingArea(true)} className="text-blue-600 hover:underline font-medium">Add one now</button></p>
        </div>
      )}
    </div>
  )
}