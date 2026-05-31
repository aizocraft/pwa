// src/app/checkout/page.tsx - With Card Payment (Coming Soon)

'use client'

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, CreditCard, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCartStore } from "../../store/cart"
import { formatCurrency } from "../../lib/utils"
import { initiateMpesaPayment, checkPaymentStatus, createOrder, cancelOrder } from "../../lib/api"
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

export default function CheckoutPage() {
  const router = useRouter()
  const cart = useCartStore()
  const { items, subtotal, shippingCost, discount, totals, clearCart } = cart
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa")
  const [step, setStep] = useState<"shipping" | "payment">("shipping")
  const cartStore = useCartStore()
  const [orderSuccess, setOrderSuccess] = useState(false)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  
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
  
  // M-PESA state
  const [mpesaPhone, setMpesaPhone] = useState("")
  const [mpesaStep, setMpesaStep] = useState<"idle" | "processing" | "pending" | "completed" | "failed">("idle")
  const [mpesaError, setMpesaError] = useState("")
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null)

  // Card payment state (for future Stripe implementation)
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardError, setCardError] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Shipping address state
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
      shippingAddress.phone
    )
  }

  const isGuestInfoValid = (): boolean => {
    if (!isGuest) return true
    return !!(guestEmail && guestPhone && guestEmail.includes("@"))
  }

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
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
      paymentMethod: paymentMethod,
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

  // Start polling for M-PESA payment status
  const startPolling = useCallback((requestId: string, orderIdParam: string) => {
    let attempts = 0
    const maxAttempts = 60 // 3 minutes
    let isResolved = false
    
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }
    
    const interval = setInterval(async () => {
      if (isResolved) return
      
      attempts++
      console.log(`📡 Polling payment (${attempts}/${maxAttempts}) for: ${requestId}`)
      
      try {
        const result = await checkPaymentStatus(requestId)
        console.log(`📊 Status response:`, result.status, result.resultDesc)
        
        if (result.status === 'completed') {
          isResolved = true
          clearInterval(interval)
          pollingRef.current = null
          
          setMpesaStep("completed")
          toast.success('✅ Payment confirmed! Your order is complete.', { duration: 5000 })
          
          setTimeout(() => {
            cart.clearCart()
            setOrderSuccess(true)
          }, 1500)
          return
        }
        
        if (result.status === 'failed') {
          isResolved = true
          clearInterval(interval)
          pollingRef.current = null
          
          setMpesaStep("failed")
          setMpesaError(result.resultDesc || 'Payment failed. Please try again.')
          toast.error('❌ Payment failed. Please try again.')
          return
        }
        
        if (result.status === 'pending' && attempts < maxAttempts) {
          return
        }
        
        if (attempts >= maxAttempts && result.status === 'pending') {
          isResolved = true
          clearInterval(interval)
          pollingRef.current = null
          
          setMpesaStep("pending")
          toast.error('⏳ Payment is taking longer than expected. Please check your M-PESA and refresh the page.', {
            duration: 10000,
            id: 'payment-timeout'
          })
          return
        }
        
      } catch (error) {
        console.error('Polling error:', error)
        
        if (attempts >= maxAttempts) {
          clearInterval(interval)
          pollingRef.current = null
          setMpesaStep("pending")
          toast.error('Unable to verify payment status. Please check your order status manually.', {
            duration: 8000
          })
        }
      }
    }, 3000)
    
    pollingRef.current = interval
  }, [cart])

  // Handle M-PESA payment
  const handleMpesaPayment = async () => {
    let formattedPhone = mpesaPhone.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1)
    } else if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.substring(1)
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone
    }
    
    if (formattedPhone.length !== 12 || !formattedPhone.startsWith('2547')) {
      setMpesaError("Please enter a valid phone number (e.g., 0712345678 or 254712345678)")
      return
    }

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
      const orderData = prepareOrderData('unpaid')
      toast.loading('Creating order...', { id: 'order-creation' })
      const createdOrder = await createOrder(orderData as any)
      const realOrderId = createdOrder._id
      const realOrderNumber = createdOrder.orderNumber
      setOrderId(realOrderId)
      setOrderNumber(realOrderNumber)
      
      toast.success('Order created! Initiating payment...', { id: 'order-creation' })
      
      const response = await initiateMpesaPayment(realOrderId, formattedPhone)
      setCheckoutRequestId(response.checkoutRequestId)
      setMpesaStep("pending")
      toast.success('STK Push sent! Check your phone for the M-PESA prompt.', { duration: 5000 })
      
      startPolling(response.checkoutRequestId, realOrderId)
      
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
    setMpesaPhone("")
    setMpesaError("")
    setCheckoutRequestId(null)
  }

  const clearSavedData = () => {
    localStorage.removeItem("saved_shipping_address")
    localStorage.removeItem("saved_guest_email")
    localStorage.removeItem("saved_guest_phone")
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
  }

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
                title="Clear saved data"
              >
                Clear Data
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
                    setGuestEmail={setGuestEmail}
                    guestPhone={guestPhone}
                    setGuestPhone={setGuestPhone}
                    shippingAddress={shippingAddress}
                    setShippingAddress={setShippingAddress}
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
                          setMpesaPhone={setMpesaPhone}
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