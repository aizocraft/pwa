// src/app/products/page.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { ShoppingCart, Search, Filter, Sparkles, X, SlidersHorizontal, Star, Package, TrendingUp, Grid, List, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { Product } from "../../types/product"
import ProductCard from "../../components/ProductCard"
import { getProducts, getBrands } from "../../lib/api"
import { useCartStore } from "../../store/cart"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  
  // Initialize state from URL params
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

  // Fetch brands for filter with error handling
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

  // Map UI filters to API params
  const getApiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage
    }
    
    if (search.trim()) params.q = search.trim()
    if (selectedCategory !== "all") params.category = selectedCategory
    if (selectedBrand !== "all") params.brand = selectedBrand
    
    // Price range mapping - only add if valid numbers
    if (minPrice > 0 && !isNaN(minPrice)) params.minPrice = minPrice
    if (maxPrice < 1000000 && !isNaN(maxPrice)) params.maxPrice = maxPrice
    
    // Stock filter
    if (showInStockOnly) params.minStock = 1
    
    // Sort mapping
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

  // Products query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["products", getApiParams],
    queryFn: () => getProducts(getApiParams),
    placeholderData: keepPreviousData
  })

  // Derive categories from API data
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

  // Update URL when filters change
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

  // Mobile & Scroll effects
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const products = data?.products || []
  const pagination = data?.pagination

  // Calculate stats
  const stats = {
    total: pagination?.total || 0,
    inStock: products.filter(p => p.stock > 0).length,
    categories: categories.length - 1,
    avgRating: products.length > 0 
      ? (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1)
      : "0.0"
  }

  // Price range slider component
  const PriceRangeSlider = () => {
    const [localMin, setLocalMin] = useState(minPrice)
    const [localMax, setLocalMax] = useState(maxPrice)
    
    useEffect(() => {
      setLocalMin(minPrice)
      setLocalMax(maxPrice)
    }, [minPrice, maxPrice])
    
    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value)
      if (!isNaN(val) && val <= localMax) {
        setLocalMin(val)
        setMinPrice(val)
        setCurrentPage(1)
      }
    }
    
    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value)
      if (!isNaN(val) && val >= localMin) {
        setLocalMax(val)
        setMaxPrice(val)
        setCurrentPage(1)
      }
    }
    
    return (
      <div className="space-y-6">
        <div className="relative pt-2">
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              style={{ 
                left: `${(localMin / 1000000) * 100}%`, 
                right: `${100 - (localMax / 1000000) * 100}%` 
              }}
            />
          </div>
          <input
            type="range"
            min="0"
            max="1000000"
            step="1000"
            value={localMin}
            onChange={handleMinChange}
            className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
          />
          <input
            type="range"
            min="0"
            max="1000000"
            step="1000"
            value={localMax}
            onChange={handleMaxChange}
            className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex justify-between gap-4">
          <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Min</span>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(localMin)}</p>
          </div>
          <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Max</span>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(localMax)}</p>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-950/30" />
        <div className="absolute inset-0 bg-grid-slate-200/[0.05] dark:bg-grid-slate-800/[0.05] bg-[size:60px_60px]" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg mb-8 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:scale-[1.02]">
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Free Shipping on Orders Ksh. 50,000+</span>
          </div>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">
            Discover our curated collection of high-performance equipments.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Total Products", value: stats.total, icon: Package },
              { label: "In Stock", value: stats.inStock, icon: Package },
              { label: "Categories", value: stats.categories, icon: Filter },
              { label: "Avg Rating", value: stats.avgRating, icon: Star },
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:scale-[1.05] shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Sticky Controls */}
        <div className={`sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl mb-12 transition-all duration-500 ${
          isScrolled ? "py-4 px-6 shadow-xl" : "py-6 px-8"
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pumps, generators, solar panels..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100/50 dark:bg-gray-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 shadow-inner"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-3 bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all duration-200 text-gray-700 dark:text-gray-300 shadow-lg hover:shadow-md active:scale-95"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="sr-only">Filters</span>
              </button>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 p-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {products.length} products
                </span>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any)
                    setCurrentPage(1)
                  }}
                  className="appearance-none px-5 py-3 pr-10 bg-gray-100/50 dark:bg-gray-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:outline-none transition-all duration-200 shadow-lg"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value} className="py-3">
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              <div className="hidden sm:flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl p-2 shadow-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-700 text-blue-600 shadow-md"
                      : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-700 text-blue-600 shadow-md"
                      : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:col-span-1 transition-all duration-300 ${
            showFilters || !isMobile ? "block" : "hidden lg:block"
          }`}>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl p-8 lg:sticky lg:top-24 h-fit">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
                  >
                    Clear ({activeFiltersCount})
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-8 pb-8 border-b border-gray-200/30 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  Category
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((category) => (
                    <label
                      key={category.value}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="category"
                          value={category.value}
                          checked={selectedCategory === category.value}
                          onChange={(e) => {
                            setSelectedCategory(e.target.value)
                            setCurrentPage(1)
                          }}
                          className="w-5 h-5 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2 cursor-pointer transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {category.label}
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-xs font-semibold text-blue-800 dark:text-blue-300 rounded-full">
                        {category.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              {brands.length > 1 && (
                <div className="mb-8 pb-8 border-b border-gray-200/30 dark:border-gray-700/50">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                    Brand
                  </h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {brands.map((brand) => (
                      <label
                        key={brand.value}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group transition-all duration-200 hover:shadow-sm"
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
                          className="w-5 h-5 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2 cursor-pointer transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {brand.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div className="mb-8 pb-8 border-b border-gray-200/30 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  Price Range
                </h3>
                <PriceRangeSlider />
              </div>

              {/* Availability */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  Availability
                </h3>
                <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group transition-all duration-200 hover:shadow-sm">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2 cursor-pointer transition-all duration-200"
                    checked={showInStockOnly}
                    onChange={(e) => {
                      setShowInStockOnly(e.target.checked)
                      setCurrentPage(1)
                    }}
                  />
                  <div>
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      In Stock Only
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {stats.inStock} items available
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Products Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Active Filters Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-3 p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/50">
                {search && (
                  <div className="group flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
                    <span>Search: {search}</span>
                    <button
                      onClick={() => setSearch("")}
                      className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors group-hover:scale-110"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {selectedCategory !== "all" && (
                  <div className="group flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
                    <span>{categories.find(c => c.value === selectedCategory)?.label}</span>
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors group-hover:scale-110"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {selectedBrand !== "all" && (
                  <div className="group flex items-center gap-2 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
                    <span>Brand: {selectedBrand}</span>
                    <button
                      onClick={() => setSelectedBrand("all")}
                      className="p-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-lg transition-colors group-hover:scale-110"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {(minPrice > 0 || maxPrice < 1000000) && (
                  <div className="group flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
                    <span>
                      {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                    </span>
                    <button
                      onClick={() => {
                        setMinPrice(0)
                        setMaxPrice(1000000)
                        setCurrentPage(1)
                      }}
                      className="p-1 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-lg transition-colors group-hover:scale-110"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}  
                {showInStockOnly && (
                  <div className="group flex items-center gap-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
                    <span>In Stock Only</span>
                    <button
                      onClick={() => setShowInStockOnly(false)}
                      className="p-1 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-lg transition-colors group-hover:scale-110"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && (
              <div className={viewMode === "grid" 
                ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-8"
                : "space-y-6"
              }>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Products */}
            {!isLoading && products.length === 0 ? (
              <div className="text-center py-24 px-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl mb-8 shadow-lg">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No products found</h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                  Try adjusting your search or filters to find what you're looking for
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  Clear All Filters
                </button>
              </div>
            ) : !isLoading && (
              <>
                {viewMode === "grid" ? (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {products.map((product: Product, index: number) => (
                      <div
                        key={product._id}
                        className="group"
                        style={{ animationDelay: `${index * 75}ms` }}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {products.map((product: Product, index: number) => (
                      <div key={product._id} className="group">
                        <ProductCard product={product} variant="list" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-4 pt-12 pb-8 border-t border-gray-200/50 dark:border-gray-700/50 mt-16">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrev}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {pagination.page} of {pagination.pages}
                      </span>
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={!pagination.hasNext}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Cart Button */}
                {cartItemsCount > 0 && (
                  <div className="fixed bottom-8 right-8 z-50">
                    <Link 
                      href="/cart"
                      className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 text-lg animate-bounce"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      View Cart ({cartItemsCount})
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
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
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