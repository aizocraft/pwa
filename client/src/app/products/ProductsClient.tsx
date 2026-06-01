'use client';

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

// Categories to exclude from display
const EXCLUDED_CATEGORIES = ['Labour', 'Transport', 'Other'];

export default function ProductsClient() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all',
  );
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'all');

  const [minPrice, setMinPrice] = useState(() => {
    const min = searchParams.get('minPrice');
    return min ? parseInt(min) : 0;
  });

  const [maxPrice, setMaxPrice] = useState(() => {
    const max = searchParams.get('maxPrice');
    return max ? parseInt(max) : 1000000;
  });

  const [sortBy, setSortBy] = useState<
    'all' | 'featured' | 'price-low' | 'price-high' | 'rating' | 'name'
  >((searchParams.get('sort') as any) || 'all');

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showInStockOnly, setShowInStockOnly] = useState(searchParams.get('inStock') === 'true');

  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page');
    return page ? parseInt(page) : 1;
  });

  const itemsPerPage = 12;
  const cartItemsCount = useCartStore((state) => state.totalItems);

  // Fetch brands separately (just for pre-fetching, but we'll use all products for filter options)
  useQuery({
    queryKey: ['brands'],
    queryFn: () => getBrands().catch(() => []),
    staleTime: 30 * 60 * 1000,
    placeholderData: [],
  });

  // Fetch all products for filter options (client-side filtering of excluded categories)
  const { data: allProductsData } = useQuery({
    queryKey: ['all-products-for-filters'],
    queryFn: () => getProducts({ limit: 1000 }),
    staleTime: 5 * 60 * 1000,
  });

  // Filter out excluded categories from the full product list
  const allProducts = useMemo(() => {
    const products = (allProductsData?.products || []) as Product[];
    return products.filter((product) => !EXCLUDED_CATEGORIES.includes(product.category));
  }, [allProductsData]);

  // Build categories list from filtered allProducts
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

  const normalizeBrand = (value?: string | null) => (value || '').trim().toLowerCase();

  // Build brands list from filtered allProducts
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

  const priceRange = useMemo(() => {
    const prices = allProducts.map((p) => Number(p.price)).filter((p) => !isNaN(p));
    if (prices.length === 0) return { min: 0, max: 1000000 };
    return {
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 1000000),
    };
  }, [allProducts]);

  // Sync min/max price with range on initial load
  useEffect(() => {
    if (priceRange.max > 0) {
      setMaxPrice((prev) => (prev > priceRange.max ? priceRange.max : prev));
      setMinPrice((prev) => (prev < priceRange.min ? priceRange.min : prev));
    }
  }, [priceRange]);

  // Build API params for the main product query (excluding categories are filtered client-side as well for safety)
  const getApiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (search.trim()) params.q = search.trim();
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (selectedBrand !== 'all' && selectedBrand !== '') params.brand = selectedBrand;

    if (minPrice > 0 && !isNaN(minPrice)) params.minPrice = minPrice;
    if (maxPrice < priceRange.max && !isNaN(maxPrice)) params.maxPrice = maxPrice;
    if (showInStockOnly) params.minStock = 1;

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
    }

    return params;
  }, [
    search,
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    showInStockOnly,
    sortBy,
    currentPage,
    priceRange.max,
  ]);

  // Main query for paginated products
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', getApiParams],
    queryFn: () => getProducts(getApiParams),
    placeholderData: keepPreviousData,
  });

  // Filter API products to exclude unwanted categories (double safety)
  const apiProducts = useMemo(() => {
    const products = (data?.products || []) as Product[];
    return products.filter((product) => !EXCLUDED_CATEGORIES.includes(product.category));
  }, [data?.products]);

  // Update URL params when filters change
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace('KSh', 'KSh');
  };

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0) +
    (minPrice > priceRange.min || maxPrice < priceRange.max ? 1 : 0) +
    (showInStockOnly ? 1 : 0) +
    (search ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
    setShowInStockOnly(false);
    setSearch('');
    setCurrentPage(1);
  };

  // Get the original pagination info from API
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


  // Check if we have enough products to fill the grid after excluding categories
  const filteredProducts = apiProducts;
  const expectedPerPage = itemsPerPage;
  const isLastPagePotentiallyShort = filteredProducts.length < expectedPerPage && apiPagination?.hasNext === false;

  // Use the API pagination but note that the actual total might be lower due to excluded categories
  // We'll adjust total count by estimating based on the ratio of filtered to total products from first page?
  // Not perfect, but gives a better user experience.

  // For a more accurate count, we fetch total from API but we don't know how many excluded categories exist.
  // As a UX improvement, we'll rely on API total and inform users if categories are excluded.
  // But to avoid gaps, we'll just show the products that are returned after filtering.

  const totalProductsDisplayed = filteredProducts.length;
  const hasMorePages = apiPagination?.hasNext === true && totalProductsDisplayed === expectedPerPage;

  // Hand-crafted pagination controls that work with our filtered results
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    if (hasMorePages) {
      setCurrentPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers for pagination UI
  const getPaginationRange = () => {
    const totalPages = apiPagination?.pages || 1;
    const current = currentPage;
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
      range.push(i);
    }
    if (current - delta > 2) {
      range.unshift('...');
    }
    if (current + delta < totalPages - 1) {
      range.push('...');
    }
    range.unshift(1);
    if (totalPages !== 1) range.push(totalPages);
    return range;
  };

  const paginationRange = getPaginationRange();

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load products</h2>
          <p className="text-gray-600 mb-6">Please check your connection and try again</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-8 md:pt-12 lg:pt-16">
        {/* Header and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="flex gap-2">
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

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter chips */}
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

            {/* Brand Filter Dropdown */}
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

            {/* Price Filter Dropdown */}
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
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* In Stock Toggle */}
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
            >
              {showInStockOnly && <Check className="w-3 h-3" />}
              In Stock Only
            </button>

            {/* Clear Filters */}
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
        </div>

        {/* Results count */}
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

        {/* Product Grid / List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} variant="list" />
            ))}
          </div>
        )}

        {/* Pagination */}
        {apiPagination && apiPagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

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
                >
                  {page}
                </button>
              ))}
            </div>

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
  );
}