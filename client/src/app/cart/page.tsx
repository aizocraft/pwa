// src/app/cart/page.tsx
'use client'

import Image from 'next/image'
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
  Lock,
  Tag
} from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { formatCurrency } from '../../lib/utils';
import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { 
    items, 
    totalItems, 
    subtotal, 
    shippingCost,
    discount: storeDiscount,
    totals,
    shippingAreas, 
    selectedShippingAreaId,
    loading: cartLoading,
    taxRate,
    taxExemptCategories,
    removeItem, 
    updateQty, 
    clearCart,
    setPromoCode: setStorePromoCode,
    promoCode: appliedPromoCode,
    promoValid,
    promoError,
    clearPromoError,
    recalculateTotals,
    taxableSubtotal,
    taxExemptSubtotal
  } = useCartStore();

  
  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const cart = useCartStore.getState();
    cart.loadInitialData().catch(console.error);
  }, []); 

  useEffect(() => {
    if (shippingAreas.length === 0 && !cartLoading) {
      useCartStore.getState().loadShippingAreas().catch(console.error);
    }
  }, [shippingAreas.length, cartLoading]);

  const tax = totals.tax || (taxableSubtotal * taxRate);
  const total = totals.total || (taxableSubtotal + taxExemptSubtotal + shippingCost + tax - storeDiscount);
  const selectedArea = shippingAreas.find(area => area._id === selectedShippingAreaId);
  
  const remainingForFreeShipping = selectedArea && selectedArea.freeThreshold > 0
    ? Math.max(0, selectedArea.freeThreshold - subtotal)
    : 0;
  
  const freeShippingThreshold = selectedArea?.freeThreshold || 0;
  const isFreeShippingEnabled = freeShippingThreshold > 0;
  const qualifiesForFreeShipping = isFreeShippingEnabled && subtotal >= freeShippingThreshold;
  const displayShippingCost = qualifiesForFreeShipping ? 0 : shippingCost;

  const progressPercentage = useMemo(() => {
    return isFreeShippingEnabled && freeShippingThreshold > 0 
      ? Math.min(100, (subtotal / freeShippingThreshold) * 100) 
      : 0;
  }, [subtotal, freeShippingThreshold, isFreeShippingEnabled]);

  const hasTaxExemptItems = taxExemptSubtotal > 0;

  const handleImageError = useCallback((productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  }, []);

  const getCartItemImageUrl = useCallback((item: any): string => {
    if (!item.image) return '';
    if (typeof item.image === 'string') return item.image;
    if (item.image.url) return item.image.url;
    if (item.image.fileId) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      return `${apiUrl}/products/image/${item.image.fileId}`;
    }
    return '';
  }, []);

  const handleApplyPromo = useCallback(async () => {
    if (!promoInput.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    if (promoValid) {
      toast.error('Promo code already applied!');
      return;
    }

    setIsApplyingPromo(true);
    try {
      await setStorePromoCode(promoInput);
      const state = useCartStore.getState();
      if (state.promoValid) {
        toast.success('Promo code applied!');
        setPromoInput('');
      } else if (state.promoError) {
        toast.error(state.promoError);
      }
    } catch (error) {
      console.error('Error applying promo:', error);
    } finally {
      setIsApplyingPromo(false);
    }
  }, [promoInput, promoValid, setStorePromoCode]);


  const handleRemovePromo = useCallback(async () => {
    await setStorePromoCode('');
    await recalculateTotals();
    toast.success('Promo code removed');
  }, [setStorePromoCode, recalculateTotals]);

  const handleCheckout = useCallback(async () => {
    if (!selectedShippingAreaId) {
      toast.error('Please select a shipping area');
      return;
    }
    
    setIsLoading(true);
    router.push('/checkout');
  }, [router, selectedShippingAreaId]);

  const handleUpdateQty = useCallback(async (id: string, qty: number) => {
    setUpdatingId(id);
    await updateQty(id, qty);
    setUpdatingId(null);
  }, [updateQty]);

  const handleRemoveItem = useCallback(async (id: string) => {
    setRemovingId(id);
    await removeItem(id);
    setRemovingId(null);
  }, [removeItem]);

  const handleClearCart = useCallback(() => {
    if (confirm('Are you sure you want to clear your cart? This action cannot be undone.')) {
      clearCart();
    }
  }, [clearCart]);

  const getShippingDisplay = (area: any, subtotal: number) => {
    if (area.freeThreshold > 0 && subtotal >= area.freeThreshold) {
      return { text: 'FREE', isFree: true, cost: 0 };
    }
    return { text: formatCurrency(area.baseCost), isFree: false, cost: area.baseCost };
  };

  if (!mounted) return null;

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="flex flex-col items-center justify-center text-center">
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
              <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/20 text-blue-900 dark:text-blue-100 font-semibold rounded-3xl shadow-2xl hover:shadow-blue-500/20 hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-400 hover:scale-105 hover:-translate-y-1 active:scale-95 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-600/30 hover:to-blue-700/30">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-all duration-300" />
                <span className="relative z-10">Start Shopping</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-cyan-400/50 rounded-3xl blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                      <div className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50/70 via-white to-gray-50/70 dark:from-slate-800/50 dark:via-gray-900/20 dark:to-slate-800/50 shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:shadow-2xl hover:ring-emerald-200/50 dark:hover:ring-emerald-400/30 group/image transition-all duration-500 hover:scale-105 hover:rotate-1 hover:shadow-emerald-500/10">
                        {!imageErrors[item.id] && item.image ? (
                        <Image
                          src={getCartItemImageUrl(item)}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 160px, (max-width: 1024px) 224px, 224px"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          priority={false}
                          onError={() => handleImageError(item.id)}
                          draggable={false}
                          unoptimized={true}
                        />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-50/80 to-blue-50/80 dark:from-emerald-950/40 dark:to-blue-950/40">
                            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500/80 dark:text-emerald-400 mb-1" />
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center leading-tight">
                              {item.name.split(' ').slice(0, 3).join(' ')}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-500 dark:to-teal-400 text-white text-xs sm:text-sm font-bold rounded-2xl w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg ring-2 ring-white/50 -rotate-6 group-hover:rotate-0 transition-all duration-500 hover:scale-110 hover:shadow-emerald-500/25">
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

                      {/* Tax Exempt Badge */}
                      {item.isTaxExempt && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full mb-2">
                          <Tag className="w-3 h-3" />
                          Tax Exempt
                        </div>
                      )}

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
              {/* Shipping Area Selection */}
              {shippingAreas.length > 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-green-600" />
                    Select Shipping Area
                  </h3>
                  <select
                    value={selectedShippingAreaId || ''}
                    onChange={async (e) => {
                      await useCartStore.getState().setShippingArea(e.target.value);
                    }}
                    disabled={cartLoading}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <option value="">Select a shipping area</option>
                    {shippingAreas.map(area => {
                      const { text } = getShippingDisplay(area, subtotal);
                      return (
                        <option key={area._id} value={area._id}>
                          {area.name} - {text}
                          {area.freeThreshold > 0 && ` (Free over ${formatCurrency(area.freeThreshold)})`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Free Shipping Progress */}
              {selectedArea && isFreeShippingEnabled && !qualifiesForFreeShipping && remainingForFreeShipping > 0 && (
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
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {progressPercentage >= 100 ? ' You qualify for free shipping!' : `${Math.round(progressPercentage)}% to free shipping`}
                  </p>
                </div>
              )}

              {/* Free Shipping Achieved Message */}
              {selectedArea && qualifiesForFreeShipping && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 animate-pulse" />
                    <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                       You qualify for FREE shipping!
                    </span>
                  </div>
                </div>
              )}

              {/* No Free Shipping Available Message */}
              {selectedArea && !isFreeShippingEnabled && (
                <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Free shipping not available for this area
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-5 sm:p-6 transition-all duration-300 hover:shadow-xl">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Order Summary
                </h2>

                {/* Cost Breakdown */}
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {/* Tax Breakdown - Show taxable and tax-exempt separately */}
                  {hasTaxExemptItems && (
                    <div className="space-y-1 border-t border-gray-100 dark:border-gray-800 pt-2">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-2">
                        <span>Taxable items</span>
                        <span>{formatCurrency(taxableSubtotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-green-600 dark:text-green-400 pl-2">
                        <span>Tax-exempt items</span>
                        <span>{formatCurrency(taxExemptSubtotal)}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <span>Shipping</span>
                      {displayShippingCost === 0 && qualifiesForFreeShipping && <Sparkles className="w-3 h-3 text-green-600" />}
                    </div>
                    {displayShippingCost === 0 ? (
                      <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                        FREE {qualifiesForFreeShipping && <Sparkles className="w-3 h-3" />}
                      </span>
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(displayShippingCost)}
                      </span>
                    )}
                  </div>
                  
                  {/* Only show tax if there are taxable items */}
                  {taxableSubtotal > 0 && (
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-3">
                      <span>Tax ({(taxRate * 100).toFixed(0)}% VAT)</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(tax)}
                      </span>
                    </div>
                  )}

                  {promoValid && storeDiscount > 0 && (
                    <div className="flex justify-between items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-2 rounded-lg -mx-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Gift className="w-3 h-3" />
                        <span>Discount</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">-{formatCurrency(storeDiscount)}</span>
                        <button
                          onClick={handleRemovePromo}
                          className="p-0.5 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
                          aria-label="Remove promo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <div className="flex justify-between items-center text-base font-bold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>


                {/* Promo Code Input */}
                <div className="mb-5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          if (promoError) clearPromoError();
                        }}
                        disabled={promoValid || isApplyingPromo}
                        className={`w-full pl-9 pr-3 py-2.5 bg-gray-100 dark:bg-gray-900 border ${
                          promoError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700'
                        } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                      />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoValid || !promoInput.trim() || isApplyingPromo}
                      className="px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApplyingPromo ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>
                  
                  {promoError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {promoError}
                    </p>
                  )}
                  
                  {appliedPromoCode && promoValid && !promoError && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Promo code "{appliedPromoCode}" applied!
                    </p>
                  )}
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isLoading || !selectedShippingAreaId}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Proceed to Checkout
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {!selectedShippingAreaId && shippingAreas.length > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 text-center">
                    Please select a shipping area to continue
                  </p>
                )}

                <Link href="/products">
                  <button className="w-full mt-3 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                    Continue Shopping
                  </button>
                </Link>

                {/* Trust Badges */}
                <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <div className="p-1 bg-green-100 dark:bg-green-950/50 rounded-lg">
                        <Shield className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span>Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <div className="p-1 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                        <Truck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span>Free Shipping Available</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <div className="p-1 bg-yellow-100 dark:bg-yellow-950/50 rounded-lg">
                        <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span>30-Day Returns</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <div className="p-1 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
                        <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span>Secure Payment</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Estimate */}
                <div className="mt-3 p-2.5 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Estimated delivery: 3-5 business days</span>
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