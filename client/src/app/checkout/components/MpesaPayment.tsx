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
    <div className="space-y-4 mb-6">
      {mpesaStep === 'request' && (
        <>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Secure M-PESA Payment</p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">You will receive a payment request on your M-PESA registered phone number</p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">M-PESA Phone Number *</label>
            <input
              type="tel"
              value={mpesaPhone}
              onChange={(e) => setMpesaPhone(e.target.value)}
              placeholder="254700000000"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-shadow"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Format: 254700000000 (without +)</p>
          </div>
          
          {mpesaError && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span>{mpesaError}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={onRequest}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Smartphone className="w-5 h-5" />
            Request Payment
          </button>
        </>
      )}

      {mpesaStep === 'processing' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-full h-full border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">Sending payment request...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please wait</p>
        </div>
      )}

      {mpesaStep === 'verify' && (
        <>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Code expires in: {countdown} seconds</p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Enter the 4-digit code sent to {mpesaPhone}</p>
              </div>
              <button onClick={onReset} className="text-xs text-blue-600 hover:text-blue-700">Cancel</button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verification Code *</label>
            <input
              type="text"
              value={mpesaCode}
              onChange={(e) => setMpesaCode(e.target.value)}
              placeholder="Enter 4-digit code"
              maxLength={4}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-center text-2xl tracking-widest"
            />
          </div>
          
          {mpesaError && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span>{mpesaError}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={onVerify}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Verify & Complete Order
              </>
            )}
          </button>
        </>
      )}
    </div>
  )
}