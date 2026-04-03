// src/app/categories/page.tsx

'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getProducts, getCategories } from '@/lib/api'
import { Product } from '@/types/product'
import { ArrowRight, Sparkles, Package, AlertCircle, TrendingUp, Shield, Zap, Droplets, Sun, Battery, Cpu } from 'lucide-react'
import { useMemo } from 'react'
import Image from 'next/image'

// Types
interface CategoryMetadata {
  icon: string;
  iconComponent: any;
  color: string;
  gradient: string;
  displayName: string;
  description: string;
  image: string;
  features: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconComponent: any;
  color: string;
  gradient: string;
  count: number;
  image: string;
  features: string[];
}

interface ApiCategory {
  slug?: string;
  name?: string;
  [key: string]: any;
}

// Default image for all categories
const DEFAULT_CATEGORY_IMAGE = "https://res.cloudinary.com/duxnsu61a/image/upload/v1775035077/dc2_rbbsin.jpg"

// Category metadata with images
const categoryMetadata: Record<string, CategoryMetadata> = {
  'water-pumps': {
    icon: '💧',
    iconComponent: Droplets,
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-600 to-cyan-600',
    displayName: 'Water Pumps',
    description: 'High-efficiency pumps for residential, commercial, and agricultural use',
    image: DEFAULT_CATEGORY_IMAGE,
    features: ['Energy Efficient', 'Durable Build', '5-Year Warranty', 'Low Maintenance']
  },
  'generators': {
    icon: '⚡',
    iconComponent: Zap,
    color: 'from-yellow-500 to-orange-500',
    gradient: 'bg-gradient-to-br from-yellow-600 to-orange-600',
    displayName: 'Generators',
    description: 'Reliable power generators for backup and continuous operation',
    image: DEFAULT_CATEGORY_IMAGE,
    features: ['Quiet Operation', 'Fuel Efficient', 'Auto Start', 'Digital Display']
  },
  'solar-panels': {
    icon: '☀️',
    iconComponent: Sun,
    color: 'from-green-500 to-emerald-500',
    gradient: 'bg-gradient-to-br from-green-600 to-emerald-600',
    displayName: 'Solar Panels',
    description: 'High-efficiency solar panels for clean, renewable energy',
    image: DEFAULT_CATEGORY_IMAGE,
    features: ['25-Year Warranty', 'High Efficiency', 'Weather Resistant', 'Monocrystalline']
  },
  'inverters': {
    icon: '🔄',
    iconComponent: TrendingUp,
    color: 'from-purple-500 to-violet-500',
    gradient: 'bg-gradient-to-br from-purple-600 to-violet-600',
    displayName: 'Inverters',
    description: 'Advanced inverters for solar systems and backup power',
    image: DEFAULT_CATEGORY_IMAGE,
    features: ['Pure Sine Wave', 'Smart Display', 'Remote Monitoring', 'High Efficiency']
  },
  'batteries': {
    icon: '🔋',
    iconComponent: Battery,
    color: 'from-indigo-500 to-purple-500',
    gradient: 'bg-gradient-to-br from-indigo-600 to-purple-600',
    displayName: 'Batteries',
    description: 'Deep-cycle batteries for energy storage solutions',
    image: DEFAULT_CATEGORY_IMAGE,
    features: ['Long Life Cycle', 'Deep Discharge', 'Maintenance Free', 'Fast Charging']
  },
  'controllers': {
    icon: '⚙️',
    iconComponent: Cpu,
    color: 'from-pink-500 to-rose-500',
    gradient: 'bg-gradient-to-br from-pink-600 to-rose-600',
    displayName: 'Controllers',
    description: 'Smart charge controllers and system management devices',
    image: DEFAULT_CATEGORY_IMAGE,
    features: ['MPPT Technology', 'LCD Display', 'Overload Protection', 'Temperature Comp']
  }
}

