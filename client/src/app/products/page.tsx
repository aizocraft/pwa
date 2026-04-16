'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { ShoppingCart, Search, Filter, Sparkles, X, SlidersHorizontal, Star, Package, TrendingUp, Grid, List, ChevronDown, Zap, Truck, Award, DollarSign } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { Product } from "../../types/product"
import ProductCard from "../../components/ProductCard"
import { getProducts, getBrands } from "../../lib/api"
import { useCartStore } from "../../store/cart"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "all")
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || "all")
  const [minPrice, setMinPrice] = useState(() => {
    const min = searchParams.get('minPrice')
    return min ? parseInt(min) : 0
  })
  const [maxPrice, setMaxPrice] = useState(() => {
    const max = searchParams.get('maxPrice')
    return max ? parseInt(max) : 1000000
  })
  const [sortBy, setSortBy] = useState<'all' | 'featured' | 'price-low' | 'price-high' | 'rating' | 'name'>(
    (searchParams.get('sort') as any) || "all"
  )
  const [viewMode, setViewMode] = useState<'grid' | 'list'>("grid")
  const [showInStockOnly, setShowInStockOnly] = useState(searchParams.get('inStock') === 'true')
  const [showFilters, setShowFilters] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page')
    return page ? parseInt(page) : 1
  })
  const itemsPerPage = 12
  
  const cartItemsCount = useCartStore((state) => state.totalItems)

  const { data: brandsData, isLoading: brandsLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: () => getBrands().catch(() => []),
    staleTime: 30 * 60 * 1000,
    placeholderData: []
  })

  const brands = useMemo(() => {
    const brandsList = Array.isArray(brandsData) ? brandsData : []
    if (brandsList.length === 0) {
      return [{ value: "all", label: "All Brands" }]
    }
    return [
      { value: "all", label: "All Brands" },
      ...brandsList.map((brand: string) => ({ value: brand, label: brand }))
    ]
  }, [brandsData])

  const getApiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage
    }
    
    if (search.trim()) params.q = search.trim()
    if (selectedCategory !== "all") params.category = selectedCategory
    if (selectedBrand !== "all") params.brand = selectedBrand
    if (minPrice > 0 && !isNaN(minPrice)) params.minPrice = minPrice
    if (maxPrice < 1000000 && !isNaN(maxPrice)) params.maxPrice = maxPrice
    if (showInStockOnly) params.minStock = 1
    
    switch (sortBy) {
      case "price-low":
        params.sort = "price"
        params.order = "asc"
        break
      case "price-high":
        params.sort = "price"
        params.order = "desc"
        break
      case "rating":
        params.sort = "rating"
        params.order = "desc"
        break
      case "name":
        params.sort = "name"
        params.order = "asc"
        break
      case "featured":
        params.featured = true
        break
    }
    
    return params
  }, [search, selectedCategory, selectedBrand, minPrice, maxPrice, showInStockOnly, sortBy, currentPage])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["products", getApiParams],
    queryFn: () => getProducts(getApiParams),
    placeholderData: keepPreviousData
  })

  const categories = useMemo(() => {
    if (!data?.products || data.products.length === 0) {
      return [{ value: "all", label: "All Products", count: 0 }]
    }
    
    const categoriesMap = new Map<string, number>()
    data.products.forEach((p: Product) => {
      const categoryName = p.category
      if (categoryName) {
        const count = categoriesMap.get(categoryName) || 0
        categoriesMap.set(categoryName, count + 1)
      }
    })
    
    return [
      { value: "all", label: "All Products", count: data?.pagination?.total || 0 },
      ...Array.from(categoriesMap.entries()).map(([cat, count]) => ({
        value: cat,
        label: cat.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        count
      })).sort((a, b) => b.count - a.count)
    ]
  }, [data?.products, data?.pagination?.total])

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCategory !== "all") params.set('category', selectedCategory)
    if (selectedBrand !== "all") params.set('brand', selectedBrand)
    if (search) params.set('q', search)
    if (minPrice > 0 && !isNaN(minPrice)) params.set('minPrice', minPrice.toString())
    if (maxPrice < 1000000 && !isNaN(maxPrice)) params.set('maxPrice', maxPrice.toString())
    if (sortBy !== "all") params.set('sort', sortBy)
    if (showInStockOnly) params.set('inStock', 'true')
    if (currentPage > 1) params.set('page', currentPage.toString())
    
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    window.history.replaceState({}, '', newUrl)
  }, [selectedCategory, selectedBrand, search, minPrice, maxPrice, sortBy, showInStockOnly, currentPage])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('KSh', 'KSh')
  }

  const minPriceLabel = formatPrice(minPrice)
  const maxPriceLabel = formatPrice(maxPrice)

  const sortOptions = [
    { value: "all", label: "All Products" },
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "name", label: "Name: A-Z" },
  ]

  const activeFiltersCount = 
    (selectedCategory !== "all" ? 1 : 0) + 
    (selectedBrand !== "all" ? 1 : 0) +
    (minPrice > 0 || maxPrice < 1000000 ? 1 : 0) + 
    (showInStockOnly ? 1 : 0) +
    (search ? 1 : 0)

  const clearAllFilters = () => {
    setSelectedCategory("all")
    setSelectedBrand("all")
    setMinPrice(0)
    setMaxPrice(1000000)
    setShowInStockOnly(false)
    setSearch("")
    setCurrentPage(1)
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const products = data?.products || []
  const pagination = data?.pagination

  const stats = {
    total: pagination?.total || 0,
    inStock: products.filter(p => p.stock > 0).length,
    categories: categories.length - 1,
    avgRating: products.length > 0 
      ? (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1)
      : "0.0"
  }

  // Advanced Price Range Slider Component
  const PriceRangeSlider = () => {
    const [localMin, setLocalMin] = useState(minPrice)
    const [localMax, setLocalMax] = useState(maxPrice)
    const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
    
    useEffect(() => {
      setLocalMin(minPrice)
      setLocalMax(maxPrice)
    }, [minPrice, maxPrice])
    
    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value)
      if (!isNaN(val) && val <= localMax - 1000) {
        setLocalMin(val)
        setMinPrice(val)
        setCurrentPage(1)
      }
    }
    
    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value)
      if (!isNaN(val) && val >= localMin + 1000) {
        setLocalMax(val)
        setMaxPrice(val)
        setCurrentPage(1)
      }
    }
    
    const getPercentage = (value: number) => {
      return ((value - 0) / (1000000 - 0)) * 100
    }
    
    const minPercent = getPercentage(localMin)
    const maxPercent = getPercentage(localMax)
    
    return (
      <div className="space-y-5">
        <div className="relative pt-2 pb-6">
          {/* Slider Track */}
          <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
            {/* Active Range */}
            <div 
              className="absolute h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-100"
              style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
            />
          </div>
          
          {/* Min Slider */}
          <input
            type="range"
            min="0"
            max="1000000"
            step="1000"
            value={localMin}
            onChange={handleMinChange}
            onMouseDown={() => setIsDragging('min')}
            onMouseUp={() => setIsDragging(null)}
            className="absolute top-0 left-0 w-full h-1.5 opacity-0 cursor-pointer"
            style={{ zIndex: 2 }}
          />
          
          {/* Max Slider */}
          <input
            type="range"
            min="0"
            max="1000000"
            step="1000"
            value={localMax}
            onChange={handleMaxChange}
            onMouseDown={() => setIsDragging('max')}
            onMouseUp={() => setIsDragging(null)}
            className="absolute top-0 left-0 w-full h-1.5 opacity-0 cursor-pointer"
            style={{ zIndex: 2 }}
          />
          
          {/* Handles */}
          <div 
            className="absolute -top-1 w-5 h-5 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
            style={{ left: `calc(${minPercent}% - 10px)` }}
          />
          <div 
            className="absolute -top-1 w-5 h-5 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
            style={{ left: `calc(${maxPercent}% - 10px)` }}
          />
        </div>
        
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={localMin}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (!isNaN(val) && val >= 0 && val <= localMax - 1000) {
                    setLocalMin(val)
                    setMinPrice(val)
                    setCurrentPage(1)
                  }
                }}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">Min</p>
          </div>
          <span className="text-gray-400">—</span>
          <div className="flex-1">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={localMax}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (!isNaN(val) && val <= 1000000 && val >= localMin + 1000) {
                    setLocalMax(val)
                    setMaxPrice(val)
                    setCurrentPage(1)
                  }
                }}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">Max</p>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
          <span>KSh 0</span>
          <span>KSh 250K</span>
          <span>KSh 500K</span>
          <span>KSh 750K</span>
          <span>KSh 1M</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load products</h2>
          <p className="text-gray-600 mb-6">Please check your connection and try again</p>
          <button 
            onClick={() => refetch()}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Compact Hero Section */}
      <section className="relative pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        {/* Free Shipping Banner - More Compact */}
        <div className="max-w-7xl mx-auto mb-4">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-4 py-2 rounded-full shadow-md border border-gray-200/50 dark:border-gray-700/50">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Free Shipping on Orders KSh 50,000+</span>
          </div>
        </div>

        {/* Compact Stats Cards */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Package className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white leading-none">{stats.total}</div>
                  <div className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Products</div>
                </div>
              </div>
            </div>
            
            <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                  <Truck className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white leading-none">{stats.inStock}</div>
                  <div className="text-[10px] font-medium text-gray-600 dark:text-gray-400">In Stock</div>
                </div>
              </div>
            </div>
            
            <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                  <Filter className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white leading-none">{stats.categories}</div>
                  <div className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Categories</div>
                </div>
              </div>
            </div>
            
            <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                  <Star className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white leading-none">{stats.avgRating}</div>
                  <div className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Sticky Controls - More Compact */}
        <div className={`sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-lg mb-8 transition-all duration-300 ${
          isScrolled ? "py-3 px-4 shadow-md" : "py-4 px-5"
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-2 bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any)
                    setCurrentPage(1)
                  }}
                  className="appearance-none px-4 py-2 pr-8 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-sm font-medium cursor-pointer hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-all"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className={`lg:col-span-1 transition-all duration-300 ${
            showFilters || !isMobile ? "block" : "hidden lg:block"
          }`}>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-5 lg:sticky lg:top-20">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Filters</h2>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                  >
                    Clear ({activeFiltersCount})
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-5 pb-5 border-b border-gray-200/30 dark:border-gray-700/50">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Category</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {categories.map((category) => (
                    <label
                      key={category.value}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="category"
                          value={category.value}
                          checked={selectedCategory === category.value}
                          onChange={(e) => {
                            setSelectedCategory(e.target.value)
                            setCurrentPage(1)
                          }}
                          className="w-4 h-4 text-blue-600 rounded-full focus:ring-blue-500"
                        />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {category.label}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-xs font-semibold text-blue-800 dark:text-blue-300 rounded-full">
                        {category.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              {brands.length > 1 && (
                <div className="mb-5 pb-5 border-b border-gray-200/30 dark:border-gray-700/50">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Brand</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {brands.map((brand) => (
                      <label
                        key={brand.value}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="brand"
                          value={brand.value}
                          checked={selectedBrand === brand.value}
                          onChange={(e) => {
                            setSelectedBrand(e.target.value)
                            setCurrentPage(1)
                          }}
                          className="w-4 h-4 text-blue-600 rounded-full focus:ring-blue-500"
                        />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {brand.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div className="mb-5 pb-5 border-b border-gray-200/30 dark:border-gray-700/50">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Price Range</h3>
                <PriceRangeSlider />
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Availability</h3>
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    checked={showInStockOnly}
                    onChange={(e) => {
                      setShowInStockOnly(e.target.checked)
                      setCurrentPage(1)
                    }}
                  />
                  <div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      In Stock Only
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                      {stats.inStock} items available
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Products Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Active Filters Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl">
                {search && (
                  <div className="flex items-center gap-1.5 bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                    <span>Search: {search}</span>
                    <button onClick={() => setSearch("")} className="hover:scale-110 transition-transform">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {selectedCategory !== "all" && (
                  <div className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium">
                    <span>{categories.find(c => c.value === selectedCategory)?.label}</span>
                    <button onClick={() => setSelectedCategory("all")} className="hover:scale-110 transition-transform">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {selectedBrand !== "all" && (
                  <div className="flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 px-3 py-1.5 rounded-lg text-xs font-medium">
                    <span>Brand: {selectedBrand}</span>
                    <button onClick={() => setSelectedBrand("all")} className="hover:scale-110 transition-transform">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {(minPrice > 0 || maxPrice < 1000000) && (
                  <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 px-3 py-1.5 rounded-lg text-xs font-medium">
                    <span>{formatPrice(minPrice)} - {formatPrice(maxPrice)}</span>
                    <button onClick={() => { setMinPrice(0); setMaxPrice(1000000); setCurrentPage(1) }} className="hover:scale-110 transition-transform">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}  
                {showInStockOnly && (
                  <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-3 py-1.5 rounded-lg text-xs font-medium">
                    <span>In Stock Only</span>
                    <button onClick={() => setShowInStockOnly(false)} className="hover:scale-110 transition-transform">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && (
              <div className={viewMode === "grid" ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Products */}
            {!isLoading && products.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search or filters</p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : !isLoading && (
              <>
                {viewMode === "grid" ? (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {products.map((product: Product, index: number) => (
                      <div key={product._id} className="group">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product: Product) => (
                      <div key={product._id} className="group">
                        <ProductCard product={product} variant="list" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-3 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrev}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={!pagination.hasNext}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Cart Button */}
                {cartItemsCount > 0 && (
                  <div className="fixed bottom-6 right-6 z-50">
                    <Link 
                      href="/cart"
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Cart ({cartItemsCount})
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}