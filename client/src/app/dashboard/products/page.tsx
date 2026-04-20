// src/app/dashboard/products/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  Plus, Eye, Edit, Trash2, Search, Filter, ChevronDown, Package, RefreshCw, 
  X, AlertTriangle, CheckCircle, XCircle, Star, TrendingUp, Clock, 
  DollarSign, ShoppingBag, Zap, Grid, List, ChevronLeft, ChevronRight
} from 'lucide-react'
import { getImageUrl } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'

import { Product, ProductListResponse } from '@/types/product'
import { getProducts, deleteProduct, updateProduct } from '@/lib/api'

// Animation variants for micro-interactions
const fadeInUp = "transition-all duration-300 ease-out transform hover:translate-y-[-2px]"
const buttonHover = "transition-all duration-200 transform hover:scale-105 active:scale-95"

export default function DashboardProductsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  // UI State
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [stockStatus, setStockStatus] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all')
  const [featured, setFeatured] = useState<'all' | 'featured' | 'non-featured'>('all')
  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // Build query params
  const buildQueryParams = () => {
    const params: any = { page, limit }
    
    if (search.trim()) params.q = search.trim()
    if (category) params.category = category
    if (brand) params.brand = brand
    if (minPrice) params.minPrice = parseFloat(minPrice)
    if (maxPrice) params.maxPrice = parseFloat(maxPrice)
    
    // Stock status filter
    if (stockStatus === 'in-stock') params.minStock = 1
    if (stockStatus === 'low-stock') {
      params.minStock = 1
      params.maxStock = 10
    }
    if (stockStatus === 'out-of-stock') params.minStock = 0
    if (stockStatus === 'out-of-stock') params.maxStock = 0
    
    // Featured filter
    if (featured === 'featured') params.featured = true
    if (featured === 'non-featured') params.featured = false
    
    return params
  }

  // Fetch products
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard-products', buildQueryParams()],
    queryFn: () => getProducts(buildQueryParams()),
    placeholderData: (previousData) => previousData || { 
      products: [], 
      pagination: { page: 1, limit, total: 0, pages: 1, hasNext: false, hasPrev: false } 
    } as ProductListResponse,
  })

  // Delete mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard-products'] })
      const previousData = queryClient.getQueryData<ProductListResponse>(['dashboard-products', buildQueryParams()])
      
      queryClient.setQueryData(['dashboard-products', buildQueryParams()], (old: any) => {
        if (!old) return old
        return {
          ...old,
          products: old.products.filter((p: Product) => p._id !== productId),
          pagination: {
            ...old.pagination,
            total: old.pagination.total - 1
          }
        }
      })
      
      return { previousData }
    },
    onSuccess: () => {
      setDeleteModalOpen(false)
      setProductToDelete(null)
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['dashboard-products', buildQueryParams()], context?.previousData)
      toast.error('Failed to delete product', {
        icon: '❌',
        duration: 4000
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-products'] })
    },
  })

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) => 
      updateProduct(id, { featured }),
    onMutate: async ({ id, featured }) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard-products'] })
      const previousData = queryClient.getQueryData<ProductListResponse>(['dashboard-products', buildQueryParams()])
      
      queryClient.setQueryData(['dashboard-products', buildQueryParams()], (old: any) => {
        if (!old) return old
        return {
          ...old,
          products: old.products.map((p: Product) => 
            p._id === id ? { ...p, featured } : p
          )
        }
      })
      
      return { previousData }
    },
    onSuccess: (_, { featured }) => {
    //  toast.success(`Product ${featured ? 'featured' : 'unfeatured'} successfully!`)
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['dashboard-products', buildQueryParams()], context?.previousData)
      toast.error('Failed to update featured status')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-products'] })
    },
  })

  // Open delete confirmation modal
  const openDeleteModal = (product: Product) => {
    setProductToDelete(product)
    setDeleteModalOpen(true)
  }

  // Confirm delete
  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete._id!)
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false)
    setProductToDelete(null)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setBrand('')
    setMinPrice('')
    setMaxPrice('')
    setStockStatus('all')
    setFeatured('all')
    setPage(1)
  }

  // Get stock status config
  const getStockConfig = (stock: number) => {
    if (stock > 10) return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle }
    if (stock > 0) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertTriangle }
    return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle }
  }

  const products: Product[] = data?.products || []
  const pagination = data?.pagination
  const activeFiltersCount = [search, category, brand, minPrice, maxPrice, stockStatus !== 'all', featured !== 'all'].filter(Boolean).length

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 animate-fade-in">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Failed to load products</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">Please check your connection and try again</p>
        <button 
          onClick={() => refetch()}
          className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl ${buttonHover} flex items-center gap-2`}
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Product</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                {productToDelete?.images?.[0] ? (
                  <img
                    src={getImageUrl(productToDelete?.images?.[0] ?? '')}
                    alt={productToDelete?.name ?? ''}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{productToDelete?.name || ''}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Price: {productToDelete?.price ? `KSh ${productToDelete?.price.toLocaleString()}` : ''}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="animate-slide-in-left">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your inventory • {pagination?.total || 0} product{(pagination?.total || 0) !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link 
          href="/dashboard/products/add" 
          className={`inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl ${buttonHover}`}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 animate-slide-in-right">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search products by name, brand, or type..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-5 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all duration-200 ${filtersOpen ? 'border-blue-500 shadow-md' : ''}`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* View Toggle */}
          <div className="flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'table' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {filtersOpen && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700 rounded-xl p-6 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setPage(1)
                }}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">All Categories</option>
                <option value="Pumps">Pumps</option>
                <option value="Generators">Generators</option>
                <option value="Compressors">Compressors</option>
                <option value="Solar">Solar Equipment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</label>
              <select
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value)
                  setPage(1)
                }}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">All Brands</option>
                <option value="Pedrollo">Pedrollo</option>
                <option value="Grundfos">Grundfos</option>
                <option value="Yamaha">Yamaha</option>
                <option value="Honda">Honda</option>
                <option value="Karcher">Karcher</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Price (KSh)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Price (KSh)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Any"
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Status</label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as any)}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="all">All Stock</option>
                <option value="in-stock">In Stock (&gt;10)</option>
                <option value="low-stock">Low Stock (1-10)</option>
                <option value="out-of-stock">Out of Stock (0)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Featured Status</label>
              <select
                value={featured}
                onChange={(e) => setFeatured(e.target.value as any)}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="all">All Products</option>
                <option value="featured">Featured Only</option>
                <option value="non-featured">Non-Featured Only</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Products Display */}
      {isLoading || isFetching ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-64" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {search || category || brand || minPrice || maxPrice || stockStatus !== 'all' || featured !== 'all'
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Get started by adding your first product to the catalog.'}
          </p>
          {(search || category || brand || minPrice || maxPrice || stockStatus !== 'all' || featured !== 'all') ? (
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
            >
              Clear Filters
            </button>
          ) : (
            <Link 
              href="/dashboard/products/add"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const stockConfig = getStockConfig(product.stock)
            const StockIcon = stockConfig.icon
            return (
              <div 
                key={product._id} 
                className="group bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:translate-y-[-4px] animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                  {product.images?.[0] ? (
                    <div className="relative w-full h-full">
                      <Image 
                        src={getImageUrl(product.images[0])} 
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                        }}
                        unoptimized={true}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {product.featured && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold rounded-lg">
                    {product.category}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{product.brand}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      KSh {product.price.toLocaleString()}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg ${stockConfig.color}`}>
                      <StockIcon className="w-3 h-3" />
                      {stockConfig.label} ({product.stock})
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link 
                      href={`/dashboard/products/edit/${product.slug}`}
                      className="flex-1 py-2 bg-gray-50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400 rounded-xl text-sm font-medium transition-all hover:bg-gray-100 flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => toggleFeaturedMutation.mutate({ id: product.slug, featured: !product.featured })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${buttonHover} ${
                        product.featured 
                          ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100' 
                          : 'bg-gray-50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {product.featured ? 'Featured' : 'Mark Featured'}
                    </button>
                    <button
                      onClick={() => openDeleteModal(product)}
                      className="p-2 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-xl hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // Table View
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/50 border-b border-gray-200/50 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Featured</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {products.map((product, index) => {
                  const stockConfig = getStockConfig(product.stock)
                  const StockIcon = stockConfig.icon
                  return (
                    <tr key={product._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group animate-fade-in-up" style={{ animationDelay: `${index * 30}ms` }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                            {product.images?.[0] ? (
                              <div className="relative w-full h-full">
                                <Image 
                                  src={getImageUrl(product.images[0])} 
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                                  }}
                                  unoptimized={true}
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">{product.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-900 dark:text-white">KSh {product.price.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg ${stockConfig.color}`}>
                          <StockIcon className="w-3 h-3" />
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-xs font-medium">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          style={{ backgroundColor: product.featured ? '#3B82F6' : '#CBD5E1' }}
                          onClick={() => toggleFeaturedMutation.mutate({ id: product.slug, featured: !product.featured })}
                          disabled={toggleFeaturedMutation.isPending}
                        >
                          <span className="sr-only">Toggle featured</span>
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                              product.featured ? 'translate-x-6' : 'translate-x-1'
                            } ${toggleFeaturedMutation.isPending ? 'opacity-50' : ''}`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link 
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="inline-flex p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link 
                          href={`/dashboard/products/edit/${product.slug}`}
                          className="inline-flex p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all hover:scale-110"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(product)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-4 pt-4 animate-fade-in">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${buttonHover}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum = page
                if (pagination.pages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                      page === pageNum
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={!pagination.hasNext}
              className={`px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${buttonHover}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}