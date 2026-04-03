'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard, Shield, Truck, Gift } from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { formatCurrency } from '../../lib/utils';
import { useState, useEffect, useCallback } from 'react';

export default function CartPage() {
  const router = useRouter();
  const { items, totalItems, subtotal, removeItem, updateQty, clearCart } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch - ONLY this effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize handlers to prevent unnecessary re-renders
  const handleImageError = useCallback((productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  }, []);

  const handleApplyPromo = useCallback(() => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setPromoApplied(true);
    } else {
      alert('Invalid promo code. Try "SAVE10" for 10% off!');
    }
  }, [promoCode]);

  const handleCheckout = useCallback(() => {
    router.push('/checkout');
  }, [router]);

  const handleUpdateQty = useCallback((id: string, qty: number) => {
    updateQty(id, qty);
  }, [updateQty]);

  const handleRemoveItem = useCallback((id: string) => {
    removeItem(id);
  }, [removeItem]);

  const handleClearCart = useCallback(() => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  }, [clearCart]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const shipping = subtotal > 50000 ? 0 : 500;
  const tax = subtotal * 0.16;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const total = subtotal + shipping + tax - discount;

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-full p-8 mb-8 shadow-xl">
              <ShoppingBag className="w-20 h-20 text-gray-400 dark:text-gray-500" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Your cart is empty
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              Looks like you haven't added anything to your cart yet. Start shopping to find amazing products!
            </p>
            <Link href="/products">
              <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg">
                <ArrowLeft className="w-5 h-5" />
                Start Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors group"
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
                className="inline-flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex gap-4 sm:gap-6">
                    {/* Product Image */}
                    <div className="relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {!imageErrors[item.id] && item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                          onError={() => handleImageError(item.id)}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                          <ShoppingBag className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-4 mb-2">
                        <Link 
                          href={`/products/${item.slug}`}
                          className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-all"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Quantity:</span>
                          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <button
                              onClick={() => handleUpdateQty(item.id, item.qty - 1)}
                              disabled={item.qty <= 1}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 min-w-[3rem] text-center text-gray-900 dark:text-white">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
            <div className="sticky top-24 bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">FREE</span>
                  ) : (
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(shipping)}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (16%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(tax)}
                  </span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount (10%)</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}

                {shipping > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
                      <Truck className="w-4 h-4" />
                      <span>
                        Add {formatCurrency(50000 - subtotal)} more to get FREE shipping!
                      </span>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between text-lg lg:text-xl font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode}
                    className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    10% discount applied!
                  </p>
                )}
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </button>

              <Link href="/products">
                <button className="w-full mt-3 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Continue Shopping
                </button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Free Shipping KSh 50k+</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>30-Day Returns</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>All Major Cards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}