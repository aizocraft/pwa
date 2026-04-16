// src/app/checkout/components/CardPayment.tsx
'use client'

import { Shield, CreditCard, AlertCircle } from 'lucide-react'
import { formatCurrency } from '../../../lib/utils'

interface CardPaymentProps {
  cardNumber: string
  setCardNumber: (number: string) => void
  cardExpiry: string
  setCardExpiry: (expiry: string) => void
  cardCvc: string
  setCardCvc: (cvc: string) => void
  cardName: string
  setCardName: (name: string) => void
  cardError: string
  loading: boolean
  total: number
  onPay: () => void
}

export default function CardPayment({
  cardNumber,
  setCardNumber,
  cardExpiry,
  setCardExpiry,
  cardCvc,
  setCardCvc,
  cardName,
  setCardName,
  cardError,
  loading,
  total,
  onPay
}: CardPaymentProps) {
  return (
    <div className="space-y-6 mb-8 p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50">
      <div className="flex flex-col items-center text-center py-8">
        <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mb-4">
          <CreditCard className="w-10 h-10 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Credit/Debit Cards Coming Soon</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">Card payments will be available shortly. Currently we accept Cash on Delivery and M-PESA.</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Total: <span className="font-semibold">{formatCurrency(total)}</span></p>
      </div>
    </div>
  )
}
