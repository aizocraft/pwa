// src/components/ProductCard.tsx
'use client'

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, Heart, Check, Sparkles, Eye, Tag, Building2 } from 'lucide-react';
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
  const [isRippling, setIsRippling] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setShowAddedFeedback(true);
    setIsRippling(true);
    setTimeout(() => {
      setShowAddedFeedback(false);
      setIsRippling(false);
    }, 800);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/${product.slug}`;
  };

  const isList = variant === 'list';

  return (
    <Link href={`/${product.slug}`} className="block">
      <div
        className={cn(
          'group relative transition-all duration-500 cursor-pointer',
          isList ? 'w-full' : 'h-full'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={cn(
            'relative bg-white dark:bg-gray-900 transition-all duration-500 overflow-hidden',
            isList
              ? 'flex items-stretch rounded-3xl'
              : 'rounded-3xl',
            isHovered
              ? 'shadow-2xl shadow-black/10 dark:shadow-black/30 -translate-y-2'
              : 'shadow-lg shadow-black/5 dark:shadow-black/20',
            'hover:shadow-2xl'
          )}
        >
          {/* Premium Gradient Border on Hover */}
          <div className={cn(
            'absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-700 pointer-events-none',
            isHovered && 'opacity-100',
            'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
          )} style={{ padding: '1.5px', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />

          {/* Premium Badges - Category & Brand Inside Image */}
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            {/* Category Badge */}
            {product.category && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md shadow-lg border border-white/20">
                <Tag className="w-3 h-3 text-blue-400" />
                <span className="text-[11px] font-semibold text-white tracking-wide uppercase">
                  {product.category?.replace(/-/g, ' ').substring(0, 12)}
                </span>
              </div>
            )}
            
            {/* Brand Badge */}
            {product.brand && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md shadow-lg border border-white/20">
                <Building2 className="w-3 h-3 text-purple-400" />
                <span className="text-[11px] font-semibold text-white tracking-wide">
                  {product.brand}
                </span>
              </div>
            )}
          </div>

          {/* Stock Status Badge - Bottom Left */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute bottom-4 left-4 z-20">
              <div className="px-2.5 py-1 rounded-full bg-red-500/90 backdrop-blur-md shadow-lg border border-red-400/50">
                <span className="text-[10px] font-bold text-white tracking-wider uppercase">🔥 Low Stock</span>
              </div>
            </div>
          )}
          
          {product.stock === 0 && (
            <div className="absolute bottom-4 left-4 z-20">
              <div className="px-2.5 py-1 rounded-full bg-gray-900/90 backdrop-blur-md shadow-lg border border-gray-500/50">
                <span className="text-[10px] font-bold text-white tracking-wider uppercase">Sold Out</span>
              </div>
            </div>
          )}





          {/* Image Section */}
          <div
            className={cn(
              'relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900',
              isList
                ? 'w-96 h-96 sm:w-[28rem] sm:h-[28rem] md:w-[32rem] md:h-[32rem] flex-shrink-0 m-5 rounded-2xl'
                : 'w-full aspect-[4/3] rounded-t-3xl'
            )}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-shimmer" />
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
                'object-cover transition-all duration-1000',
                isHovered && !isList && 'scale-110',
                imageLoaded ? 'opacity-100' : 'opacity-0',
                isList && 'rounded-2xl'
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
            
            {/* Premium Overlay Gradient on Hover */}
            <div className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-700',
              isHovered ? 'opacity-100' : 'opacity-0'
            )} />
          </div>

          {/* Content Section  */}
          <div
            className={cn(
              'flex-1 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900',
              isList ? 'p-7 sm:p-8 rounded-r-3xl' : 'p-6 space-y-3 rounded-b-3xl'
            )}
          >
            {/* Title - Premium Font Weight */}
            <h3
              className={cn(
                'font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 leading-snug',
                isList ? 'text-2xl sm:text-3xl tracking-tight' : 'text-xl tracking-tight'
              )}
              style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif" }}
            >
              {product.name}
            </h3>

            {/* Description (only for list view) */}
            {isList && product.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Price Section - Premium Number Font */}
            <div className="flex items-baseline gap-3 pt-3">
              {(() => {
                const hasDiscount = typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price;
                const compareAt = hasDiscount ? product.compareAtPrice! : null;

                return (
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span 
                      className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                      style={{ fontFamily: "'Inter', 'SF Mono', monospace", letterSpacing: '-0.02em' }}
                    >
                      {formatCurrency(Number(product.price))}
                    </span>
                    {hasDiscount && (
                      <span 
                        className="text-base text-gray-400 line-through"
                        style={{ fontFamily: "'Inter', 'SF Mono', monospace" }}
                      >
                        {formatCurrency(Number(compareAt))}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Action Buttons - Premium Design */}
            <div className={cn(
              'flex gap-3 pt-6',
              isList ? 'flex-row' : 'flex-row'
            )}>
              {/* Add to Cart Button - Premium */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={cn(
                  'relative flex-1 flex items-center justify-center gap-2 font-semibold transition-all duration-300 overflow-hidden group/btn',
                  isList
                    ? 'px-6 py-3.5 text-base rounded-xl'
                    : 'px-5 py-3.5 text-sm rounded-xl',
                  product.stock > 0
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                )}
              >
                {/* Ripple Effect */}
                {isRippling && (
                  <span className="absolute inset-0 overflow-hidden">
                    <span className="absolute inset-0 bg-white/30 animate-ripple" />
                  </span>
                )}
                
                {showAddedFeedback ? (
                  <>
                    <Check className="w-5 h-5 animate-bounce" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                    <span>
                      {itemQty > 0
                        ? `Add More (${itemQty})`
                        : product.stock > 0
                        ? 'Add to Cart'
                        : 'Out of Stock'}
                    </span>
                  </>
                )}
              </button>

              {/* View Button - Premium Eye Icon */}
              <button
                onClick={handleViewDetails}
                className={cn(
                  'flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] group/btn backdrop-blur-sm',
                  isList
                    ? 'w-14 h-14 rounded-xl'
                    : 'w-12 h-12 rounded-xl',
                  'border border-gray-200 dark:border-gray-700'
                )}
                aria-label="View details"
              >
                <Eye className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
              </button>
            </div>
          </div>

          {/* Premium Hover Effect */}
          <div
            className={cn(
              'absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-3xl',
              isHovered
                ? 'opacity-100 ring-1 ring-black/5 dark:ring-white/10'
                : 'opacity-0'
            )}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.5;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        
        .animate-ripple {
          animation: ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-bounce {
          animation: bounce 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-25%);
          }
        }
        
        /* Premium Typography */
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800;14..32,900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
    </Link>
  );
}