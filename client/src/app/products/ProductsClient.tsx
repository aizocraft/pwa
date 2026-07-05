'use client';

/**
 * Products Client Component
 * 
 * A full-featured product listing page with advanced filtering, sorting, 
 * pagination, and both grid/list view modes. Uses React Query for data 
 * fetching and caching with optimistic UI updates.
 * 
 * Features:
 * - Search by product name, description, SKU, and supplier
 * - Category and brand filtering with dropdown menus
 * - Price range filtering with dual-range sliders
 * - In-stock only toggle
 * - Multiple sort options (featured, price, rating, name)
 * - Grid and list view modes
 * - Pagination with page numbers
 * - Rich text rendering for product descriptions (list view only)
 * - Persistent URL state for shareable filters
 * - Cart integration with floating cart button
 * - Excludes Labour, Transport, and Other categories
 * - Responsive design with mobile-first approach
 * - Dark mode support
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  ShoppingCart,
  Search,
  X,
  Package,
  Grid,
  List,
  ChevronDown,
  SlidersHorizontal,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Product } from '@/types/product';
import ProductCard from '@/components/ProductCard';
import { useCartStore } from '@/store/cart';
import { getProducts, getBrands } from '@/lib/api';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Categories that should be hidden from the public product listing */
const EXCLUDED_CATEGORIES = ['Labour', 'Transport', 'Other'];

// ============================================================================
// COMPONENT
// ============================================================================

