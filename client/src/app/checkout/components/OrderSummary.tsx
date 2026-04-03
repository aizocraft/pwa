// src/app/checkout/components/OrderSummary.tsx
'use client'

import { Package, Truck, CreditCard, Smartphone } from 'lucide-react'
import { formatCurrency } from '../../../lib/utils'

interface OrderSummaryProps {
  items: any[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  paymentMethod: string
  step: string
}

export default function OrderSummary({ items, subtotal, shipping, tax, total, paymentMethod, step }: OrderSummaryProps) {
  return (
    <div className="sticky top-24 bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
      <div className="p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Order Summary
        </h2>

        <div className="space-y-4 max-h-80 overflow-y-auto mb-6 pr-2 custom-scrollbar">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 group">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-xl"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }}
                />
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  {item.qty}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                  {item.name}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(item.price * item.qty)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Shipping</span>
            <span className="text-green-600 dark:text-green-400 font-medium">
              {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tax (16% VAT)</span>
            <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(tax)}</span>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-900 dark:text-white font-semibold">Total</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        {step === 'payment' && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
              {paymentMethod === 'cod' && <Truck className="w-4 h-4 text-blue-600" />}
              {paymentMethod === 'mpesa' && <Smartphone className="w-4 h-4 text-green-600" />}
              {paymentMethod === 'card' && <CreditCard className="w-4 h-4 text-purple-600" />}
              <span className="flex-1">
                Paying with: <span className="font-medium text-gray-900 dark:text-white">
                  {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'mpesa' ? 'M-PESA' : 'Card'}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}