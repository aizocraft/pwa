'use client'

import ProductCard from './ProductCard'
import { Product } from '../types/product'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface RelatedProductsProps {
  products: Product[]
  title?: string
}

export default function RelatedProducts({ products, title = 'You may also like' }: RelatedProductsProps) {
  return (
    <div className="mt-20">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory scroll-smooth">
          {products.map((product, index) => (
            <div key={product._id} className="flex-shrink-0 w-80 snap-center">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Gradient overlays for scroll indication */}
        <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent pointer-events-none dark:from-gray-900" />

        {/* Scroll buttons */}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 z-20 border">
          <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 z-20 border">
          <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    </div>
  )
}