export default function CategoriesPage() {
  // Fetch products to get category counts
  const { data: allProductsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['categories-products'],
    queryFn: () => getProducts({ limit: 1000 }),
    staleTime: 30 * 60 * 1000
  })

  // Fetch categories separately if your API has a categories endpoint
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories-list'],
    queryFn: () => getCategories().catch(() => null),
    staleTime: 30 * 60 * 1000,
    retry: false
  })

  const categories: Category[] = useMemo(() => {
    if (!allProductsData?.products) return []

    // Count products per category
    const catMap = new Map<string, number>()
    allProductsData.products.forEach((product: Product) => {
      const category = product.category
      catMap.set(category, (catMap.get(category) || 0) + 1)
    })

    // Use categories from API if available, otherwise use mapped categories
    if (categoriesData && Array.isArray(categoriesData) && categoriesData.length > 0) {
      return categoriesData
        .filter((cat: ApiCategory) => {
          const slug = cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-') || ''
          return catMap.has(slug)
        })
        .map((cat: ApiCategory) => {
          const slug = cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-') || ''
          const metadata = categoryMetadata[slug] || {
            icon: '📦',
            iconComponent: Package,
            color: 'from-gray-500 to-gray-700',
            gradient: 'bg-gradient-to-br from-gray-600 to-gray-700',
            displayName: cat.name || slug,
            description: `Premium ${cat.name || slug} products for your needs`,
            image: DEFAULT_CATEGORY_IMAGE,
            features: ['Premium Quality', 'Best Price', 'Fast Shipping', 'Warranty Included']
          }
          
          return {
            id: slug,
            name: metadata.displayName,
            description: metadata.description,
            icon: metadata.icon,
            iconComponent: metadata.iconComponent,
            color: metadata.color,
            gradient: metadata.gradient,
            count: catMap.get(slug) || 0,
            image: metadata.image,
            features: metadata.features
          }
        })
        .sort((a: Category, b: Category) => b.count - a.count)
    }

    // Fallback: use mapped categories with counts
    return Array.from(catMap.entries())
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .map(([slug, count]: [string, number]) => {
        const metadata = categoryMetadata[slug] || {
          icon: '📦',
          iconComponent: Package,
          color: 'from-gray-500 to-gray-700',
          gradient: 'bg-gradient-to-br from-gray-600 to-gray-700',
          displayName: slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          description: `Premium ${slug.replace(/-/g, ' ')} products for your needs`,
          image: DEFAULT_CATEGORY_IMAGE,
          features: ['Premium Quality', 'Best Price', 'Fast Shipping', 'Warranty Included']
        }
        
        return {
          id: slug,
          name: metadata.displayName,
          description: metadata.description,
          icon: metadata.icon,
          iconComponent: metadata.iconComponent,
          color: metadata.color,
          gradient: metadata.gradient,
          count,
          image: metadata.image,
          features: metadata.features
        }
      })
  }, [allProductsData, categoriesData])

  const isLoading = productsLoading || categoriesLoading
  const error = productsError

  // Calculate stats
  const stats = useMemo(() => {
    const products = allProductsData?.products || []
    const totalProducts = allProductsData?.pagination?.total || products.length
    const totalCategories = categories.length
    
    return {
      totalProducts,
      totalCategories,
      avgRating: products.length > 0 
        ? (products.reduce((sum: number, p: Product) => sum + p.rating, 0) / products.length).toFixed(1)
        : "4.8"
    }
  }, [allProductsData, categories])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Failed to load categories</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            There was an error loading the categories. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center mb-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Loading categories...</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-3xl overflow-hidden">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                  <div className="p-6">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto mb-4" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-3" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No categories found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            There are no products available at the moment. Check back later!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105"
          >
            Browse All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
    
      <section className="relative pt-24 pb-10 lg:pt-28 lg:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
  
  {/* Animated Background */}
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/15 to-indigo-500/20 animate-pulse" />
  <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
  <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
  
  <div className="relative z-10 max-w-5xl mx-auto text-center">
    
    <h1 className="text-2xl md:text-4xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2 drop-shadow-2xl animate-gradient">
      Shop by Category
    </h1>

  </div>
</section>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const IconComponent = category.iconComponent
            return (
              <Link 
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group relative block animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-4 hover:scale-[1.02] border border-white/50 dark:border-gray-700/50 hover:border-blue-500/50 dark:hover:border-blue-500/50">
                  
                  {/* Category Image */}
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className={`absolute inset-0 ${category.gradient} opacity-60 group-hover:opacity-50 transition-opacity duration-500`} />
                    
                    {/* Icon Overlay */}
                    <div className={`absolute -bottom-8 right-4 w-24 h-24 ${category.gradient} rounded-2xl flex items-center justify-center shadow-2xl transform rotate-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
                      {IconComponent && <IconComponent className="w-10 h-10 text-white drop-shadow-lg" />}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 pt-10">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                      {category.name}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-2">
                      {category.description}
                    </p>

                    {/* Features Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {category.features.slice(0, 3).map((feature, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-gray-600 dark:text-gray-400">
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {category.count} Products
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform duration-300">
                        <span className="text-sm font-medium">Browse</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24 p-8 lg:p-12 bg-white/50 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 dark:border-gray-700/40">
          <div className="text-center group cursor-pointer">
            <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 mb-2 group-hover:scale-110 transition-transform">
              {stats.totalProducts}+
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Products Available
            </div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 mb-2 group-hover:scale-110 transition-transform">
              {stats.totalCategories}
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Categories
            </div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-2 group-hover:scale-110 transition-transform">
              {stats.avgRating}
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Average Rating
            </div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 mb-2 group-hover:scale-110 transition-transform">
              24/7
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Support
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  )
}