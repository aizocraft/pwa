// src/app/checkout/components/MpesaPayment.tsx
'use client'

import { Shield, Smartphone, Clock, AlertCircle, CheckCircle, Copy, Loader2, Banknote } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface MpesaPaymentProps {
  mpesaPhone: string
  setMpesaPhone: (phone: string) => void
  mpesaStep: 'idle' | 'processing' | 'pending' | 'completed' | 'failed'
  mpesaError: string
  loading: boolean
  onRequest: () => void
  onReset: () => void
  paymentMethod?: string
  total?: number
  orderId?: string
}

export default function MpesaPayment({
  mpesaPhone,
  setMpesaPhone,
  mpesaStep,
  mpesaError,
  loading,
  onRequest,
  onReset,
  paymentMethod,
  total,
  orderId
}: MpesaPaymentProps) {
  const [copied, setCopied] = useState(false)

  // Bank details for bank transfer
  const bankDetails = {
    bankName: "KENYA COMMERCIAL BANK (KCB)",
    accountName: "PLASMA WATER AFRICA",
    accountNumber: "1312281278",
    branch: "Moi Avenue, Nairobi",
  }

  // M-PESA Paybill details
  const mpesaDetails = {
    businessName: "PLASMA WATER AFRICA",
    paybill: "9114123",
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(`${label} copied!`)
    setTimeout(() => setCopied(false), 2000)
  }

  // Show Bank Transfer UI
  if (paymentMethod === 'bank_transfer') {
    return (
      <div className="space-y-6 mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 to-white/50 dark:from-blue-950/20 dark:to-gray-800/50 border border-blue-200 dark:border-blue-800">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 space-y-3 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">Bank Name:</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{bankDetails.bankName}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">Account Name:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{bankDetails.accountName}</span>
              <button onClick={() => copyToClipboard(bankDetails.accountName, "Account Name")} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                {copied ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">Account Number:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">{bankDetails.accountNumber}</span>
              <button onClick={() => copyToClipboard(bankDetails.accountNumber, "Account Number")} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                {copied ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Amount to Pay:</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">KES {total?.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={onRequest}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          <span>I've Made the Transfer</span>
        </button>
      </div>
    )
  }

  // Show Cash on Delivery UI
  if (paymentMethod === 'cash') {
    return (
      <div className="space-y-6 mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 to-white/50 dark:from-blue-950/20 dark:to-gray-800/50 border border-blue-200 dark:border-blue-800">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Amount to Pay on Delivery:</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">KES {total?.toLocaleString()}</span>
          </div>
        </div>
       
        <button
          onClick={onRequest}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          <span>Place Order Now</span>
        </button>
      </div>
    )
  }

  // Show M-PESA Paybill UI with real STK Push
  return (
    <div className="space-y-6 mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 to-white/50 dark:from-blue-950/20 dark:to-gray-800/50 border border-blue-200 dark:border-blue-800">
      {mpesaStep === 'idle' && (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 space-y-3 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">Paybill Number:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">{mpesaDetails.paybill}</span>
                <button onClick={() => copyToClipboard(mpesaDetails.paybill, "Paybill Number")} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  <Copy className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Amount:</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">KES {total?.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="tel"
              value={mpesaPhone}
              onChange={(e) => setMpesaPhone(e.target.value)}
              placeholder="M-PESA Phone Number (e.g., 0712345678)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {mpesaError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {mpesaError}
              </p>
            )}
            <button
              onClick={onRequest}
              disabled={loading || !mpesaPhone}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
              <span>Pay with M-PESA</span>
            </button>
          </div>
        </>
      )}

      {mpesaStep === 'processing' && (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300">Creating your order...</p>
        </div>
      )}

      {mpesaStep === 'pending' && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">STK Push Sent!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Check your phone for the M-PESA prompt</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your PIN to complete payment</p>
          <button
            onClick={onReset}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700"
          >
            Cancel and try again
          </button>
        </div>
      )}

      {mpesaStep === 'completed' && (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 font-medium">Payment Successful!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Redirecting...</p>
        </div>
      )}

      {mpesaStep === 'failed' && (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 font-medium">Payment Failed</p>
          <p className="text-sm text-red-500 mt-1">{mpesaError || 'Please try again'}</p>
          <button
            onClick={onReset}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}