'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, CreditCard, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useCartStore } from "../../store/cart"
import { formatCurrency } from "../../lib/utils"
import { createOrder } from "../../lib/api"
import { getToken } from "../../lib/auth"
import toast from "react-hot-toast"

import OrderSummary from "./components/OrderSummary"
import OrderSuccess from "./components/OrderSuccess"
import EmptyCart from "./components/EmptyCart"
import ShippingForm from "./components/ShippingForm"
import PaymentMethods from "./components/PaymentMethods"
import MpesaPayment from "./components/MpesaPayment"
import CardPayment from "./components/CardPayment"

type PaymentMethod = "cod" | "mpesa" | "card"

export default function CheckoutPage() {
  const cart = useCartStore()
  const { items, subtotal, shippingCost, discount, totals, clearCart } = cart
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod")
  const [step, setStep] = useState<"shipping" | "payment">("shipping")
  const cartStore = useCartStore()
  const [orderSuccess, setOrderSuccess] = useState(false)
  
  // Auto-rehydrate and auto-select shipping area if missing
  useEffect(() => {
    const ensureCartReady = async () => {
      await cartStore.loadInitialData()
      
      // Auto-select first area if none selected but areas available
      if (!cartStore.selectedShippingAreaId && cartStore.shippingAreas.length > 0) {
        const firstActive = cartStore.shippingAreas.find(a => a.isActive)
        if (firstActive) {
          await cartStore.setShippingArea(firstActive._id)
          toast.success('Shipping area auto-selected')
        }
      }
    }
    
    ensureCartReady().catch(console.error)
  }, [])
  const [orderId, setOrderId] = useState("")
  const [isGuest, setIsGuest] = useState(false)
  
  // Guest info state
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  
  // M-PESA state
  const [mpesaPhone, setMpesaPhone] = useState("")
  const [mpesaCode, setMpesaCode] = useState("")
  const [mpesaStep, setMpesaStep] = useState<"request" | "verify" | "processing">("request")
  const [mpesaError, setMpesaError] = useState("")
  const [countdown, setCountdown] = useState(60)
  
  // Card payment state
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardError, setCardError] = useState("")
  
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

  // Check guest status
  useEffect(() => {
    const token = getToken()
    setIsGuest(!token)
  }, [])

