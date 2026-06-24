// src/app/checkout/page.tsx - COMPLETE WITH FIXED SHIPPING STORAGE

'use client'

import { useState, useEffect, useCallback, useRef, type SetStateAction } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, CreditCard, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useCartStore } from "../../store/cart"
import { initiateMpesaPayment, checkPaymentStatus, createOrder, checkCanRetry } from "../../lib/api"
import { getToken } from "../../lib/auth"
import toast from "react-hot-toast"

import OrderSummary from "./components/OrderSummary"
import OrderSuccess from "./components/OrderSuccess"
import EmptyCart from "./components/EmptyCart"
import ShippingForm from "./components/ShippingForm"
import PaymentMethods from "./components/PaymentMethods"
import MpesaPayment from "./components/MpesaPayment"
import CardPayment from "./components/CardPayment"

type PaymentMethod = "mpesa" | "bank_transfer" | "card"

// 💾 Storage keys
const STORAGE_KEYS = {
  MPESA_PHONE: 'mpesa_phone_number',
  SHIPPING_ADDRESS: 'saved_shipping_address',
  GUEST_EMAIL: 'saved_guest_email',
  GUEST_PHONE: 'saved_guest_phone'
}

export default function CheckoutPage() {
  const cart = useCartStore()
  const { items, subtotal, shippingCost, discount, totals, clearCart } = cart
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa")
  const [step, setStep] = useState<"shipping" | "payment">("shipping")
  const cartStore = useCartStore()
  const [orderSuccess, setOrderSuccess] = useState(false)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    const ensureCartReady = async () => {
      await cartStore.loadInitialData()
      if (!cartStore.selectedShippingAreaId && cartStore.shippingAreas.length > 0) {
        const firstActive = cartStore.shippingAreas.find(a => a.isActive)
        if (firstActive) {
          await cartStore.setShippingArea(firstActive._id)
          toast.success('Shipping area auto-selected')
        }
      }
    }
    ensureCartReady().catch(console.error)
  }, [cartStore])
  
  const [orderId, setOrderId] = useState("")
  const [orderNumber, setOrderNumber] = useState("")
  const [isGuest, setIsGuest] = useState(false)
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  
  // M-PESA state - with localStorage load
  const [mpesaPhone, setMpesaPhone] = useState("")
  const [mpesaStep, setMpesaStep] = useState<"idle" | "processing" | "pending" | "completed" | "failed">("idle")
  const [mpesaError, setMpesaError] = useState("")
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // 💾 Load saved M-PESA phone on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem(STORAGE_KEYS.MPESA_PHONE)
    if (savedPhone && savedPhone.length === 12) {
      setMpesaPhone(savedPhone)
      console.log('📱 Loaded saved phone:', savedPhone)
    }
  }, [])

  // 💾 Save M-PESA phone to localStorage when it changes
  const handleSetMpesaPhone = useCallback((phone: string) => {
    setMpesaPhone(phone)
    if (phone.length === 12) {
      localStorage.setItem(STORAGE_KEYS.MPESA_PHONE, phone)
      console.log('💾 Phone saved to localStorage:', phone)
    }
  }, [])

  // 💾 Clear saved phone (optional helper)
  const clearSavedPhone = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.MPESA_PHONE)
    setMpesaPhone('')
    toast.success('Saved phone number cleared')
  }, [])

  // Card payment state (for future Stripe implementation)
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardError, setCardError] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Shipping address state - with localStorage load
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "Kenya",
    phone: ""
  })

  // 💾 LOAD ALL SAVED DATA on mount - FIXED
  useEffect(() => {
    console.log('📦 Loading all saved data...');
    
    // Load shipping address
    const savedAddress = localStorage.getItem(STORAGE_KEYS.SHIPPING_ADDRESS)
    if (savedAddress) {
      try {
        const parsed = JSON.parse(savedAddress)
        console.log('📍 Loaded shipping address:', parsed)
        setShippingAddress(prev => ({ 
          ...prev, 
          ...parsed,
          // Ensure phone is properly formatted if present
          phone: parsed.phone || ''
        }))
      } catch (e) {
        console.error('Failed to load saved address:', e)
      }
    }
    
    // Load guest info
    const savedGuestEmail = localStorage.getItem(STORAGE_KEYS.GUEST_EMAIL)
    const savedGuestPhone = localStorage.getItem(STORAGE_KEYS.GUEST_PHONE)
    if (savedGuestEmail) {
      setGuestEmail(savedGuestEmail)
      console.log('📧 Loaded guest email:', savedGuestEmail)
    }
    if (savedGuestPhone) {
      setGuestPhone(savedGuestPhone)
      console.log('📱 Loaded guest phone:', savedGuestPhone)
    }
    
    setIsDataLoaded(true)
  }, []) // Empty dependency - run once on mount

  // 💾 SAVE shipping address to localStorage with DEBOUNCE - FIXED
  const handleSetShippingAddress = useCallback((
    address: typeof shippingAddress | ((prev: typeof shippingAddress) => typeof shippingAddress)
  ) => {
    const newAddress = typeof address === 'function' 
      ? address(shippingAddress) 
      : address;
    
    setShippingAddress(newAddress);
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce save to avoid excessive writes
    saveTimeoutRef.current = setTimeout(() => {
      // Save to localStorage if we have at least SOME data
      if (newAddress.fullName || newAddress.address1 || newAddress.phone) {
        localStorage.setItem(STORAGE_KEYS.SHIPPING_ADDRESS, JSON.stringify(newAddress));
        console.log('💾 Shipping address saved:', {
          name: newAddress.fullName || 'partial',
          phone: newAddress.phone || 'partial',
          city: newAddress.city || 'partial'
        });
      }
    }, 300);
  }, [shippingAddress]);

  // 💾 Save guest info to localStorage with debounce
  const handleSetGuestEmail = useCallback((email: string) => {
    setGuestEmail(email)
    if (email && email.includes('@')) {
      localStorage.setItem(STORAGE_KEYS.GUEST_EMAIL, email)
    }
  }, [])

  const handleSetGuestPhone = useCallback((phone: string) => {
    setGuestPhone(phone)
    if (phone && phone.length >= 10) {
      localStorage.setItem(STORAGE_KEYS.GUEST_PHONE, phone)
    }
  }, [])

  useEffect(() => {
    const token = getToken()
    setIsGuest(!token)
  }, [])

  const tax = cart.totals.tax || (subtotal * cart.taxRate)
  const total = cart.totals.total || totals.total
  const shipping = cart.totals.shippingCost || shippingCost
  const finalDiscount = cart.totals.discount || discount

  const isShippingValid = (): boolean => {
    return !!(
      shippingAddress.fullName &&
      shippingAddress.address1 &&
      shippingAddress.city &&
      shippingAddress.state &&
      shippingAddress.zip &&
      shippingAddress.phone &&
      shippingAddress.phone.length >= 10
    )
  }

  const isGuestInfoValid = (): boolean => {
    if (!isGuest) return true
    return !!(guestEmail && guestPhone && guestEmail.includes("@") && guestPhone.length >= 10)
  }

  // Clean up polling and save timeouts on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Prepare order data for creation
  const prepareOrderData = (paymentStatus: 'unpaid' | 'paid' = 'unpaid') => {
    const token = getToken()
    const isGuestUser = !token
    
    if (!cart.selectedShippingAreaId) {
      throw new Error('Please select a shipping area')
    }

    const orderData: any = {
      items: items.map((item) => ({
        productId: item.id,
        qty: item.qty,
        price: item.price,
        name: item.name,
        image: item.image
      })),
      subtotal: Number(subtotal),
      shippingCost: Number(shipping),
      discount: Number(finalDiscount),
      tax: Number(tax),
      total: Number(totals.total),
      shippingAreaId: cart.selectedShippingAreaId,
      promoCode: cart.promoCode || "",
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        address1: shippingAddress.address1.trim(),
        address2: shippingAddress.address2?.trim() || "",
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        zip: shippingAddress.zip.trim(),
        country: shippingAddress.country,
        phone: shippingAddress.phone.trim(),
        email: isGuestUser ? guestEmail.trim() : undefined
      },
      paymentMethod: "mpesa",
      paymentStatus: paymentStatus,
      status: paymentStatus === 'paid' ? 'processing' : 'pending',
      notes: ""
    }

    if (isGuestUser) {
      orderData.guestInfo = {
        email: guestEmail,
        phone: guestPhone,
        name: shippingAddress.fullName
      }
    }
    
    return orderData
  }

  const startPolling = useCallback((requestId: string, orderIdParam: string) => {
    let attempts = 0
    const maxAttempts = 60
    
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }
    
    const interval = setInterval(async () => {
      attempts++
      console.log(`📡 Polling (${attempts}/${maxAttempts}) for: ${requestId}`)
      
      try {
        // Query both transaction AND order status
        const [txStatus, orderResponse] = await Promise.all([
          checkPaymentStatus(requestId),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/orders/${orderIdParam}`)
        ])
        
        const orderStatus = await orderResponse.json()
        
        // Debug logging
        console.log('📊 Polling Results:', {
          txStatus,
          orderPaymentStatus: orderStatus.paymentStatus,
          orderStatus: orderStatus.status
        })
        
        // Check order payment status
        if (orderStatus.paymentStatus === 'paid' || txStatus.status === 'completed') {
          console.log('✅ Payment confirmed! Stopping polling.')
          clearInterval(interval)
          pollingRef.current = null
          
          setMpesaStep("completed")
          toast.success('✅ Payment confirmed!')
          
          // Wait a moment for database to settle
          setTimeout(() => {
            cart.clearCart()
            setOrderSuccess(true)
          }, 2000)
          return
        }
        
        if (txStatus.status === 'failed') {
          clearInterval(interval)
          pollingRef.current = null
          setMpesaStep("failed")
          setMpesaError(txStatus.resultDesc || 'Payment failed')
          return
        }
        
        if (attempts >= maxAttempts) {
          clearInterval(interval)
          pollingRef.current = null
          toast.error('Payment taking longer than expected. Check your email for confirmation.')
        }
        
      } catch (error) {
        console.error('Polling error:', error)
        if (attempts >= maxAttempts) {
          clearInterval(interval)
          pollingRef.current = null
        }
      }
    }, 3000)
    
    pollingRef.current = interval
  }, [cart])

  // Handle M-PESA payment - CREATE ORDER FIRST as UNPAID
  const handleMpesaPayment = async () => {
    // Format phone number to 2547XXXXXXXX
    let formattedPhone = mpesaPhone.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1)
    } else if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.substring(1)
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone
    }
    
    // Fix for 2540xxxxxx (extra zero)
    if (formattedPhone.startsWith('2540')) {
      formattedPhone = '254' + formattedPhone.slice(3)
    }
    
    if (formattedPhone.length !== 12 || !formattedPhone.startsWith('2547')) {
      setMpesaError("Please enter a valid phone number (e.g., 0712345678 or 254712345678)")
      return
    }

    // 💾 Save the formatted phone number
    localStorage.setItem(STORAGE_KEYS.MPESA_PHONE, formattedPhone)

    if (!isShippingValid()) {
      toast.error('Please complete shipping address')
      setStep("shipping")
      return
    }
    
    if (isGuest && !isGuestInfoValid()) {
      toast.error('Please complete guest information')
      setStep("shipping")
      return
    }

    if (!cart.selectedShippingAreaId) {
      toast.error('Please select a shipping area')
      setStep("shipping")
      return
    }

    setMpesaStep("processing")
    setMpesaError("")
    
    try {
      let existingOrderId = orderId
      
      // If no existing order, create a new one
      if (!existingOrderId) {
        const orderData = prepareOrderData('unpaid')
        toast.loading('Creating order...', { id: 'order-creation' })
        const createdOrder = await createOrder(orderData as any)
        existingOrderId = createdOrder._id
        const realOrderNumber = createdOrder.orderNumber
        setOrderId(existingOrderId)
        setOrderNumber(realOrderNumber)
        toast.success('Order created! Initiating payment...', { id: 'order-creation' })
      } else {
        // Check if order can retry payment
        const retryCheck = await checkCanRetry(existingOrderId)
        if (!retryCheck.canRetry) {
          toast.error('This order cannot be retried. Please create a new order.')
          setMpesaStep("failed")
          return
        }
        toast.loading('Initiating payment retry...', { id: 'payment-retry' })
      }
      
      // Initiate M-PESA payment with the order ID
      const response = await initiateMpesaPayment(existingOrderId, formattedPhone)
      setCheckoutRequestId(response.checkoutRequestId)
      setMpesaStep("pending")
      toast.success('STK Push sent! Check your phone for the M-PESA prompt.', { 
        id: 'payment-init',
        duration: 5000 
      })
      
      // Start polling for payment status
      startPolling(response.checkoutRequestId, existingOrderId)
      
    } catch (error: any) {
      console.error('M-PESA error:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Failed to initiate payment'
      setMpesaError(errorMsg)
      setMpesaStep("failed")
      toast.error(errorMsg)
    }
  }

  // Handle bank transfer order
  const handleBankTransferOrder = async () => {
    if (isSubmitting || loading) {
      toast.error('Please wait, order is already being processed...')
      return
    }

    try {
      setIsSubmitting(true)
      setLoading(true)
      
      const token = getToken()
      const isGuestUser = !token
      
      if (!cart.selectedShippingAreaId) {
        toast.error('Please select a shipping area')
        return
      }

      const orderData: any = {
        items: items.map((item) => ({
          productId: item.id,
          qty: item.qty,
          price: item.price,
          name: item.name,
          image: item.image
        })),
        subtotal: Number(subtotal),
        shippingCost: Number(shipping),
        discount: Number(finalDiscount),
        tax: Number(tax),
        total: Number(totals.total),
        shippingAreaId: cart.selectedShippingAreaId,
        promoCode: cart.promoCode || "",
        shippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          address1: shippingAddress.address1.trim(),
          address2: shippingAddress.address2?.trim() || "",
          city: shippingAddress.city.trim(),
          state: shippingAddress.state.trim(),
          zip: shippingAddress.zip.trim(),
          country: shippingAddress.country,
          phone: shippingAddress.phone.trim(),
          email: isGuestUser ? guestEmail.trim() : undefined
        },
        paymentMethod: 'bank_transfer',
        paymentStatus: 'unpaid',
        status: 'pending',
        notes: ""
      }

      if (isGuestUser) {
        orderData.guestInfo = {
          email: guestEmail,
          phone: guestPhone,
          name: shippingAddress.fullName
        }
      }

      const response = await createOrder(orderData as any)
      const newOrderId = response._id
      const newOrderNumber = response.orderNumber
      setOrderId(newOrderId)
      setOrderNumber(newOrderNumber)
      
      cart.clearCart()
      setOrderSuccess(true)
      
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || "Order failed"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  // Handle card payment (Coming Soon)
  const handleCardPayment = async () => {
    toast.error('💳 Card payments are coming soon! Please use M-PESA or Bank Transfer.', {
      duration: 5000,
      icon: '🚀'
    })
  }

  const resetMpesa = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setMpesaStep("idle")
    // Don't clear the phone number on reset - keep it for retry
    setMpesaError("")
    setCheckoutRequestId(null)
    // Keep orderId for potential retry
  }

  const clearSavedData = () => {
    // Clear all saved data
    localStorage.removeItem(STORAGE_KEYS.SHIPPING_ADDRESS)
    localStorage.removeItem(STORAGE_KEYS.GUEST_EMAIL)
    localStorage.removeItem(STORAGE_KEYS.GUEST_PHONE)
    localStorage.removeItem(STORAGE_KEYS.MPESA_PHONE)
    
    setShippingAddress({
      fullName: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      country: "Kenya",
      phone: ""
    })
    setGuestEmail("")
    setGuestPhone("")
    setMpesaPhone("")
    
    toast.success('All saved data cleared')
  }

  // Debug: Check if we have saved phone on load
  useEffect(() => {
    const savedPhone = localStorage.getItem(STORAGE_KEYS.MPESA_PHONE)
    console.log('🔍 Debug - Saved phone on load:', savedPhone)
  }, [])

  if (orderSuccess) return <OrderSuccess orderId={orderId} orderNumber={orderNumber} />
  if (items.length === 0) return <EmptyCart />

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/cart" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Back to Cart</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={clearSavedData}
                className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors px-2 py-1 rounded"
                title="Clear all saved data"
              >
                Clear All Data
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center shadow-lg ring-1 ring-blue-500/30">
                <span className="text-white text-xs font-bold">{items.length}</span>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Items</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
              <div className="flex">
                {[
                  { id: "shipping", label: "Shipping", icon: MapPin },
                  { id: "payment", label: "Payment", icon: CreditCard }
                ].map((tab, idx) => {
                  const Icon = tab.icon
                  const isActive = step === tab.id
                  const isCompleted = step === "payment" && tab.id === "shipping"
                  const isDisabled = tab.id === "payment" && (!isShippingValid() || (isGuest && !isGuestInfoValid()) || !cartStore.selectedShippingAreaId)
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (!cartStore.selectedShippingAreaId && tab.id === "payment") {
                          toast.error('Please select shipping area in Cart first')
                          return
                        }
                        if (!isDisabled) setStep(tab.id as any)
                      }}
                      disabled={isDisabled}
                      className={`flex-1 py-4 text-center font-semibold transition-all relative ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : isCompleted
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      } ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-700/30"}`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        <span className="text-sm">{tab.label}</span>
                      </div>
                      {idx === 0 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-6 bg-gray-200 dark:bg-gray-700" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === "shipping" && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ShippingForm
                    isGuest={isGuest}
                    guestEmail={guestEmail}
                    setGuestEmail={handleSetGuestEmail}
                    guestPhone={guestPhone}
                    setGuestPhone={handleSetGuestPhone}
                    shippingAddress={shippingAddress}
                    setShippingAddress={handleSetShippingAddress}
                    isShippingValid={isShippingValid}
                    isGuestInfoValid={isGuestInfoValid}
                    onContinue={() => setStep("payment")}
                  />
                </motion.div>
              )}

              {step === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
                    <div className="p-6 lg:p-8">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        Payment Method
                      </h2>

                      <PaymentMethods
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        resetMpesa={resetMpesa}
                        disabled={isSubmitting || loading}
                      />

                      {paymentMethod === "mpesa" && (
                        <MpesaPayment
                          mpesaPhone={mpesaPhone}
                          setMpesaPhone={handleSetMpesaPhone}
                          mpesaStep={mpesaStep}
                          mpesaError={mpesaError}
                          loading={loading || isSubmitting}
                          onRequest={handleMpesaPayment}
                          onReset={resetMpesa}
                          paymentMethod={paymentMethod}
                          total={total}
                          orderId={orderId}
                        />
                      )}

                      {paymentMethod === "bank_transfer" && (
                        <MpesaPayment
                          mpesaPhone=""
                          setMpesaPhone={() => {}}
                          mpesaStep="idle"
                          mpesaError=""
                          loading={loading}
                          onRequest={handleBankTransferOrder}
                          onReset={() => {}}
                          paymentMethod={paymentMethod}
                          total={total}
                        />
                      )}

                      {paymentMethod === "card" && (
                        <CardPayment
                          cardNumber={cardNumber}
                          setCardNumber={setCardNumber}
                          cardExpiry={cardExpiry}
                          setCardExpiry={setCardExpiry}
                          cardCvc={cardCvc}
                          setCardCvc={setCardCvc}
                          cardName={cardName}
                          setCardName={setCardName}
                          cardError={cardError}
                          loading={loading}
                          total={total}
                          onPay={handleCardPayment}
                        />
                      )}

                      <button
                        onClick={() => setStep("shipping")}
                        className="w-full mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium flex items-center justify-center gap-1 group"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Shipping
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary 
              items={items} 
              subtotal={cart.totals.subtotal || subtotal} 
              tax={cart.totals.tax || tax} 
              total={cart.totals.total || totals.total}
              paymentMethod={paymentMethod} 
              step={step}
              shippingAddress={shippingAddress}
              isGuest={isGuest}
              guestEmail={guestEmail}
              guestPhone={guestPhone} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}