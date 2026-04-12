// src/app/cart/page.tsx
'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  Truck, 
  Gift,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Package,
  Clock,
  Lock
} from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { formatCurrency } from '../../lib/utils';
import { useState, useEffect, useCallback, useMemo } from 'react';

export default function CartPage() {
  const router = useRouter();
  const { items, totalItems, subtotal, removeItem, updateQty, clearCart } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate shipping and totals
  const FREE_SHIPPING_THRESHOLD = 50000;
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : 500;
  const tax = subtotal * 0.16;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const total = subtotal + shipping + tax - discount;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Memoized values
  const progressPercentage = useMemo(() => {
    return Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  }, [subtotal]);

  const handleImageError = useCallback((productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  }, []);

  const handleApplyPromo = useCallback(() => {
    if (promoApplied) {
      setPromoMessage({ type: 'error', message: 'Promo code already applied!' });
      setTimeout(() => setPromoMessage(null), 3000);
      return;
    }

    if (promoCode.toUpperCase() === 'SAVE10') {
      setPromoApplied(true);
      setPromoMessage({ type: 'success', message: '10% discount applied successfully!' });
      setPromoCode('');
      setTimeout(() => setPromoMessage(null), 3000);
    } else if (promoCode.toUpperCase() === 'WELCOME20') {
      setPromoApplied(true);
      setPromoMessage({ type: 'success', message: '20% welcome discount applied!' });
      setPromoCode('');
      setTimeout(() => setPromoMessage(null), 3000);
    } else {
      setPromoMessage({ type: 'error', message: 'Invalid promo code. Try "SAVE10" or "WELCOME20"' });
      setTimeout(() => setPromoMessage(null), 3000);
    }
  }, [promoCode, promoApplied]);

  const handleRemovePromo = useCallback(() => {
    setPromoApplied(false);
    setPromoMessage({ type: 'success', message: 'Promo code removed' });
    setTimeout(() => setPromoMessage(null), 3000);
  }, []);

  const handleCheckout = useCallback(async () => {
    setIsLoading(true);
    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push('/checkout');
  }, [router]);

  const handleUpdateQty = useCallback(async (id: string, qty: number) => {
    setUpdatingId(id);
    // Simulate async update
    await new Promise(resolve => setTimeout(resolve, 200));
    updateQty(id, qty);
    setUpdatingId(null);
  }, [updateQty]);

  const handleRemoveItem = useCallback(async (id: string) => {
    setRemovingId(id);
    // Simulate async removal
    await new Promise(resolve => setTimeout(resolve, 300));
    removeItem(id);
    setRemovingId(null);
  }, [removeItem]);

  const handleClearCart = useCallback(() => {
    if (confirm('Are you sure you want to clear your cart? This action cannot be undone.')) {
      clearCart();
    }
  }, [clearCart]);

  if (!mounted) return null;

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Animated empty state */}
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/20" />
              <div className="relative bg-white dark:bg-gray-800 rounded-full p-8 shadow-xl">
                <ShoppingBag className="w-20 h-20 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Your cart is empty
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              Looks like you haven't added anything to your cart yet. Start shopping to find amazing products!
            </p>
            <Link href="/products">
              <button className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Start Shopping
                <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <Link 
            href="/products" 
            className="group inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Shopping Cart
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
              </p>
            </div>
            {totalItems > 0 && (
              <button
                onClick={handleClearCart}
                className="group inline-flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="group-hover:underline">Clear Cart</span>
              </button>
            )}
          </div>
        </div>

        {/* Promo Message Toast */}
        {promoMessage && (
          <div className={`fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300 max-w-sm`}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
              promoMessage.type === 'success' 
                ? 'bg-green-50 dark:bg-green-950/90 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-950/90 border border-red-200 dark:border-red-800'
            }`}>
              {promoMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <span className={`text-sm font-medium ${
                promoMessage.type === 'success' 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {promoMessage.message}
              </span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-12">
          
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`group bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-xl transition-all duration-300 ${
                  removingId === item.id ? 'opacity-50 scale-95' : ''
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex gap-4 sm:gap-6">
                    
                    {/* Product Image */}
                    <div className="relative flex-shrink-0">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 group-hover:scale-105 transition-transform duration-500">
                        {!imageErrors[item.id] && item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(item.id)}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>
                      {/* Quantity badge on mobile */}
                      <div className="absolute -top-2 -right-2 sm:hidden bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {item.qty}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-4 mb-2">
                        <Link 
                          href={`/products/${item.slug}`}
                          className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 flex-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removingId === item.id}
                          className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-200 disabled:opacity-50"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4 hover:scale-110 transition-transform" />
                        </button>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Quantity:</span>
                          <div className="flex items-center bg-gray-100 dark:bg-gray-700/50 rounded-xl overflow-hidden">
                            <button
                              onClick={() => handleUpdateQty(item.id, item.qty - 1)}
                              disabled={item.qty <= 1 || updatingId === item.id}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 sm:px-4 py-2 min-w-[2.5rem] sm:min-w-[3rem] text-center text-gray-900 dark:text-white font-medium">
                              {updatingId === item.id ? (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                              ) : (
                                item.qty
                              )}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                              disabled={updatingId === item.id}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-all duration-200"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(item.price * item.qty)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatCurrency(item.price)} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Free Shipping Progress */}
              {shipping > 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Add {formatCurrency(remainingForFreeShipping)} more for FREE shipping!
                    </span>
                  </div>
                  <div className="relative h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-shimmer" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {progressPercentage === 100 ? '✨ You qualify for free shipping!' : `${Math.round(progressPercentage)}% to free shipping`}
                  </p>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-5 sm:p-6 lg:p-8 transition-all duration-300 hover:shadow-xl">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Order Summary
                </h2>

                {/* Cost Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <span>Shipping</span>
                      {shipping === 0 && <CheckCircle className="w-3 h-3 text-green-600" />}
                    </div>
                    {shipping === 0 ? (
                      <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                        FREE <Sparkles className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(shipping)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                    <span>Tax (16% VAT)</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(tax)}
                    </span>
                  </div>

                  {promoApplied && (
                    <div className="flex justify-between items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-3 rounded-xl -mx-1">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        <span className="font-medium">Discount (10%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>-{formatCurrency(discount)}</span>
                        <button
                          onClick={handleRemovePromo}
                          className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
                          aria-label="Remove promo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                    <div className="flex justify-between items-center text-lg lg:text-xl font-bold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-2xl lg:text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        disabled={promoApplied}
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoApplied || !promoCode}
                      className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white rounded-xl text-sm font-medium hover:from-gray-800 hover:to-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                  {!promoApplied && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Try "SAVE10" for 10% off or "WELCOME20" for 20% off!
                    </p>
                  )}
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Proceed to Checkout
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <Link href="/products">
                  <button className="w-full mt-3 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-[1.02] active:scale-95">
                    Continue Shopping
                  </button>
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 group">
                      <div className="p-1 bg-green-100 dark:bg-green-950/50 rounded-lg group-hover:scale-110 transition-transform">
                        <Shield className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span>Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 group">
                      <div className="p-1 bg-blue-100 dark:bg-blue-950/50 rounded-lg group-hover:scale-110 transition-transform">
                        <Truck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span>Free Shipping KSh 50k+</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 group">
                      <div className="p-1 bg-yellow-100 dark:bg-yellow-950/50 rounded-lg group-hover:scale-110 transition-transform">
                        <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span>30-Day Returns</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 group">
                      <div className="p-1 bg-purple-100 dark:bg-purple-950/50 rounded-lg group-hover:scale-110 transition-transform">
                        <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span>Secure Payment</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Estimate */}
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Estimated delivery: 3-5 business days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}