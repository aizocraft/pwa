// app/products/page.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { ShoppingCart, Search, Filter, X, Star, Package, Grid, List, ChevronDown, Zap, SlidersHorizontal, Check, ChevronLeft, ChevronRight } from "lucide-react"
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
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page')
    return page ? parseInt(page) : 1
  })
  const itemsPerPage = 12
  
  const cartItemsCount = useCartStore((state) => state.totalItems)

  // Fetch brands from API
  const { data: brandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: () => getBrands().catch(() => []),
    staleTime: 30 * 60 * 1000,
    placeholderData: []
  })

  // Fetch all products for filters
  const { data: allProductsData } = useQuery({
    queryKey: ["all-products-for-filters"],
    queryFn: () => getProducts({ limit: 1000 }),
    staleTime: 5 * 60 * 1000
  })

  const allProducts = allProductsData?.products || []

  // Get unique categories from all products
  const categories = useMemo(() => {
    const categoriesMap = new Map<string, number>()
    allProducts.forEach((p: Product) => {
      if (p.category) {
        categoriesMap.set(p.category, (categoriesMap.get(p.category) || 0) + 1)
      }
    })
    return [
      { value: "all", label: "All Products", count: allProducts.length },
      ...Array.from(categoriesMap.entries()).map(([cat, count]) => ({
        value: cat,
        label: cat.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        count
      }))
    ]
  }, [allProducts])

  const normalizeBrand = (value?: string | null) => (value || '').trim().toLowerCase()

  // Get unique brands from all products (not from brands API)
  const allBrands = useMemo(() => {
    const brandsMap = new Map<string, { value: string; label: string; count: number }>()

    allProducts.forEach((p: Product) => {
      if (p.brand && p.brand !== "") {
        const key = normalizeBrand(p.brand)
        const current = brandsMap.get(key)
        if (current) {
          current.count += 1
        } else {
          brandsMap.set(key, { value: p.brand, label: p.brand, count: 1 })
        }
      }
    })

    const resolvedBrands = Array.from(brandsMap.values()).sort((a, b) => a.label.localeCompare(b.label))

    return [
      { value: "all", label: "All Brands", count: allProducts.length },
      ...resolvedBrands.map((b) => ({ value: b.value, label: b.label, count: b.count }))
    ]
  }, [allProducts])


  // Get min/max price from all products
  const priceRange = useMemo(() => {
    const prices = allProducts.map(p => Number(p.price)).filter(p => !isNaN(p))
    return {
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 1000000)
    }
  }, [allProducts])

  const getApiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage
    }
    
    if (search.trim()) params.q = search.trim()
    if (selectedCategory !== "all") params.category = selectedCategory
    if (selectedBrand !== "all" && selectedBrand !== "") params.brand = selectedBrand
    if (minPrice > 0 && !isNaN(minPrice)) params.minPrice = minPrice
    if (maxPrice < priceRange.max && !isNaN(maxPrice)) params.maxPrice = maxPrice
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
  }, [search, selectedCategory, selectedBrand, minPrice, maxPrice, showInStockOnly, sortBy, currentPage, priceRange.max])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["products", getApiParams],
    queryFn: () => getProducts(getApiParams),
    placeholderData: keepPreviousData
  })

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCategory !== "all") params.set('category', selectedCategory)
    if (selectedBrand !== "all" && selectedBrand !== "") params.set('brand', selectedBrand)  // FIXED: Save brand to URL
    if (search) params.set('q', search)
    if (minPrice > 0 && !isNaN(minPrice)) params.set('minPrice', minPrice.toString())
    if (maxPrice < priceRange.max && !isNaN(maxPrice)) params.set('maxPrice', maxPrice.toString())
    if (sortBy !== "all") params.set('sort', sortBy)
    if (showInStockOnly) params.set('inStock', 'true')
    if (currentPage > 1) params.set('page', currentPage.toString())
    
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    window.history.replaceState({}, '', newUrl)
  }, [selectedCategory, selectedBrand, search, minPrice, maxPrice, sortBy, showInStockOnly, currentPage, priceRange.max])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('KSh', 'KSh')
  }

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
    (minPrice > priceRange.min || maxPrice < priceRange.max ? 1 : 0) + 
    (showInStockOnly ? 1 : 0) +
    (search ? 1 : 0)

  const clearAllFilters = () => {
    setSelectedCategory("all")
    setSelectedBrand("all")
    setMinPrice(priceRange.min)
    setMaxPrice(priceRange.max)
    setShowInStockOnly(false)
    setSearch("")
    setCurrentPage(1)
  }

  const products = data?.products || []
  const pagination = data?.pagination

  // Brand filter correctness fallback:
  // If the backend returns products with brand casing/whitespace mismatches,
  // normalize both sides and filter client-side before rendering.
  const brandFilteredProducts = useMemo(() => {
    if (!selectedBrand || selectedBrand === 'all') return products
    const selectedKey = normalizeBrand(selectedBrand)
    if (!selectedKey) return products
    return products.filter((p: Product) => normalizeBrand(p.brand) === selectedKey)
  }, [products, selectedBrand])

  // If the backend didn't paginate correctly for the current brand filter,
  // we still render only matching brand products on this page.
  const displayedProducts = brandFilteredProducts

  if (error) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load products</h2>
          <p className="text-gray-600 mb-6">Please check your connection and try again</p>
          <button onClick={() => refetch()} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
     <div className="w-full px-[40px] py-6 sm:py-8 pt-8 md:pt-12 lg:pt-16">
        
        {/* Compact Filter Bar - Top */}
        <div className="mb-6 space-y-4">
          {/* Search and Sort Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as any); setCurrentPage(1) }}
                  className="appearance-none px-4 py-3 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              
              <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-600"}`}>
                  <Grid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600"}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Chips - Categories, Brands, Price, Stock */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Filters:</span>
            
            {/* Category Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium hover:border-blue-500 transition-colors">
                {selectedCategory === "all" ? "All Categories" : categories.find(c => c.value === selectedCategory)?.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30">
                <div className="max-h-64 overflow-y-auto p-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => { setSelectedCategory(cat.value); setCurrentPage(1) }}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${selectedCategory === cat.value ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{cat.label}</span>
                        <span className="text-[10px] text-gray-400">({cat.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Brand Dropdown*/}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium hover:border-blue-500 transition-colors">
                {selectedBrand === "all" ? "All Brands" : selectedBrand}
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30">
                <div className="max-h-64 overflow-y-auto p-1">
                  {allBrands.map((brand) => (
                    <button
                      key={brand.value}
                      onClick={() => { setSelectedBrand(brand.value); setCurrentPage(1) }}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${selectedBrand === brand.value ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{brand.label}</span>
                        <span className="text-[10px] text-gray-400">({brand.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium hover:border-blue-500 transition-colors">
                Price: {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 p-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Min Price ({formatPrice(minPrice)})</label>
                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={minPrice}
                      onChange={(e) => { setMinPrice(parseInt(e.target.value)); setCurrentPage(1) }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Max Price ({formatPrice(maxPrice)})</label>
                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={maxPrice}
                      onChange={(e) => { setMaxPrice(parseInt(e.target.value)); setCurrentPage(1) }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* In Stock Toggle */}
            <button
              onClick={() => { setShowInStockOnly(!showInStockOnly); setCurrentPage(1) }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${showInStockOnly ? "bg-green-100 dark:bg-green-900/30 text-green-700 border-green-300" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"}`}
            >
              {showInStockOnly && <Check className="w-3 h-3" />}
              In Stock Only
            </button>

            {/* Clear All Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedCategory !== "all" && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-xs">
                  <span>Category: {categories.find(c => c.value === selectedCategory)?.label}</span>
                  <button onClick={() => { setSelectedCategory("all"); setCurrentPage(1) }} className="hover:scale-110">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {selectedBrand !== "all" && selectedBrand !== "" && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-xs">
                  <span>Brand: {selectedBrand}</span>
                  <button onClick={() => { setSelectedBrand("all"); setCurrentPage(1) }} className="hover:scale-110">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {(minPrice > priceRange.min || maxPrice < priceRange.max) && (
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-xs">
                  <span>Price: {formatPrice(minPrice)} - {formatPrice(maxPrice)}</span>
                  <button onClick={() => { setMinPrice(priceRange.min); setMaxPrice(priceRange.max); setCurrentPage(1) }} className="hover:scale-110">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {search && (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-xs">
                  <span>Search: {search}</span>
                  <button onClick={() => { setSearch(""); setCurrentPage(1) }} className="hover:scale-110">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {showInStockOnly && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg text-xs">
                  <span>In Stock Only</span>
                  <button onClick={() => { setShowInStockOnly(false); setCurrentPage(1) }} className="hover:scale-110">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{brandFilteredProducts.length}</span> of <span className="font-semibold">{pagination?.total || 0}</span> products
          </p>
        </div>

        {/* Products Grid */}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (

          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <button onClick={clearAllFilters} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              Clear All Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayedProducts.map((product: Product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (

          <div className="space-y-4">
            {displayedProducts.map((product: Product) => (
              <ProductCard key={product._id} product={product} variant="list" />
            ))}

          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum = pagination.page;
                if (pagination.pages <= 5) pageNum = i + 1;
                else if (pagination.page <= 3) pageNum = i + 1;
                else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
                else pageNum = pagination.page - 2 + i;
                
                if (pageNum < 1 || pageNum > pagination.pages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-all ${pagination.page === pageNum ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
              disabled={!pagination.hasNext}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Cart Button */}
        {cartItemsCount > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Link 
              href="/cart" 
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart ({cartItemsCount})
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}