const tax = cart.totals.tax || (subtotal * 0.16)
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

  const handleMpesaRequest = () => {
    if (!mpesaPhone || mpesaPhone.length < 10) {
      setMpesaError("Please enter a valid phone number (e.g., 254700000000)")
      return
    }
    setMpesaError("")
    setMpesaStep("processing")
    setTimeout(() => {
      setMpesaStep("verify")
      let timer = 60
      const interval = setInterval(() => {
        timer--
        setCountdown(timer)
        if (timer <= 0) {
          clearInterval(interval)
          setMpesaError("Code expired. Please request again.")
          setMpesaStep("request")
        }
      }, 1000)
      return () => clearInterval(interval)
    }, 1500)
  }

  const handleMpesaVerify = async () => {
    if (!mpesaCode || mpesaCode.length < 4) {
      setMpesaError("Please enter the 4-digit verification code")
      return
    }
    setMpesaError("")
    setLoading(true)
    setTimeout(async () => {
      if (mpesaCode.length === 4 && /^\d+$/.test(mpesaCode)) {
        await handlePlaceOrder()
      } else {
        setMpesaError("Invalid verification code. Please try again.")
        setLoading(false)
      }
    }, 1500)
  }

  const handleCardPayment = async () => {
    const cleanCardNumber = cardNumber.replace(/\s/g, "")
    if (!cleanCardNumber || cleanCardNumber.length < 15) {
      setCardError("Please enter a valid card number")
      return
    }
    if (!cardExpiry || !cardExpiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      setCardError("Please enter a valid expiry date (MM/YY)")
      return
    }
    if (!cardCvc || cardCvc.length < 3) {
      setCardError("Please enter a valid CVC")
      return
    }
    if (!cardName) {
      setCardError("Please enter the cardholder name")
      return
    }
    setCardError("")
    setLoading(true)
    setTimeout(async () => {
      await handlePlaceOrder()
    }, 2000)
  }

  const handlePlaceOrder = async () => {
    try {
      const token = getToken()
      const isGuestUser = !token
      const apiPaymentMethod = paymentMethod === "cod" ? "cod" : paymentMethod
      
      const calculatedTax = subtotal * 0.16
      
      console.log("=== ORDER CALCULATIONS (Dynamic) ===")
      console.log("Subtotal:", subtotal)
      console.log("Shipping:", shippingCost)
      console.log("Discount:", discount)
      console.log("Tax:", calculatedTax)
      console.log("Total:", totals.total)
      
      // Validate required fields
      if (!cart.selectedShippingAreaId) {
        toast.error('Please select a shipping area');
        return;
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
        shippingAreaId: cart.selectedShippingAreaId!, // Non-null guaranteed
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
        paymentMethod: apiPaymentMethod,
        notes: ""
      }

      console.log('🚀 Validated orderData:', {
        shippingAreaId: orderData.shippingAreaId,
        promoCode: orderData.promoCode,
        subtotal: orderData.subtotal,
        discount: orderData.discount,
        total: orderData.total
      });
      console.log('✅ FIXED: discount sent to backend:', finalDiscount);

      if (isGuestUser) {
        orderData.guestInfo = {
          email: guestEmail,
          phone: guestPhone,
          name: shippingAddress.fullName
        }
      }


      console.log("Order data:", orderData)

      const response = await createOrder(orderData as any)

      console.log("Order created:", response)

      const newOrderId = response._id
      if (!newOrderId) {
        throw new Error("No order ID received")
      }

      setOrderId(newOrderId)

      if (isGuestUser) {
        const guestOrders = JSON.parse(localStorage.getItem("guest_orders") || "[]")
        guestOrders.push({
          ...response,
          _id: newOrderId,
          orderNumber: response.orderNumber || `ORD-${newOrderId.slice(-8).toUpperCase()}`,
          subtotal,
          shippingCost,
          tax: calculatedTax,
          total: totals.total
        })
        localStorage.setItem("guest_orders", JSON.stringify(guestOrders))
      }

      cart.clearCart()
      setOrderSuccess(true)
    } catch (error: any) {
      console.error("Order error:", error)
      const msg = error.response?.data?.error || error.message || "Order failed"
      
      if (paymentMethod === "mpesa") {
        setMpesaError(msg)
      } else if (paymentMethod === "card") {
        setCardError(msg)
      }
      
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const resetMpesa = () => {
    setMpesaStep("request")
    setMpesaCode("")
    setMpesaError("")
    setCountdown(60)
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

  if (orderSuccess) return <OrderSuccess orderId={orderId} />
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
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
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        Payment Method
                      </h2>

                      <PaymentMethods
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        resetMpesa={resetMpesa}
                      />

                      {paymentMethod === "mpesa" && (
                        <MpesaPayment
                          mpesaPhone={mpesaPhone}
                          setMpesaPhone={setMpesaPhone}
                          mpesaCode={mpesaCode}
                          setMpesaCode={setMpesaCode}
                          mpesaStep={mpesaStep}
                          mpesaError={mpesaError}
                          countdown={countdown}
                          loading={loading}
                          onRequest={handleMpesaRequest}
                          onVerify={handleMpesaVerify}
                          onReset={resetMpesa}
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

                      {paymentMethod === "cod" && (
                        <button
                          onClick={handlePlaceOrder}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                        >
{loading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Processing Order...
                            </>
                          ) : (
                            <>
                              <span>Place Order - {formatCurrency(total)}</span>
                            </>
                          )}
                        </button>
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
