// src/app/checkout/components/MpesaPayment.tsx
'use client'

import { Shield, Smartphone, Clock, AlertCircle, CheckCircle } from 'lucide-react'

interface MpesaPaymentProps {
  mpesaPhone: string
  setMpesaPhone: (phone: string) => void
  mpesaCode: string
  setMpesaCode: (code: string) => void
  mpesaStep: 'request' | 'verify' | 'processing'
  mpesaError: string
  countdown: number
  loading: boolean
  onRequest: () => void
  onVerify: () => void
  onReset: () => void
}

export default function MpesaPayment({
  mpesaPhone,
  setMpesaPhone,
  mpesaCode,
  setMpesaCode,
  mpesaStep,
  mpesaError,
  countdown,
  loading,
  onRequest,
  onVerify,
  onReset
}: MpesaPaymentProps) {
  return (
    <div className="space-y-6 mb-8 p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50">
      <div className="flex flex-col items-center text-center py-8">
        <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mb-4">
          <Smartphone className="w-10 h-10 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">M-PESA Payments Coming Soon</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">M-PESA integration will be available shortly. Currently we accept Cash on Delivery.</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Total: KSh {countdown.toLocaleString()}</p>
      </div>
    </div>
  )
}
