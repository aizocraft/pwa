// src/app/checkout/components/PaymentMethods.tsx
'use client'

import { Smartphone, Landmark, CreditCard } from 'lucide-react'

interface PaymentMethodsProps {
  paymentMethod: string
  setPaymentMethod: (method: any) => void
  resetMpesa: () => void
  disabled?: boolean
}

export default function PaymentMethods({ paymentMethod, setPaymentMethod, resetMpesa, disabled = false }: PaymentMethodsProps) {
  const methods = [
    { id: 'mpesa', label: 'M-PESA', icon: Smartphone, description: 'Pay using M-PESA mobile money', comingSoon: false },
    { id: 'bank_transfer', label: 'Bank Transfer', icon: Landmark, description: 'Pay via bank transfer', comingSoon: false },
    { id: 'card', label: 'Card Payment', icon: CreditCard, description: 'Credit / Debit Card (Coming Soon)', comingSoon: true }
  ]

  const getColorClasses = (isSelected: boolean, isComingSoon: boolean) => {
    if (isComingSoon) return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30 opacity-60'
    if (!isSelected) return 'border-gray-200 dark:border-gray-700'
    return 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
  }

  const getIconColor = (isComingSoon: boolean) => {
    if (isComingSoon) return 'text-gray-400 dark:text-gray-500'
    return 'text-blue-600 dark:text-blue-400'
  }

  return (
    <div className="space-y-3 mb-8">
      {methods.map((method) => {
        const Icon = method.icon
        const isSelected = paymentMethod === method.id
        const isComingSoon = method.comingSoon
        
        return (
          <div
            key={method.id}
            onClick={() => {
              if (!disabled && !isComingSoon) {
                setPaymentMethod(method.id as any)
                resetMpesa()
              } else if (isComingSoon) {
                // Show coming soon message
                const toastMessage = method.id === 'card' 
                  ? '💳 Card payments are coming soon! Please use M-PESA or Bank Transfer.'
                  : `${method.label} is coming soon!`
                // You can add a toast here if needed
              }
            }}
            className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${getColorClasses(isSelected, isComingSoon)} ${!isComingSoon && !disabled ? 'hover:shadow-md' : 'cursor-not-allowed'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(isComingSoon)} bg-blue-100 dark:bg-blue-950/50`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {method.label}
                  {isComingSoon && (
                    <span className="ml-2 text-xs text-orange-500 bg-orange-100 dark:bg-orange-950/50 px-2 py-0.5 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </p>
                <p className={`text-sm ${isComingSoon ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {method.description}
                </p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 ${isSelected && !isComingSoon ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'} ${isComingSoon ? 'bg-gray-300 dark:bg-gray-600' : ''}`} />
          </div>
        )
      })}
    </div>
  )
}