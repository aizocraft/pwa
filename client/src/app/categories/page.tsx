'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getProducts, getCategories } from '@/lib/api'
import { Product } from '@/types/product'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, Sparkles, Package, AlertCircle, TrendingUp, Shield, 
  Zap, Droplets, Sun, Battery, Cpu, Home, Filter, Grid, 
  ChevronRight, Star, Truck, Clock, Award, CircleDot
} from 'lucide-react'
import { useMemo, useState } from 'react'
import Image from 'next/image'

// Types
interface CategoryMetadata {
  iconComponent: any;
  gradient: string;
  bgGradient: string;
  displayName: string;
  description: string;
  shortDesc: string;
  image: string;
  color: string;
  features: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  shortDesc: string;
  iconComponent: any;
  gradient: string;
  bgGradient: string;
  count: number;
  image: string;
  color: string;
  features: string[];
}

// Default image
const DEFAULT_CATEGORY_IMAGE = "https://res.cloudinary.com/duxnsu61a/image/upload/v1775035077/dc2_rbbsin.jpg"

// Category metadata with proper icons and gradients
const categoryMetadata: Record<string, CategoryMetadata> = {
  'water-pumps': {
    iconComponent: Droplets,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-600/20 to-cyan-600/20',
    displayName: 'Water Pumps',
    description: 'High-efficiency pumps for residential, commercial, and agricultural use',
    shortDesc: 'Premium water pumping solutions',
    image: DEFAULT_CATEGORY_IMAGE,
    color: 'blue',
    features: ['Energy Efficient', 'Durable Build', '5-Year Warranty', 'Low Maintenance']
  },
  'generators': {
    iconComponent: Zap,
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-yellow-600/20 to-orange-600/20',
    displayName: 'Generators',
    description: 'Reliable power generators for backup and continuous operation',
    shortDesc: 'Uninterrupted power supply',
    image: DEFAULT_CATEGORY_IMAGE,
    color: 'yellow',
    features: ['Quiet Operation', 'Fuel Efficient', 'Auto Start', 'Digital Display']
  },
  'solar-panels': {
    iconComponent: Sun,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-600/20 to-emerald-600/20',
    displayName: 'Solar Panels',
    description: 'High-efficiency solar panels for clean, renewable energy',
    shortDesc: 'Clean energy solutions',
    image: DEFAULT_CATEGORY_IMAGE,
    color: 'green',
    features: ['25-Year Warranty', 'High Efficiency', 'Weather Resistant', 'Monocrystalline']
  },
  'inverters': {
    iconComponent: TrendingUp,
    gradient: 'from-purple-500 to-violet-500',
    bgGradient: 'from-purple-600/20 to-violet-600/20',
    displayName: 'Inverters',
    description: 'Advanced inverters for solar systems and backup power',
    shortDesc: 'Smart power conversion',
    image: DEFAULT_CATEGORY_IMAGE,
    color: 'purple',
    features: ['Pure Sine Wave', 'Smart Display', 'Remote Monitoring', 'High Efficiency']
  },
  'batteries': {
    iconComponent: Battery,
    gradient: 'from-indigo-500 to-purple-500',
    bgGradient: 'from-indigo-600/20 to-purple-600/20',
    displayName: 'Batteries',
    description: 'Deep-cycle batteries for energy storage solutions',
    shortDesc: 'Reliable energy storage',
    image: DEFAULT_CATEGORY_IMAGE,
    color: 'indigo',
    features: ['Long Life Cycle', 'Deep Discharge', 'Maintenance Free', 'Fast Charging']
  },
  'controllers': {
    iconComponent: Cpu,
    gradient: 'from-pink-500 to-rose-500',
    bgGradient: 'from-pink-600/20 to-rose-600/20',
    displayName: 'Controllers',
    description: 'Smart charge controllers and system management devices',
    shortDesc: 'Intelligent system control',
    image: DEFAULT_CATEGORY_IMAGE,
    color: 'pink',
    features: ['MPPT Technology', 'LCD Display', 'Overload Protection', 'Temperature Comp']
  }
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const statVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
}

