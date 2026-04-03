// src/components/ProductCard.tsx
'use client'

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, Heart, Eye, Check } from 'lucide-react';
import { Product } from '../types/product';
import { useCartStore } from '../store/cart';
import { cn, formatCurrency } from '../lib/utils';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'list';
}

export default function ProductCard({ product, variant = 'grid' }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const itemQty = useCartStore((state) => state.getItemQty(product._id || ''));
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);

  const handleAddToCart = () => {
    addItem(product);
    setShowAddedFeedback(true);
    setTimeout(() => setShowAddedFeedback(false), 1500);
  };

  const isList = variant === 'list';

  return (
    <div
      className={cn(
        'group relative transition-all duration-500',
        isList ? 'w-full' : 'h-full'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          'relative bg-white dark:bg-gray-800/90 backdrop-blur-sm transition-all duration-500 border overflow-hidden',
          isList
            ? 'flex items-stretch rounded-2xl hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/5 hover:-translate-y-1'
            : 'rounded-2xl hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/5 hover:-translate-y-2',
          isHovered
            ? 'border-blue-200 dark:border-blue-500/50 shadow-xl'
            : 'border-gray-200/50 dark:border-gray-700/50 shadow-md',
          'hover:bg-white dark:hover:bg-gray-800'
        )}
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex gap-2">
          {product.featured && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg animate-pulse">
              Featured
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-lg">
              Low Stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-lg">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-300 hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
          aria-label="Add to wishlist"
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* Image Section */}
        <div
          className={cn(
            'relative overflow-hidden',
            isList
              ? 'w-36 h-36 sm:w-44 sm:h-44 flex-shrink-0 m-3 rounded-xl'
              : 'w-full pt-[100%] rounded-t-2xl'
          )}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-shimmer" />
          )}
          <Image
            src={product.images[0] || '/placeholder-solar.jpg'}
            alt={product.name}
            fill
            className={cn(
              'object-cover transition-all duration-700',
              isHovered && !isList && 'scale-110',
              imageLoaded ? 'opacity-100' : 'opacity-0',
              isList && 'rounded-xl'
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isList && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent rounded-xl" />
          )}
        </div>

        {/* Content Section */}
        <div
          className={cn(
            'flex-1',
            isList ? 'p-4 sm:p-5' : 'p-5 space-y-3'
          )}
        >
          {/* Rating & Category */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-3.5 h-3.5 transition-colors',
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">
                ({product.rating})
              </span>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
              {product.category?.replace(/-/g, ' ')}
            </span>
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`}>
            <h3
              className={cn(
                'font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2',
                isList ? 'text-base sm:text-lg' : 'text-lg'
              )}
            >
              {product.name}
            </h3>
          </Link>

          {/* Description (only for list view) */}
          {isList && product.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Price & Stock */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <span className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {formatCurrency(Number(product.price))}
              </span>
              {product.stock > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                </span>
              )}
            </div>

            {/* Stock Indicator (grid view) */}
            {!isList && product.stock > 0 && product.stock <= 10 && (
              <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${(product.stock / 20) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Action Buttons - Always Visible */}
          <div className={cn(
            'flex gap-2 pt-3',
            isList ? 'flex-row' : 'flex-col sm:flex-row'
          )}>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 font-semibold transition-all duration-300',
                isList
                  ? 'px-4 py-2.5 text-sm rounded-xl'
                  : 'px-4 py-3 text-sm rounded-xl',
                product.stock > 0
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              )}
            >
              {showAddedFeedback ? (
                <>
                  <Check className="w-4 h-4 animate-bounce" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {itemQty > 0
                      ? `Added (${itemQty})`
                      : product.stock > 0
                      ? 'Add to Cart'
                      : 'Out of Stock'}
                  </span>
                </>
              )}
            </button>

            <Link
              href={`/products/${product.slug}`}
              className={cn(
                'flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
                isList
                  ? 'px-4 py-2.5 text-sm rounded-xl'
                  : 'px-4 py-3 text-sm rounded-xl',
                'border border-gray-200 dark:border-gray-600'
              )}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View</span>
            </Link>
          </div>
        </div>

        {/* Hover Overlay Effect */}
        <div
          className={cn(
            'absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl',
            isHovered
              ? 'opacity-100 ring-2 ring-blue-500/20 dark:ring-blue-400/30'
              : 'opacity-0'
          )}
        />
      </div>
    </div>
  );
}