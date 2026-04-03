// src/app/products/[slug]/page.tsx
'use client'

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, ChevronLeft, Package, X, Tag, Building2, Layers } from 'lucide-react';
import { Product } from '../../../types/product';
import { getProduct, getProducts } from '../../../lib/api';
import { useCartStore } from '../../../store/cart';
import { cn, formatCurrency } from '../../../lib/utils';

export default function ProductDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [isLightbox, setIsLightbox] = useState(false);
  const [lightboxImg, setLightboxImg] = useState('');

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug),
    enabled: !!slug
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related', product?.category, product?._id],
    queryFn: () => getProducts({
      category: product?.category,
      featured: true,
      limit: 4
    }),
    enabled: !!product?.category && !!product?._id,
    staleTime: 5 * 60 * 1000
  });

  const addItem = useCartStore((state) => state.addItem);
  const itemQty = useCartStore((state) => state.getItemQty(product?._id || ''));

  const handleAddToCart = () => {
    if (product) {
      addItem(product, qty);
      setQty(1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-emerald-50/20 py-12 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Products
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Images */}
            <div className="space-y-6">
              {/* Thumbnails */}
              {product.images && product.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.slice(0, 4).map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        'flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-4 transition-all bg-white/50 hover:scale-105',
                        selectedImage === index && 'border-blue-500 ring-4 ring-blue-400/50 shadow-2xl'
                      )}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        width={96}
                        height={96}
                        className="object-cover hover:scale-110 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-white/30 shadow-2xl group cursor-zoom-in">
                <Image
                  src={product.images?.[selectedImage] || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onClick={() => {
                    setLightboxImg(product.images[selectedImage]);
                    setIsLightbox(true);
                  }}
                />
                <button
                  onClick={() => {
                    setLightboxImg(product.images[selectedImage]);
                    setIsLightbox(true);
                  }}
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300"
                  aria-label="Open lightbox"
                >
                  <div className="w-12 h-12 bg-white/90 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-all">
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:pt-4 space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  {product.name}
                </h1>
                
                {/* Brand and Type */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {product.brand && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">Brand: <span className="font-semibold text-gray-900 dark:text-white">{product.brand}</span></span>
                    </div>
                  )}
                  {product.type && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Layers className="w-4 h-4" />
                      <span className="text-sm">Type: <span className="font-semibold text-gray-900 dark:text-white">{product.type}</span></span>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          'w-5 h-5 fill-current',
                          i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({product.rating} / 5)
                  </span>
                </div>
              </div>

              <div className="space-y-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatCurrency(Number(product.price))}
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    'px-4 py-2 rounded-full font-semibold text-sm',
                    product.stock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    product.stock > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  )}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                {/* Quantity & Add to Cart */}
                {product.stock > 0 && (
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-2xl p-2">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="w-12 h-12 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold text-xl transition-all flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-20 text-center text-2xl font-bold text-gray-900 dark:text-white">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(Math.min(product.stock, qty + 1))}
                        className="w-12 h-12 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold text-xl transition-all flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl text-lg uppercase tracking-wide shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      {itemQty > 0 ? `Added to Cart (${itemQty})` : 'Add to Cart'}
                    </button>
                  </div>
                )}

                {/* Category & Tags */}
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                    {product.category.replace(/-/g, ' ').toUpperCase()}
                  </span>
                  {product.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Description
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {product.description || 'Premium quality product engineered for maximum performance and durability.'}
                </p>
              </div>

              {/* Specifications */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Specifications</h3>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(product.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                          <dt className="font-medium text-gray-600 dark:text-gray-400 capitalize">{key.replace(/_/g, ' ')}</dt>
                          <dd className="font-semibold text-gray-900 dark:text-white">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightbox && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsLightbox(false)}
        >
          <button
            onClick={() => setIsLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          <div 
            className="relative w-full max-w-5xl aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImg}
              alt="Product zoom"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        </div>
      )}
    </>
  );
}