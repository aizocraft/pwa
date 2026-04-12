// src/app/dashboard/products/add/page.tsx
'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Sparkles,
  AlertCircle,
  CheckCircle,
  Upload,
  Tag,
  Settings,
  Info,
  Package,
  DollarSign,
  Layers,
  Building2
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createProduct } from '@/lib/api'
import { Product } from '@/types/product'

export default function AddProductPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeSection, setActiveSection] = useState('basic')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: '',
    stock: '',
    featured: false,
    images: [''],
    tags: [] as string[],
    specifications: {} as Record<string, string>,
    brand: '',
    type: '',
    rating: 0,
  })

  const [newTag, setNewTag] = useState('')
  const [specKey, setSpecKey] = useState('')
  const [specValue, setSpecValue] = useState('')
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  // Generate slug from name
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }, [])

  const handleNameChange = useCallback((name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }, [generateSlug])

  // Add tag
  const addTag = useCallback(() => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
      toast.success(`Tag "${newTag.trim()}" added`)
    }
  }, [newTag, formData.tags])

  const removeTag = useCallback((tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
    toast.success(`Tag "${tag}" removed`)
  }, [])

  // Add specification
  const addSpecification = useCallback(() => {
    if (specKey.trim() && specValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey.trim()]: specValue.trim()
        }
      }))
      setSpecKey('')
      setSpecValue('')
      toast.success(`Specification "${specKey.trim()}" added`)
    }
  }, [specKey, specValue])

  const removeSpecification = useCallback((key: string) => {
    const newSpecs = { ...formData.specifications }
    delete newSpecs[key]
    setFormData(prev => ({
      ...prev,
      specifications: newSpecs
    }))
    toast.success(`Specification "${key}" removed`)
  }, [formData.specifications])

  // Handle image URLs
  const updateImage = useCallback((index: number, value: string) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData(prev => ({ ...prev, images: newImages }))
    // Clear error for this image
    if (imageErrors[index]) {
      setImageErrors(prev => ({ ...prev, [index]: false }))
    }
  }, [formData.images, imageErrors])

  const addImage = useCallback(() => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }))
  }, [])

  const removeImage = useCallback((index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, images: newImages }))
    }
  }, [formData.images])

  const handleImageError = useCallback((index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }))
  }, [])

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully!')
      router.push('/dashboard/products')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create product')
    },
    onSettled: () => {
      setIsSubmitting(false)
    }
  })

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate required fields
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields')
      setIsSubmitting(false)
      return
    }

    // Prepare product data
    const productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || '',
      price: parseFloat(formData.price) || 0,
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
      category: formData.category,
      stock: parseInt(formData.stock) || 0,
      featured: formData.featured,
      images: formData.images.filter(img => img.trim() !== ''),
      tags: formData.tags,
      specs: formData.specifications,
      brand: formData.brand || '',
      type: formData.type || '',
      rating: formData.rating || 0,
    }

    createMutation.mutate(productData)
  }, [formData, createMutation])

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'details', label: 'Details', icon: Settings },
    { id: 'specs', label: 'Specifications', icon: Package },
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(sectionId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/products"
              className="group p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Add New Product
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Create a new product for your store
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="group flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Create Product
                  <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl mb-6 p-1 shadow-sm">
          <div className="flex flex-wrap gap-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          
          {/* Basic Information Section */}
          <section id="basic" className="scroll-mt-20">
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-xl">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Essential product details</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., 500W Solar Panel"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 font-mono text-sm"
                      placeholder="auto-generated from name"
                    />
                    <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (auto-generated)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="solar-panels">☀️ Solar Panels</option>
                      <option value="inverters">⚡ Inverters</option>
                      <option value="generators">🔌 Generators</option>
                      <option value="pumps">💧 Pumps</option>
                      <option value="batteries">🔋 Batteries</option>
                      <option value="controllers">🎛️ Controllers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price (KES) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Compare at Price (Optional)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={formData.compareAtPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, compareAtPrice: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                        placeholder="Original price"
                        step="0.01"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Original price to show discount</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Brand
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., SolarTech"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Monocrystalline"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">
                        ⭐ Feature this product
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Description Section */}
          <section id="details" className="scroll-mt-20">
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="border-b border-gray-200 dark:border-gray-700 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-xl">
                    <Info className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Detailed product information</p>
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Write a detailed description of your product..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.description.length} characters
                </p>
              </div>
            </div>
          </section>

          {/* Images Section */}
          <section id="images" className="scroll-mt-20">
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="border-b border-gray-200 dark:border-gray-700 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-950/50 rounded-xl">
                    <ImageIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Images</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add product photos (URLs)</p>
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="space-y-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-3 items-start group animate-in fade-in slide-in-from-left duration-300">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-gray-400" />
                          <input
                            type="url"
                            value={image}
                            onChange={(e) => updateImage(index, e.target.value)}
                            className={`flex-1 px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 transition-all ${
                              imageErrors[index] 
                                ? 'border-red-300 focus:ring-red-500' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        {imageErrors[index] && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Invalid image URL
                          </p>
                        )}
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all duration-200 hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImage}
                    className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-all duration-200 hover:translate-x-1"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Add another image
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Tags Section */}
          <section id="details" className="scroll-mt-20">
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="border-b border-gray-200 dark:border-gray-700 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-950/50 rounded-xl">
                    <Tag className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tags</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Help customers find your product</p>
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="group inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full text-sm font-medium animate-in fade-in zoom-in duration-200"
                    >
                      <Tag className="w-3 h-3" />
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-red-500 transition-colors ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {formData.tags.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No tags added yet</p>
                )}
              </div>
            </div>
          </section>

          {/* Specifications Section */}
          <section id="specs" className="scroll-mt-20">
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="border-b border-gray-200 dark:border-gray-700 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-950/50 rounded-xl">
                    <Settings className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Specifications</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Technical details and features</p>
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <input
                    type="text"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="Specification name (e.g., Wattage)"
                  />
                  <input
                    type="text"
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="Value (e.g., 500W)"
                  />
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div 
                      key={key} 
                      className="group flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-left"
                    >
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">{key}:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">{value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {Object.keys(formData.specifications).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No specifications added yet</p>
                )}
              </div>
            </div>
          </section>
        </form>
      </div>
    </div>
  )
}