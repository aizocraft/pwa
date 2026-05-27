// src/app/checkout/components/PaymentMethods.tsx
'use client'

import { Smartphone, Banknote, Landmark } from 'lucide-react'

interface PaymentMethodsProps {
  paymentMethod: string
  setPaymentMethod: (method: any) => void
  resetMpesa: () => void
  disabled?: boolean
}

export default function PaymentMethods({ paymentMethod, setPaymentMethod, resetMpesa, disabled = false }: PaymentMethodsProps) {
  const methods = [
    { id: 'cash', label: 'Cash on Delivery', icon: Banknote, description: 'Pay with cash upon delivery', color: 'blue' },
    { id: 'mpesa', label: 'M-PESA', icon: Smartphone, description: 'Pay using M-PESA mobile money', color: 'blue' },
    { id: 'bank_transfer', label: 'Bank Transfer', icon: Landmark, description: 'Pay via bank transfer', color: 'blue' }
  ]

  const getColorClasses = (isSelected: boolean) => {
    if (!isSelected) return 'border-gray-200 dark:border-gray-700'
    return 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
  }

  const getIconColor = () => {
    return 'text-blue-600 dark:text-blue-400'
  }

  return (
    <div className="space-y-3 mb-8">
      {methods.map((method) => {
        const Icon = method.icon
        const isSelected = paymentMethod === method.id
        
        return (
          <div
            key={method.id}
            onClick={() => {
              if (!disabled) {
                setPaymentMethod(method.id as any)
                resetMpesa()
              }
            }}
            className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${getColorClasses(isSelected)} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor()} bg-blue-100 dark:bg-blue-950/50`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{method.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{method.description}</p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}`} />
          </div>
        )
      })}
    </div>
  )
}