export default function CategoriesPage() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const { data: allProductsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['categories-products'],
    queryFn: () => getProducts({ limit: 1000 }),
    staleTime: 30 * 60 * 1000
  })

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories-list'],
    queryFn: () => getCategories().catch(() => null),
    staleTime: 30 * 60 * 1000,
    retry: false
  })

  const categories: Category[] = useMemo(() => {
    if (!allProductsData?.products) return []

    const catMap = new Map<string, number>()
    allProductsData.products.forEach((product: Product) => {
      const category = product.category
      if (category) {
        catMap.set(category, (catMap.get(category) || 0) + 1)
      }
    })

    if (categoriesData && Array.isArray(categoriesData) && categoriesData.length > 0) {
      return categoriesData
        .filter((cat: any) => {
          const slug = cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-') || ''
          return catMap.has(slug)
        })
        .map((cat: any) => {
          const slug = cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-') || ''
          const metadata = categoryMetadata[slug] || {
            iconComponent: Package,
            gradient: 'from-gray-500 to-gray-600',
            bgGradient: 'from-gray-600/20 to-gray-700/20',
            displayName: cat.name || slug,
            description: `Premium ${cat.name || slug} products`,
            shortDesc: `Quality ${cat.name || slug} products`,
            image: DEFAULT_CATEGORY_IMAGE,
            color: 'gray',
            features: ['Premium Quality', 'Best Price', 'Fast Shipping', 'Warranty']
          }
          
          return {
            id: slug,
            name: metadata.displayName,
            description: metadata.description,
            shortDesc: metadata.shortDesc,
            iconComponent: metadata.iconComponent,
            gradient: metadata.gradient,
            bgGradient: metadata.bgGradient,
            count: catMap.get(slug) || 0,
            image: metadata.image,
            color: metadata.color,
            features: metadata.features
          }
        })
        .sort((a, b) => b.count - a.count)
    }

    return Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([slug, count]) => {
        const metadata = categoryMetadata[slug] || {
          iconComponent: Package,
          gradient: 'from-gray-500 to-gray-600',
          bgGradient: 'from-gray-600/20 to-gray-700/20',
          displayName: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `Premium ${slug.replace(/-/g, ' ')} products`,
          shortDesc: `Quality ${slug.replace(/-/g, ' ')} products`,
          image: DEFAULT_CATEGORY_IMAGE,
          color: 'gray',
          features: ['Premium Quality', 'Best Price', 'Fast Shipping', 'Warranty']
        }
        
        return {
          id: slug,
          name: metadata.displayName,
          description: metadata.description,
          shortDesc: metadata.shortDesc,
          iconComponent: metadata.iconComponent,
          gradient: metadata.gradient,
          bgGradient: metadata.bgGradient,
          count,
          image: metadata.image,
          color: metadata.color,
          features: metadata.features
        }
      })
  }, [allProductsData, categoriesData])

  const isLoading = productsLoading || categoriesLoading
  const error = productsError

  const stats = useMemo(() => {
    const products = allProductsData?.products || []
    const totalProducts = allProductsData?.pagination?.total || products.length
    const totalCategories = categories.length
    
    return {
      totalProducts,
      totalCategories,
      avgRating: products.length > 0 
        ? (products.reduce((sum: number, p: Product) => sum + (p.rating || 0), 0) / products.length).toFixed(1)
        : "4.8"
    }
  }, [allProductsData, categories])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to load categories</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Please try again later</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
          >
            Refresh Page
          </button>
        </motion.div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-block">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700" />
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No categories found</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">No products available at the moment</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
          >
            Browse Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section - Compact */}
      <section className="relative pt-12 pb-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Shop by Category</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Browse Categories
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Find exactly what you need from our curated collection
          </motion.p>
        </div>
      </section>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {categories.map((category, index) => {
            const IconComponent = category.iconComponent
            const isHovered = hoveredCategory === category.id
            
            return (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link href={`/products?category=${category.id}`} className="block h-full">
                  <div className="relative h-full bg-white dark:bg-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-lg transition-all duration-300">
                    
                    {/* Image Section */}
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className={`object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${category.bgGradient} opacity-60`} />
                      
                      {/* Icon Badge */}
                      <div className={`absolute -bottom-5 right-4 w-12 h-12 rounded-xl bg-gradient-to-r ${category.gradient} flex items-center justify-center shadow-lg transition-all duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 pt-7">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-1">
                          {category.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Package className="w-3 h-3" />
                          <span>{category.count}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {category.shortDesc}
                      </p>

                      {/* Features Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {category.features.slice(0, 2).map((feature, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                            {feature}
                          </span>
                        ))}
                        {category.features.length > 2 && (
                          <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                            +{category.features.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Browse Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                          <span>Browse</span>
                          <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          <span>4.8</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Stats Row - Compact */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 p-5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-800/50"
        >
          {[
            { label: 'Products', value: `${stats.totalProducts}+`, color: 'emerald' },
            { label: 'Categories', value: stats.totalCategories, color: 'blue' },
            { label: 'Avg Rating', value: stats.avgRating, color: 'purple' },
            { label: 'Support', value: '24/7', color: 'amber' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={statVariants}
              whileHover={{ scale: 1.02 }}
              className="text-center"
            >
              <div className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}