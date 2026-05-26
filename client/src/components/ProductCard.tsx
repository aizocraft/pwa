// src/components/ProductCard.tsx
'use client'

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Eye, Package, AlertCircle } from 'lucide-react';
import { Product } from '../types/product';
import { useCartStore } from '../store/cart';
import { cn, formatCurrency } from '../lib/utils';
import { useState } from 'react';
import { getImageUrl } from '../lib/api';

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setShowAddedFeedback(true);
    setTimeout(() => setShowAddedFeedback(false), 800);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/${product.slug}`;
  };

  const isList = variant === 'list';
  const hasDiscount = typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100) : 0;

  return (
    <Link href={`/${product.slug}`} className="block">
      <div
        className={cn(
          'group relative transition-all duration-300 cursor-pointer',
          isList ? 'w-full' : 'h-full'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={cn(
            'relative bg-white dark:bg-gray-900 transition-all duration-300 overflow-hidden',
            isList
              ? 'flex items-stretch rounded-2xl'
              : 'rounded-2xl',
            isHovered
              ? 'shadow-xl'
              : 'shadow-md',
            'hover:shadow-xl'
          )}
        >
          {/* Image Section */}
          <div
            className={cn(
              'relative overflow-hidden bg-gray-50 dark:bg-gray-800',
              isList
                ? 'w-80 h-80 sm:w-96 sm:h-96 flex-shrink-0 m-4 rounded-xl'
                : 'w-full aspect-square rounded-t-2xl'
            )}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse" />
            )}
            <Image
              src={(() => {
                try {
                  if (product.images?.[0]) {
                    return getImageUrl(product.images[0]);
                  }
                } catch (e) {
                  console.warn('Image error:', e);
                }
                return '/placeholder-solar.jpg';
              })()}
              alt={product.name}
              fill
              className={cn(
                'object-cover transition-all duration-500',
                isHovered && !isList && 'scale-105',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                setImageLoaded(true);
                (e.target as HTMLImageElement).src = '/placeholder-solar.jpg';
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={true}
              priority={false}
            />
          </div>

          {/* Low Stock Indicator - Modern Minimal */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-3 right-3 z-20">
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-950/80 rounded-md border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  Low Stock
                </span>
              </div>
            </div>
          )}
          
          {/* Sold Out */}
          {product.stock === 0 && (
            <div className="absolute top-3 right-3 z-20">
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <Package className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Sold Out
                </span>
              </div>
            </div>
          )}

          {/* Content Section */}
          <div
            className={cn(
              'flex-1',
              isList ? 'p-6' : 'p-4 space-y-2'
            )}
          >
            {/* Category & Brand Row */}
            <div className="flex items-center gap-2 mb-2">
              {product.category && (
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {product.category?.replace(/-/g, ' ').substring(0, 15)}
                </span>
              )}
              {product.category && product.brand && (
                <span className="text-gray-300 dark:text-gray-700">•</span>
              )}
              {product.brand && (
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {product.brand}
                </span>
              )}
            </div>

            {/* Title - Larger and bolder */}
            <h3
              className={cn(
                'font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 leading-tight',
                isList ? 'text-2xl sm:text-3xl' : 'text-base'
              )}
            >
              {product.name}
            </h3>

            {/* Description (list view only) */}
            {isList && product.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Price Section - Larger numbers with prominent strike-through */}
            <div className="flex flex-col items-center gap-1 pt-3">
              {/* Main Price - Large and bold */}
              <div className="flex items-baseline justify-center gap-2 flex-wrap">
                <span 
                  className={cn(
                    'font-bold text-gray-900 dark:text-white',
                    isList ? 'text-4xl sm:text-5xl' : 'text-2xl'
                  )}
                >
                  {formatCurrency(Number(product.price))}
                </span>
                {hasDiscount && (
                  <span 
                    className={cn(
                      'font-medium text-gray-400 line-through',
                      isList ? 'text-xl sm:text-2xl' : 'text-base'
                    )}
                  >
                    {formatCurrency(Number(product.compareAtPrice))}
                  </span>
                )}
              </div>
              

            </div>

            {/* Action Buttons - Larger touch targets */}
            <div className={cn(
              'flex gap-2 pt-4',
              isList ? 'flex-row' : 'flex-row'
            )}>
              {/* View Details Button */}
              <button
                onClick={handleViewDetails}
                className={cn(
                  'flex items-center justify-center gap-2 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-all duration-300 border border-gray-200 dark:border-gray-700',
                  isList
                    ? 'flex-1 px-5 py-3 text-sm rounded-xl'
                    : 'flex-1 px-4 py-2.5 text-xs rounded-lg',
                  'hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <Eye className={cn('transition-all', isList ? 'w-4 h-4' : 'w-3.5 h-3.5')} />
                <span className={isList ? 'text-sm' : 'text-xs'}>View Details</span>
              </button>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={cn(
                  'flex items-center justify-center gap-2 transition-all duration-300 font-medium',
                  isList
                    ? 'flex-1 px-5 py-3 text-sm rounded-xl'
                    : 'flex-1 px-4 py-2.5 text-xs rounded-lg',
                  product.stock > 0
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                )}
              >
                {showAddedFeedback ? (
                  <>
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className={cn('transition-all', isList ? 'w-4 h-4' : 'w-3.5 h-3.5')} />
                    <span className={isList ? 'text-sm' : 'text-xs'}>
                      {itemQty > 0 ? `Add More (${itemQty})` : 'Add to Cart'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}