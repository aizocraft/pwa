'use client'

import { Package, Truck, CreditCard, Smartphone, Gift, MapPin, User, Landmark, Banknote, Tag } from 'lucide-react'
import { useCartStore } from '../../../store/cart'
import { formatCurrency } from '../../../lib/utils'

interface ShippingAddress {
  fullName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email?: string;
}

interface OrderSummaryProps {
  items: any[]
  subtotal: number
  tax: number
  total: number
  paymentMethod?: string
  step?: string
  shippingAddress: ShippingAddress
  isGuest: boolean
  guestEmail?: string
  guestPhone?: string
}

const getPaymentMethodInfo = (method: string) => {
  switch (method) {
    case 'cash':
      return { icon: Banknote, label: 'Cash', color: 'blue' }
    case 'mpesa':
      return { icon: Smartphone, label: 'M-PESA', color: 'blue' }
    case 'bank_transfer':
      return { icon: Landmark, label: 'Bank Transfer', color: 'blue' }
    case 'card':
      return { icon: CreditCard, label: 'Credit/Debit Card', color: 'gray' }
    default:
      return { icon: Truck, label: 'Cash on Delivery', color: 'blue' }
  }
}

export default function OrderSummary({ 
  items, 
  subtotal, 
  paymentMethod = "",
  step = "",
  shippingAddress,
  isGuest = false,
  guestEmail = "",
  guestPhone = ""
}: OrderSummaryProps) {
  const cart = useCartStore()
  
  // Get values from cart store
  const shippingCost = cart.totals.shippingCost || cart.shippingCost || 0
  const discount = cart.totals.discount || cart.discount || 0
  const promoCode = cart.promoCode
  const promoValid = cart.promoValid
  const taxRate = cart.taxRate || 0.16
  
  // IMPORTANT: Calculate taxable and tax-exempt subtotals directly from items
  // This ensures the calculation is correct and matches what's displayed
  let taxableTotal = 0
  let taxExemptTotal = 0
  
  for (const item of items) {
    const itemTotal = item.price * item.qty
    if (item.isTaxExempt === true) {
      taxExemptTotal += itemTotal
    } else {
      taxableTotal += itemTotal
    }
  }
  
  // Calculate tax ONLY on taxable items
  const calculatedTax = taxableTotal * taxRate
  const hasTaxExemptItems = taxExemptTotal > 0
  const hasTaxableItems = taxableTotal > 0
  
  // Calculate total
  const calculatedTotal = taxableTotal + taxExemptTotal + shippingCost + calculatedTax - discount

  const getDisplayEmail = () => {
    if (!isGuest) return 'Your account email'
    return guestEmail || 'Add guest email'
  }

  const getDisplayPhone = () => {
    if (!isGuest) return 'Your account phone'
    return guestPhone || 'Add guest phone'
  }

  const formatAddress = () => {
    const parts = [
      shippingAddress.address1,
      shippingAddress.address2 && `, ${shippingAddress.address2}`.trim(),
      shippingAddress.city,
      shippingAddress.state,
      `${shippingAddress.zip} ${shippingAddress.country}`
    ].filter(Boolean).join(', ')
    return parts || 'Address not complete'
  }

  const paymentInfo = paymentMethod ? getPaymentMethodInfo(paymentMethod) : null
  const PaymentIcon = paymentInfo?.icon || Truck

  return (
    <div className="sticky top-24 bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
      <div className="p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Order Summary
        </h2>

        <div className="space-y-4 max-h-80 overflow-y-auto mb-6 pr-2">
          {items.slice(0, 4).map((item, idx) => (
            <div key={item.id || idx} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl group hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src={item.image || '/placeholder.svg'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                      ;(e.target as HTMLImageElement).parentElement!.innerHTML = '<Package className="w-8 h-8 text-gray-400" />'
                    }}
                  />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                    {item.qty}
                  </div>
                </div>

              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">
                  {item.name}
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(item.price * item.qty)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(item.price)} each × {item.qty}
                </p>
                {item.isTaxExempt && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400 mt-0.5">
                    <Tag className="w-2.5 h-2.5" />
                    Tax exempt
                  </span>
                )}
              </div>
            </div>
          ))}
          {items.length > 4 && (
            <div className="text-center py-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                +{items.length - 4} more items
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Subtotal</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
          </div>
          
          {/* Tax Breakdown - Show ONLY when there are tax-exempt items */}
          {hasTaxExemptItems && (
            <div className="space-y-1 pl-2 border-l-2 border-green-500">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Taxable items</span>
                <span>{formatCurrency(taxableTotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-green-600 dark:text-green-400">
                <span>Tax-exempt items</span>
                <span>{formatCurrency(taxExemptTotal)}</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center text-sm p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
            <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
              <Truck className="w-4 h-4" />
              Shipping
            </span>
            <span className={`font-semibold ${shippingCost === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
              {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
            </span>
          </div>

          {promoValid && discount > 0 && (
            <div className="flex justify-between items-center text-sm p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-400">
                  Promo: {promoCode}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-green-600 dark:text-green-400">
                  -{formatCurrency(discount)}
                </span>
              </div>
            </div>
          )}

          {/* Tax Display - Show only when there are taxable items */}
          {hasTaxableItems && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Tax ({(taxRate * 100).toFixed(0)}% VAT)
                {hasTaxExemptItems && <span className="text-xs text-gray-400 ml-1">on taxable items</span>}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(calculatedTax)}</span>
            </div>
          )}

          {/* Show tax-exempt note when all items are tax-exempt */}
          {!hasTaxableItems && hasTaxExemptItems && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tax ({(taxRate * 100).toFixed(0)}% VAT)</span>
              <span className="font-semibold text-green-600 dark:text-green-400">Ksh 0.00 (Exempt)</span>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 p-4 rounded-xl">
            <div className="flex justify-between items-end">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Total</span>
              <div className="text-right">
                <span className="text-3xl font-black bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent tracking-tight">
                  {formatCurrency(calculatedTotal)}
                </span>
               
              </div>
            </div>
          </div>


          {/* Payment Method Display */}
          {step === "payment" && paymentMethod && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <PaymentIcon className="w-4 h-4" />
                  {paymentInfo?.label}
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
          )}

          {/* Shipping Address Preview */}
          <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Delivery To
            </h4>
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 p-4 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
                    {shippingAddress.fullName || 'Name'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-1 leading-tight">
                    {formatAddress()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    📧 {getDisplayEmail()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                    📱 {getDisplayPhone()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}