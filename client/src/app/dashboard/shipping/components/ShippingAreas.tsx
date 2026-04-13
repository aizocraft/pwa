// src/app/dashboard/shipping/components/ShippingAreas.tsx
"use client"

import { useState } from 'react'
import { 
  Plus, Trash2, Edit2, Save, X, MapPin, DollarSign, 
  Truck, CheckCircle, AlertCircle 
} from 'lucide-react'
import { ShippingArea } from '../page'

interface ShippingAreasProps {
  areas: ShippingArea[]
  onUpdateAreas: (areas: ShippingArea[]) => void
}

export default function ShippingAreas({ areas, onUpdateAreas }: ShippingAreasProps) {
  const [editingArea, setEditingArea] = useState<ShippingArea | null>(null)
  const [isAddingArea, setIsAddingArea] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [newArea, setNewArea] = useState<Partial<ShippingArea>>({
    name: '',
    fee: 0,
    estimatedDays: '',
    isActive: true
  })

  const handleAddArea = () => {
    if (newArea.name && newArea.fee && newArea.estimatedDays) {
      const area: ShippingArea = {
        id: Date.now().toString(),
        name: newArea.name,
        fee: newArea.fee,
        estimatedDays: newArea.estimatedDays,
        isActive: newArea.isActive || true
      }
      onUpdateAreas([...areas, area])
      setIsAddingArea(false)
      setNewArea({ name: '', fee: 0, estimatedDays: '', isActive: true })
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }
  }

  const handleUpdateArea = () => {
    if (editingArea) {
      onUpdateAreas(areas.map(area => 
        area.id === editingArea.id ? editingArea : area
      ))
      setEditingArea(null)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }
  }

  const handleDeleteArea = (id: string) => {
    if (confirm('Are you sure you want to delete this shipping area?')) {
      onUpdateAreas(areas.filter(area => area.id !== id))
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }
  }

  const handleToggleAreaStatus = (id: string) => {
    onUpdateAreas(areas.map(area =>
      area.id === id ? { ...area, isActive: !area.isActive } : area
    ))
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-20 right-4 z-50 animate-slide-down">
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>Changes saved successfully!</span>
          </div>
        </div>
      )}

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
        {areas.length === 0 ? (
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
          areas.map((area) => (
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