export default function ProductsClient() {
  // --------------------------------------------------------------------------
  // URL State Management (Read from URL params on mount)
  // --------------------------------------------------------------------------
  
  const searchParams = useSearchParams();

  /** Search query string for product name/description filtering */
  const [search, setSearch] = useState(searchParams.get('q') || '');
  
  /** Currently selected category filter ('all' means no filter) */
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all',
  );
  
  /**
   * Currently selected brand filter ('all' means no filter)
   * Brand matching is done server-side via the `brand` query param.
   */
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'all');

  /** Minimum price for range filtering */
  const [minPrice, setMinPrice] = useState(() => {
    const min = searchParams.get('minPrice');
    return min ? parseInt(min) : 0;
  });

  /** Maximum price for range filtering */
  const [maxPrice, setMaxPrice] = useState(() => {
    const max = searchParams.get('maxPrice');
    return max ? parseInt(max) : 1000000;
  });

  /** Current sort method for product ordering */
  const [sortBy, setSortBy] = useState<
    'all' | 'featured' | 'price-low' | 'price-high' | 'rating' | 'name'
  >((searchParams.get('sort') as any) || 'all');

  /** Display mode: 'grid' for card layout, 'list' for row layout */
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  /** Toggle to show only products with stock > 0 */
  const [showInStockOnly, setShowInStockOnly] = useState(searchParams.get('inStock') === 'true');

  /** Mobile responsive filter panel visibility */
  const [showFilters, setShowFilters] = useState(false);

  /** Current pagination page number (1-indexed) */
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page');
    return page ? parseInt(page) : 1;
  });

  // --------------------------------------------------------------------------
  // Constants & Store
  // --------------------------------------------------------------------------
  
  /** Number of products to display per page */
  const itemsPerPage = 12;
  
  /** Total items in the user's cart for the floating cart button */
  const cartItemsCount = useCartStore((state) => state.totalItems);

  // --------------------------------------------------------------------------
  // Data Fetching
  // --------------------------------------------------------------------------

  /**
   * Pre-fetch all brands for the filter dropdown
   * This runs in the background and caches brand names for autocomplete
   */
  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => getBrands().catch(() => []),
    staleTime: 30 * 60 * 1000, // 30 minutes cache
    placeholderData: [],
  });

  /**
   * Fetch ALL products (unpaginated) for building filter options
   * This allows us to show accurate category/brand counts and price ranges
   */
  const { data: allProductsData } = useQuery({
    queryKey: ['all-products-for-filters'],
    queryFn: () => getProducts({ limit: 1000 }),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  /**
   * Filter out excluded categories from the full product list
   * This ensures Labour, Transport, and Other categories are never shown
   */
  const allProducts = useMemo(() => {
    const products = (allProductsData?.products || []) as Product[];
    return products.filter((product) => !EXCLUDED_CATEGORIES.includes(product.category));
  }, [allProductsData]);

  // --------------------------------------------------------------------------
  // Filter Options Builders
  // --------------------------------------------------------------------------

  /**
   * Build category filter options with counts
   * Shows all categories except excluded ones with product counts
   */
  const categories = useMemo(() => {
    const categoriesMap = new Map<string, number>();
    allProducts.forEach((p) => {
      if (p.category) {
        categoriesMap.set(p.category, (categoriesMap.get(p.category) || 0) + 1);
      }
    });

    return [
      { value: 'all', label: 'All Products', count: allProducts.length },
      ...Array.from(categoriesMap.entries()).map(([cat, count]) => ({
        value: cat,
        label: cat.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        count,
      })),
    ];
  }, [allProducts]);

  /**
   * Normalize brand names for case-insensitive deduplication
   */
  const normalizeBrand = (value?: string | null) => (value || '').trim().toLowerCase();

  /**
   * Build brand filter options with counts
   * Deduplicates brand names and shows product counts
   */
  const allBrands = useMemo(() => {
    const brandsMap = new Map<string, { value: string; label: string; count: number }>();

    allProducts.forEach((p) => {
      if (p.brand && p.brand.trim() !== '') {
        const key = normalizeBrand(p.brand);
        const current = brandsMap.get(key);
        if (current) current.count += 1;
        else brandsMap.set(key, { value: p.brand, label: p.brand, count: 1 });
      }
    });

    const resolvedBrands = Array.from(brandsMap.values()).sort((a, b) => a.label.localeCompare(b.label));

    return [
      { value: 'all', label: 'All Brands', count: allProducts.length },
      ...resolvedBrands,
    ];
  }, [allProducts]);

  /**
   * Calculate the overall price range from all products
   * Used for initializing the price slider min/max values
   */
  const priceRange = useMemo(() => {
    const prices = allProducts.map((p) => Number(p.price)).filter((p) => !isNaN(p));
    if (prices.length === 0) return { min: 0, max: 1000000 };
    return {
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 1000000),
    };
  }, [allProducts]);

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

  /**
   * Sync min/max price with the actual price range on initial load
   * Prevents the slider from being out of bounds
   */
  useEffect(() => {
    if (priceRange.max > 0) {
      setMaxPrice((prev) => (prev > priceRange.max ? priceRange.max : prev));
      setMinPrice((prev) => (prev < priceRange.min ? priceRange.min : prev));
    }
  }, [priceRange]);

  /**
   * Build API parameters for the main product query
   * Transforms UI state into API-compatible query params
   */
  const getApiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // Search filtering
    if (search.trim()) params.q = search.trim();
    
    // Category filter
    if (selectedCategory !== 'all') params.category = selectedCategory;
    
    // Brand filter - FIXED: properly send brand parameter
    if (selectedBrand && selectedBrand !== 'all' && selectedBrand !== '') {
      params.brand = selectedBrand;
    }

    // Price range filters
    if (minPrice > 0 && !isNaN(minPrice)) params.minPrice = minPrice;
    if (maxPrice < priceRange.max && !isNaN(maxPrice)) params.maxPrice = maxPrice;
    
    // Stock availability filter
    if (showInStockOnly) params.minStock = 1;

    // Sort options mapping
    switch (sortBy) {
      case 'price-low':
        params.sort = 'price';
        params.order = 'asc';
        break;
      case 'price-high':
        params.sort = 'price';
        params.order = 'desc';
        break;
      case 'rating':
        params.sort = 'rating';
        params.order = 'desc';
        break;
      case 'name':
        params.sort = 'name';
        params.order = 'asc';
        break;
      case 'featured':
        params.featured = true;
        break;
      default:
        // 'all' - no additional sorting
        break;
    }

    return params;
  }, [
    search,
    selectedCategory,
    selectedBrand, // ✅ FIX: Include brand in dependencies
    minPrice,
    maxPrice,
    showInStockOnly,
    sortBy,
    currentPage,
    priceRange.max,
  ]);

  /**
   * Main product query with pagination and filtering
   * Uses keepPreviousData for smooth pagination transitions
   */
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', getApiParams],
    queryFn: () => {
      // Debug: Log what's being sent to the API
      console.log('📦 Fetching products with params:', getApiParams);
      return getProducts(getApiParams);
    },
    placeholderData: keepPreviousData,
  });

  /**
   * Filter API products to exclude unwanted categories (double safety)
   * Ensures Labour, Transport, and Other are never displayed
   */
  const apiProducts = useMemo(() => {
    const products = (data?.products || []) as Product[];
    return products.filter((product) => !EXCLUDED_CATEGORIES.includes(product.category));
  }, [data?.products]);

  /**
   * Update URL query params when filters change
   * Enables shareable and bookmarkable filtered states
   */
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedBrand !== 'all' && selectedBrand !== '') params.set('brand', selectedBrand);
    if (search) params.set('q', search);
    if (minPrice > priceRange.min && !isNaN(minPrice)) params.set('minPrice', minPrice.toString());
    if (maxPrice < priceRange.max && !isNaN(maxPrice)) params.set('maxPrice', maxPrice.toString());
    if (sortBy !== 'all') params.set('sort', sortBy);
    if (showInStockOnly) params.set('inStock', 'true');
    if (currentPage > 1) params.set('page', currentPage.toString());

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [
    selectedCategory,
    selectedBrand,
    search,
    minPrice,
    maxPrice,
    sortBy,
    showInStockOnly,
    currentPage,
    priceRange.min,
    priceRange.max,
  ]);

  // --------------------------------------------------------------------------
  // Helper Functions
  // --------------------------------------------------------------------------

  /**
   * Format price in Kenyan Shillings (KES)
   * Removes decimal places for cleaner display
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace('KSh', 'KSh');
  };

  /**
   * Count active filters for the clear button badge
   */
  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0) +
    (minPrice > priceRange.min || maxPrice < priceRange.max ? 1 : 0) +
    (showInStockOnly ? 1 : 0) +
    (search ? 1 : 0);

  /**
   * Reset all filters to their default states
   * Also resets pagination to page 1
   */
  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
    setShowInStockOnly(false);
    setSearch('');
    setCurrentPage(1);
  };

  /**
   * Get pagination info from API response
   */
  const apiPagination = data?.pagination as
    | {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
      }
    | undefined;

  /**
   * Check if we have enough products to fill the grid
   * Used to determine if "Next" page should be active
   */
  const filteredProducts = apiProducts;
  const expectedPerPage = itemsPerPage;
  const hasMorePages = apiPagination?.hasNext === true && filteredProducts.length === expectedPerPage;

  // --------------------------------------------------------------------------
  // Pagination Controls
  // --------------------------------------------------------------------------

  /**
   * Navigate to a specific page
   * Scrolls to top smoothly for better UX
   */
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Navigate to the next page
   * Only works if there are more pages available
   */
  const handleNextPage = () => {
    if (hasMorePages) {
      setCurrentPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Navigate to the previous page
   * Only works if we're not on page 1
   */
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Generate pagination range with ellipsis for large page counts
   * Shows current page, neighbors, and first/last pages
   */
  const getPaginationRange = () => {
    const totalPages = apiPagination?.pages || 1;
    const current = currentPage;
    const delta = 2; // Number of pages to show on each side of current
    const range = [];
    
    // Add pages between 2 and current - delta
    for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
      range.push(i);
    }
    
    // Add ellipsis for gaps
    if (current - delta > 2) {
      range.unshift('...');
    }
    if (current + delta < totalPages - 1) {
      range.push('...');
    }
    
    // Add first and last pages
    range.unshift(1);
    if (totalPages !== 1) range.push(totalPages);
    
    return range;
  };

  const paginationRange = getPaginationRange();

  // --------------------------------------------------------------------------
  // Loading & Error States
  // --------------------------------------------------------------------------

  /**
   * Loading skeleton with animated placeholders
   * Shown while initial data is being fetched
   */
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-8 md:pt-12 lg:pt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Error state with retry button
   * Shown when the product fetch fails
   */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="text-center p-8 max-w-md">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to load products</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please check your connection and try again</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Main Render
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-8 md:pt-12 lg:pt-16">
        
        {/* ====================================================================
          FILTERS & SEARCH HEADER
        ==================================================================== */}
        <div className="mb-6 space-y-3 lg:space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // Reset pagination on search
                }}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-end xl:flex-wrap">
              {/* Filter Chips - Category, Brand, Price, Stock, Clear */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Filters:</span>

                {/* Category Filter Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium hover:border-blue-500 transition-colors">
                    {selectedCategory === 'all'
                      ? 'All Categories'
                      : categories.find((c) => c.value === selectedCategory)?.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30">
                    <div className="max-h-64 overflow-y-auto p-1">
                      {categories.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => {
                            setSelectedCategory(cat.value);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                            selectedCategory === cat.value
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
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

                {/* Brand Filter Dropdown - FIXED */}
                <div className="relative group">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium hover:border-blue-500 transition-colors">
                    {selectedBrand === 'all' ? 'All Brands' : selectedBrand.length > 20 ? selectedBrand.slice(0, 18) + '...' : selectedBrand}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30">
                    <div className="max-h-64 overflow-y-auto p-1">
                      {allBrands.map((brand) => (
                        <button
                          key={brand.value}
                          onClick={() => {
                            setSelectedBrand(brand.value);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                            selectedBrand === brand.value
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="truncate">{brand.label}</span>
                            <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">({brand.count})</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price Range Filter Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium hover:border-blue-500 transition-colors">
                    Price: {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Min: {formatPrice(minPrice)}</span>
                          <span>Max: {formatPrice(maxPrice)}</span>
                        </div>
                        <div className="relative h-2 bg-gray-200 rounded-full">
                          <div
                            className="absolute h-2 bg-blue-500 rounded-full"
                            style={{
                              left: `${((minPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                              right: `${100 - ((maxPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                            }}
                          />
                        </div>
                        <input
                          type="range"
                          min={priceRange.min}
                          max={priceRange.max}
                          value={minPrice}
                          onChange={(e) => {
                            const newMin = parseInt(e.target.value);
                            if (newMin <= maxPrice) setMinPrice(newMin);
                            setCurrentPage(1);
                          }}
                          className="w-full mt-2 accent-blue-600"
                          aria-label="Minimum price"
                        />
                        <input
                          type="range"
                          min={priceRange.min}
                          max={priceRange.max}
                          value={maxPrice}
                          onChange={(e) => {
                            const newMax = parseInt(e.target.value);
                            if (newMax >= minPrice) setMaxPrice(newMax);
                            setCurrentPage(1);
                          }}
                          className="w-full accent-blue-600"
                          aria-label="Maximum price"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* In-Stock Only Toggle */}
                <button
                  onClick={() => {
                    setShowInStockOnly(!showInStockOnly);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    showInStockOnly
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 border-green-300'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                  aria-label="Show only in-stock products"
                >
                  {showInStockOnly && <Check className="w-3 h-3" />}
                  In Stock Only
                </button>

                {/* Clear All Filters Button */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                    aria-label="Clear all filters"
                  >
                    <X className="w-3 h-3" />
                    Clear ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Sort and View Controls */}
              <div className="flex gap-2 flex-wrap">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="appearance-none px-4 py-3 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    {[
                      { value: 'all', label: 'All Products' },
                      { value: 'featured', label: 'Featured' },
                      { value: 'price-low', label: 'Price: Low to High' },
                      { value: 'price-high', label: 'Price: High to Low' },
                      { value: 'rating', label: 'Highest Rated' },
                      { value: 'name', label: 'Name: A-Z' },
                    ].map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                {/* View Mode Toggle (Desktop) */}
                <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'
                    }`}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
          RESULTS COUNT
        ==================================================================== */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {filteredProducts.length}
            </span>{' '}
            products
            {apiPagination?.total && apiPagination.total > 0 && (
              <span className="text-gray-400"> (from {apiPagination.total} total)</span>
            )}
          </p>
        </div>

        {/* ====================================================================
          PRODUCT GRID / LIST VIEW
        ==================================================================== */}
        {filteredProducts.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View - Product Cards only (no description)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          // List View - ProductCard handles description internally with RichTextRenderer
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} variant="list" />
            ))}
          </div>
        )}

        {/* ====================================================================
          PAGINATION
        ==================================================================== */}
        {apiPagination && apiPagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {/* Previous Page Button */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Number Buttons */}
            <div className="flex flex-wrap justify-center gap-1">
              {paginationRange.map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof page === 'number' && goToPage(page)}
                  disabled={page === '...'}
                  className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-md'
                      : page === '...'
                      ? 'bg-transparent cursor-default'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  aria-label={`Go to page ${page}`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Page Button */}
            <button
              onClick={handleNextPage}
              disabled={!hasMorePages}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ====================================================================
          FLOATING CART BUTTON
        ==================================================================== */}
        {cartItemsCount > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Link
              href="/cart"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
              aria-label={`View cart with ${cartItemsCount} items`}
            >
              <ShoppingCart className="w-4 h-4" />
              Cart ({cartItemsCount})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}