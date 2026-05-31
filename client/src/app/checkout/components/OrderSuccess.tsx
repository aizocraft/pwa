// src/app/checkout/components/OrderSuccess.tsx
'use client'

import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface OrderSuccessProps {
  orderId: string
  orderNumber?: string
}

export default function OrderSuccess({ orderId, orderNumber }: OrderSuccessProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 lg:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 lg:p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto">
              <div className="absolute inset-0 animate-ping">
                <div className="w-24 h-24 rounded-full bg-green-400 opacity-20"></div>
              </div>
              <div className="relative w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          
          <div className="mt-6 mb-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl inline-block mx-auto">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Order Number: <span className="font-bold text-gray-900 dark:text-white text-lg">{orderNumber || orderId}</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push(`/orders/${orderId}`)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/25 hover:scale-[1.02] flex items-center justify-center gap-2 group"
            >
              <Package className="w-5 h-5" />
              View Order Details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}