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
    <div className="space-y-4 mb-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <p className="text-sm text-purple-800 dark:text-purple-300">Test Card: 4242 4242 4242 4242 | Exp: 12/25 | CVC: 123</p>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cardholder Name *</label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-shadow"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Number *</label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\s/g, '');
            if (value.length <= 16) {
              setCardNumber(value.match(/.{1,4}/g)?.join(' ') || value);
            }
          }}
          placeholder="4242 4242 4242 4242"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date *</label>
          <input
            type="text"
            value={cardExpiry}
            onChange={(e) => setCardExpiry(e.target.value)}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CVC *</label>
          <input
            type="text"
            value={cardCvc}
            onChange={(e) => setCardCvc(e.target.value)}
            placeholder="123"
            maxLength={4}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
      </div>
      
      {cardError && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3">
          <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span>{cardError}</span>
          </div>
        </div>
      )}
      
      <button
        onClick={onPay}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay {formatCurrency(total)}
          </>
        )}
      </button>
    </div>
  )
}