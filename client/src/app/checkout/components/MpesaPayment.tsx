// src/app/checkout/components/MpesaPayment.tsx
'use client'

import { Smartphone, Clock, AlertCircle, CheckCircle, Loader2, Copy } from 'lucide-react'
import { useState, useEffect } from 'react'
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

  // 💾 Load saved phone number on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem('mpesa_phone_number')
    if (savedPhone && !mpesaPhone) {
      setMpesaPhone(savedPhone)
     
    }
  }, []) // Run only once on mount

  // Bank details for bank transfer
  const bankDetails = {
    bankName: "KENYA COMMERCIAL BANK (KCB)",
    accountName: "PLASMA WATER AFRICA",
    accountNumber: "1312281278",
    branch: "Moi Avenue, Nairobi",
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(`${label} copied!`)
    setTimeout(() => setCopied(false), 2000)
  }

  // Validate phone number as user types
  const validatePhoneInput = (value: string) => {
    let cleaned = value.replace(/\D/g, '')
    
    if (cleaned.length > 12) {
      cleaned = cleaned.slice(0, 12)
    }
    
    if (cleaned.startsWith('0') && cleaned.length <= 10) {
      cleaned = '254' + cleaned.slice(1)
    }
    
    // Fix for 2540xxxxxx (extra zero)
    if (cleaned.startsWith('2540')) {
      cleaned = '254' + cleaned.slice(3)
    }
    
    return cleaned
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = validatePhoneInput(e.target.value)
    setMpesaPhone(formatted)
    
    // 💾 Save to localStorage as user types
    if (formatted.length === 12) {
      localStorage.setItem('mpesa_phone_number', formatted)
      console.log('💾 Phone saved to localStorage:', formatted)
    }
  }

  // Function to clear saved phone (optional - add a clear button)
  const clearSavedPhone = () => {
    localStorage.removeItem('mpesa_phone_number')
    setMpesaPhone('')
    toast.success('Saved phone number cleared')
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

  // Show M-PESA UI
  return (
    <div className="space-y-6 mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 to-white/50 dark:from-blue-950/20 dark:to-gray-800/50 border border-blue-200 dark:border-blue-800">
      {mpesaStep === 'idle' && (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 space-y-3 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Amount:</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">KES {total?.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  M-PESA Phone Number
                </label>
                {localStorage.getItem('mpesa_phone_number') && (
                  <button
                    onClick={clearSavedPhone}
                    className="text-xs text-red-500 hover:text-red-600 transition-colors"
                  >
                    Clear saved
                  </button>
                )}
              </div>
              <input
                type="tel"
                value={mpesaPhone}
                onChange={handlePhoneChange}
                placeholder="254712345678"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Format: 254XXXXXXXXX (12 digits total)
              </p>
              {localStorage.getItem('mpesa_phone_number') && !mpesaPhone && (
                <p className="text-xs text-blue-500 mt-1">
                  💾 Saved number will auto-load on next visit
                </p>
              )}
            </div>
            {mpesaError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {mpesaError}
              </p>
            )}
            <button
              onClick={onRequest}
              disabled={loading || !mpesaPhone || mpesaPhone.length !== 12}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
              <span>{orderId ? 'Retry Payment' : 'Pay with M-PESA'}</span>
            </button>
          </div>
        </>
      )}

      {mpesaStep === 'processing' && (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300">{orderId ? 'Processing payment retry...' : 'Creating your order...'}</p>
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
          <div className="mt-4 space-y-2">
            <button
              onClick={onRequest}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {orderId ? 'Retry Payment' : 'Try Again'}
            </button>
            <button
              onClick={onReset}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm block mx-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}