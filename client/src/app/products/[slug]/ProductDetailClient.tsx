// app/products/[slug]/ProductDetailClient.tsx
'use client'

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Star, 
  ChevronLeft, 
  Package, 
  X, 
  Tag, 
  Building2, 
  Layers, 
  Truck, 
  Shield, 
  RefreshCw,
  Heart,
  Share2,
  Check,
  Minus,
  Plus,
  ChevronRight,
  Sparkles,
  Award,
  Clock,
  MapPin,
  CreditCard,
  Zap,
  ZoomIn,
  AlertCircle
} from 'lucide-react';
import { getProduct, getProducts, getProductImageUrl } from '../../../lib/api';
import { useCartStore } from '../../../store/cart';
import { cn, formatCurrency } from '../../../lib/utils';
import ReviewComponent from '../../../components/Review';
import OrderToWhatsApp from '../../../components/OrderToWhatsApp';
import RichTextRenderer from '@/components/RichTextRenderer';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function ProductDetailClient() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [isLightbox, setIsLightbox] = useState(false);
  const [lightboxImg, setLightboxImg] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping'>('description');
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [isImageLoading, setIsImageLoading] = useState(true);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000
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

  const handleAddToCart = useCallback(() => {
    if (product) {
      addItem(product, qty);
      setShowAddedToCart(true);
      setTimeout(() => setShowAddedToCart(false), 2000);
    }
  }, [product, qty, addItem]);

  const handleImageError = useCallback((index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  }, []);

  useEffect(() => {
    setSelectedImage(0);
    setQty(1);
    setImageErrors({});
    setIsImageLoading(true);
  }, [product?._id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-4">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 sm:p-8 max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Product not found</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4" />
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  const isInStock = product.stock > 0;
  const stockStatus = isInStock 
    ? product.stock > 10 ? 'In Stock' : 'Limited Stock'
    : 'Out of Stock';
  const stockColor = isInStock 
    ? product.stock > 10 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

  const currentImageUrl = getProductImageUrl(product, selectedImage);
  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          
          {/* Breadcrumb */}
          <motion.nav 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-thin"
          >
            <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <Link href="/products" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
              Products
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-900 dark:text-gray-100 font-medium truncate">{product.name}</span>
          </motion.nav>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 xl:gap-12">
            
            {/* Left Column - Images */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3 sm:space-y-4"
            >
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg group">
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
                    <div className="animate-pulse">
                      <Package className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                  </div>
                )}
                <Image
                  src={imageErrors[selectedImage] ? '/placeholder-product.jpg' : currentImageUrl}
                  alt={product.name}
                  fill
                  className={cn(
                    "object-cover transition-all duration-500",
                    isImageLoading ? "opacity-0 scale-105" : "opacity-100 scale-100 group-hover:scale-105",
                    !imageErrors[selectedImage] && "cursor-zoom-in"
                  )}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                  onLoadingComplete={() => setIsImageLoading(false)}
                  onError={() => handleImageError(selectedImage)}
                  unoptimized={currentImageUrl.includes('/api/')}
                />
                
                {/* Zoom Button */}
                {!imageErrors[selectedImage] && (
                  <button
                    onClick={() => {
                      setLightboxImg(currentImageUrl);
                      setIsLightbox(true);
                    }}
                    className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 p-1.5 sm:p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform z-20"
                    aria-label="Zoom image"
                  >
                    <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                )}

                {/* Stock Badge */}
                <div className={`absolute top-3 left-3 sm:top-4 sm:left-4 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${stockColor} shadow-lg backdrop-blur-sm z-20`}>
                  {stockStatus}
                </div>
              </div>

              {/* Thumbnails */}
              {hasMultipleImages && (
                <div className="relative">
                  <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin px-0.5">
                    {product.images.map((img, index) => {
                      const thumbUrl = getProductImageUrl(product, index);
                      return (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedImage(index);
                            setIsImageLoading(true);
                          }}
                          className={cn(
                            'flex-shrink-0 relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-200',
                            selectedImage === index 
                              ? 'ring-2 ring-blue-500 shadow-lg' 
                              : 'ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-blue-300 dark:hover:ring-blue-700 opacity-70 hover:opacity-100'
                          )}
                        >
                          <Image
                            src={thumbUrl}
                            alt={`${product.name} view ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                            }}
                          />
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right Column - Product Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 sm:space-y-5"
            >
              {/* Title and Brand */}
              <div className="space-y-1.5 sm:space-y-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {product.name}
                </h1>
                
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {product.brand && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
                      <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{product.brand}</span>
                    </div>
                  )}
                  {product.type && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
                      <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{product.type}</span>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          'w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current',
                          i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {product.rating} out of 5
                  </span>
                  <button 
                    onClick={() => {
                      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium transition-colors"
                  >
                    Write a review
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(Number(product.price))}
                </span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-sm sm:text-base text-gray-400 line-through">
                      {formatCurrency(Number(product.compareAtPrice))}
                    </span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                      Save {formatCurrency(Number(product.compareAtPrice) - Number(product.price))}
                    </span>
                  </>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={cn(
                    'p-2 rounded-xl border-2 transition-all',
                    isWishlisted 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/10'
                  )}
                >
                  <Heart className={cn('w-4 h-4 sm:w-5 sm:h-5', isWishlisted && 'fill-current')} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>

              {/* Quantity and Add to Cart */}
              {isInStock && (
                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Quantity
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg sm:rounded-xl">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-l-lg sm:rounded-l-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center disabled:opacity-50"
                        disabled={qty <= 1}
                      >
                        <Minus className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', qty <= 1 ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300')} />
                      </button>
                      <span className="w-10 sm:w-12 text-center font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(Math.min(product.stock, qty + 1))}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-r-lg sm:rounded-r-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center disabled:opacity-50"
                        disabled={qty >= product.stock}
                      >
                        <Plus className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', qty >= product.stock ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300')} />
                      </button>
                    </div>
                    
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      {itemQty > 0 ? `Add More (${itemQty})` : 'Add to Cart'}
                    </button>
                    <OrderToWhatsApp product={product} quantity={qty} />
                  </div>

                  {/* Added to Cart Toast */}
                  <AnimatePresence>
                    {showAddedToCart && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg"
                      >
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm font-medium">Added to cart!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Out of Stock */}
              {!isInStock && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-center">
                  <p className="text-red-600 dark:text-red-400 font-medium text-sm">Out of Stock</p>
                  <button className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
                    Notify me when available
                  </button>
                </div>
              )}

              {/* Delivery Info */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1 sm:pt-2">
                {[
                  { icon: Truck, label: 'Free Shipping', desc: 'Over KES 5000' },
                  { icon: Shield, label: 'Secure Payment', desc: '100% secure' },
                  { icon: RefreshCw, label: 'Easy Returns', desc: '7 days policy' },
                ].map((item, idx) => (
                  <div key={idx} className="p-1.5 sm:p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg sm:rounded-xl text-center">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mx-auto mb-0.5 sm:mb-1" />
                    <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 hidden sm:block">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="pt-2 sm:pt-3">
                <div className="flex gap-0.5 sm:gap-1 border-b border-gray-200 dark:border-gray-800">
                  {(['description', 'specs', 'shipping'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all relative',
                        activeTab === tab 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      )}
                    >
                      {tab === 'description' && 'Description'}
                      {tab === 'specs' && 'Specs'}
                      {tab === 'shipping' && 'Shipping'}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-3 sm:pt-4"
                >
                  {activeTab === 'description' && (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      <RichTextRenderer content={product.description || 'No description available.'} />

                      
                      </p>
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2 sm:mt-3">
                          {product.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-[10px] sm:text-xs">
                              <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'specs' && product.specs && Object.keys(product.specs).length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <dl className="space-y-1.5 sm:space-y-2">
                        {Object.entries(product.specs).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-0">
                            <dt className="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
                              {key.replace(/_/g, ' ')}
                            </dt>
                            <dd className="text-[11px] sm:text-xs font-semibold text-gray-900 dark:text-white">
                              {String(value)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  {activeTab === 'specs' && (!product.specs || Object.keys(product.specs).length === 0) && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4 sm:py-6 text-xs sm:text-sm">No specifications available.</p>
                  )}

                  {activeTab === 'shipping' && (
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Delivery Time</p>
                          <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">2-5 business days for Nairobi, 5-7 for other regions</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Return Policy</p>
                          <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">7 days return for unused items in original packaging</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Customer Reviews */}
          <motion.div 
            id="reviews"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-800"
          >
            <ReviewComponent productId={product._id!} productName={product.name} />
          </motion.div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.products && relatedProducts.products.filter(p => p._id !== product._id).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 sm:mt-16"
            >
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  You May Also Like
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Discover similar products our customers love</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {relatedProducts.products
                  .filter(p => p._id !== product._id)
                  .slice(0, 4)
                  .map((relatedProduct, idx) => (
                    <motion.div
                      key={relatedProduct._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -4 }}
                    >
                      <Link href={`/products/${relatedProduct.slug}`} className="block group">
                        <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                          <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                            <Image
                              src={getProductImageUrl(relatedProduct, 0)}
                              alt={relatedProduct.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                              }}
                            />
                          </div>
                          <div className="p-2 sm:p-3">
                            <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-1">
                              {relatedProduct.name}
                            </h3>
                            <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5 sm:mt-1">
                              {formatCurrency(Number(relatedProduct.price))}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightbox && lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setIsLightbox(false)}
          >
            <button
              onClick={() => setIsLightbox(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:text-gray-300 transition-colors p-2 z-10"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl lg:max-w-5xl aspect-square"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxImg}
                alt="Product zoom view"
                fill
                className="object-contain"
                sizes="90vw"
                priority
                unoptimized={lightboxImg.includes('/api/')}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}