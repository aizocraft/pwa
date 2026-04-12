// src/app/products/[slug]/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
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
  ChevronRight
} from 'lucide-react';
import { Product } from '../../../types/product';
import { getProduct, getProducts } from '../../../lib/api';
import { useCartStore } from '../../../store/cart';
import { cn, formatCurrency } from '../../../lib/utils';
import ReviewComponent from '../../../components/Review';

export default function ProductDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [isLightbox, setIsLightbox] = useState(false);
  const [lightboxImg, setLightboxImg] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping'>('description');

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
      setShowAddedToCart(true);
      setTimeout(() => setShowAddedToCart(false), 2000);
      setQty(1);
    }
  };

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImage(0);
    setQty(1);
  }, [product?._id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="text-center p-8 max-w-md bg-white rounded-2xl shadow-xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const isInStock = product.stock > 0;
  const stockStatus = isInStock 
    ? product.stock > 10 ? 'In Stock' : 'Limited Stock'
    : 'Out of Stock';
  const stockColor = isInStock 
    ? product.stock > 10 ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'
    : 'text-red-600 bg-red-50';

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6 lg:mb-8 overflow-x-auto pb-2">
            <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <Link href="/products" className="text-gray-500 hover:text-blue-600 transition-colors">
              Products
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
            
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl lg:rounded-3xl overflow-hidden bg-white shadow-lg group cursor-zoom-in">
                <Image
                  src={product.images?.[selectedImage] || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                  onClick={() => {
                    setLightboxImg(product.images?.[selectedImage] || '');
                    setIsLightbox(true);
                  }}
                />
                
                {/* Zoom Button Overlay */}
                <button
                  onClick={() => {
                    setLightboxImg(product.images?.[selectedImage] || '');
                    setIsLightbox(true);
                  }}
                  className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
                  aria-label="Zoom image"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>

                {/* Stock Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-medium ${stockColor} shadow-lg`}>
                  {stockStatus}
                </div>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        'flex-shrink-0 relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden transition-all duration-200',
                        selectedImage === index 
                          ? 'ring-2 ring-blue-500 shadow-lg scale-95' 
                          : 'ring-1 ring-gray-200 hover:ring-blue-300 hover:scale-105'
                      )}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              {/* Title and Actions */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                
                {/* Brand and Type */}
                <div className="flex flex-wrap gap-3">
                  {product.brand && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
                      <Building2 className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-gray-700">{product.brand}</span>
                    </div>
                  )}
                  {product.type && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
                      <Layers className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-gray-700">{product.type}</span>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          'w-4 h-4 sm:w-5 sm:h-5 fill-current',
                          i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} out of 5
                  </span>
                  <button 
                    onClick={() => {
                      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Write a review
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {formatCurrency(Number(product.price))}
                </span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {formatCurrency(Number(product.compareAtPrice))}
                    </span>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                      Save {formatCurrency(Number(product.compareAtPrice) - Number(product.price))}
                    </span>
                  </>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={cn(
                    'p-3 rounded-xl border-2 transition-all duration-200',
                    isWishlisted 
                      ? 'border-red-500 bg-red-50 text-red-500' 
                      : 'border-gray-300 hover:border-red-300 hover:bg-red-50'
                  )}
                >
                  <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
                </button>
                <button className="p-3 rounded-xl border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Quantity Selector */}
              {isInStock && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-100 rounded-xl">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-l-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
                        disabled={qty <= 1}
                      >
                        <Minus className={cn('w-4 h-4', qty <= 1 ? 'text-gray-400' : 'text-gray-700')} />
                      </button>
                      <span className="w-12 sm:w-16 text-center font-semibold text-gray-900">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(Math.min(product.stock, qty + 1))}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-r-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
                        disabled={qty >= product.stock}
                      >
                        <Plus className={cn('w-4 h-4', qty >= product.stock ? 'text-gray-400' : 'text-gray-700')} />
                      </button>
                    </div>
                    
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {itemQty > 0 ? `Add More (${itemQty} in cart)` : 'Add to Cart'}
                    </button>
                  </div>

                  {/* Added to Cart Feedback */}
                  {showAddedToCart && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl animate-in slide-in-from-top-2">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Added to cart!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Out of Stock State */}
              {!isInStock && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-600 font-medium">Out of Stock</p>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                    Notify me when available
                  </button>
                </div>
              )}

              {/* Delivery Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Free Shipping</p>
                    <p className="text-xs text-gray-500">On orders over KES 5000</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Secure Payment</p>
                    <p className="text-xs text-gray-500">100% secure transactions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <RefreshCw className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Easy Returns</p>
                    <p className="text-xs text-gray-500">7 days return policy</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="pt-4">
                <div className="flex gap-2 border-b border-gray-200">
                  {(['description', 'specs', 'shipping'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'px-4 py-2 text-sm font-medium transition-all relative',
                        activeTab === tab 
                          ? 'text-blue-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      )}
                    >
                      {tab === 'description' && 'Description'}
                      {tab === 'specs' && 'Specifications'}
                      {tab === 'shipping' && 'Shipping Info'}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-6">
                  {/* Description Tab */}
                  {activeTab === 'description' && (
                    <div className="prose prose-sm sm:prose-base max-w-none">
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {product.description || 'Premium quality product engineered for maximum performance and durability.'}
                      </p>
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {product.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Specifications Tab */}
                  {activeTab === 'specs' && product.specs && Object.keys(product.specs).length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                      <dl className="space-y-3">
                        {Object.entries(product.specs).map(([key, value]) => (
                          <div key={key} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200 last:border-0">
                            <dt className="text-sm font-medium text-gray-600 capitalize">
                              {key.replace(/_/g, ' ')}
                            </dt>
                            <dd className="text-sm font-semibold text-gray-900 mt-1 sm:mt-0">
                              {String(value)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  {activeTab === 'specs' && (!product.specs || Object.keys(product.specs).length === 0) && (
                    <p className="text-gray-500 text-center py-8">No specifications available for this product.</p>
                  )}

                  {/* Shipping Tab */}
                  {activeTab === 'shipping' && (
                    <div className="space-y-4 text-sm text-gray-600">
                      <div className="flex items-start gap-3">
                        <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Delivery Time</p>
                          <p>2-5 business days for Nairobi, 5-7 business days for other regions</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Return Policy</p>
                          <p>7 days return policy for unused items in original packaging</p>
                        </div>
              </div>
            </div>
          )}
          
          {/* Customer Reviews */}
          <div id="reviews" className="mt-24 pt-12 border-t border-gray-200">
            <ReviewComponent productId={product._id!} productName={product.name} />
          </div>
          
        </div>
      </div>

            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts && relatedProducts.products && relatedProducts.products.length > 0 && (
            <div className="mt-16 lg:mt-24">
              <div className="text-center mb-8 lg:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  You May Also Like
                </h2>
                <p className="text-gray-600">Discover similar products our customers love</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.products
                  .filter(p => p._id !== product._id)
                  .slice(0, 4)
                  .map((relatedProduct) => (
                    <Link 
                      key={relatedProduct._id} 
                      href={`/products/${relatedProduct.slug}`}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="relative aspect-square bg-gray-100">
                        <Image
                          src={relatedProduct.images?.[0] || '/placeholder-product.jpg'}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(Number(relatedProduct.price))}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightbox && lightboxImg && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightbox(false)}
        >
          <button
            onClick={() => setIsLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          <div 
            className="relative w-full max-w-5xl aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImg}
              alt="Product zoom view"
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}