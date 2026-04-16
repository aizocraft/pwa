// src/app/checkout/components/PaymentMethods.tsx
'use client'

import { Truck, Smartphone, CreditCard } from 'lucide-react'

interface PaymentMethodsProps {
  paymentMethod: string
  setPaymentMethod: (method: any) => void
  resetMpesa: () => void
  disabled?: boolean // Add this prop
}

export default function PaymentMethods({ paymentMethod, setPaymentMethod, resetMpesa, disabled = false }: PaymentMethodsProps) {
  const methods = [
    { id: 'cod', label: 'Cash on Delivery', icon: Truck, description: 'Pay when you receive your order', color: 'blue' },
    { id: 'mpesa', label: 'M-PESA', icon: Smartphone, description: 'Pay using M-PESA', color: 'green' },
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, etc.', color: 'blue' }
  ]

  const getColorClasses = (color: string, isSelected: boolean) => {
    if (!isSelected) return 'border-gray-200 dark:border-gray-700'
    switch(color) {
      case 'blue': return 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
      case 'green': return 'border-green-500 bg-green-50 dark:bg-green-950/30'
      case 'purple': return 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
      default: return 'border-gray-200 dark:border-gray-700'
    }
  }

  const getIconColor = (color: string) => {
    switch(color) {
      case 'blue': return 'text-blue-600 dark:text-blue-400'
      case 'green': return 'text-green-600 dark:text-green-400'
      case 'purple': return 'text-purple-600 dark:text-purple-400'
      default: return 'text-gray-600'
    }
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
            className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${getColorClasses(method.color, isSelected)} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg bg-${method.color}-100 dark:bg-${method.color}-950/50 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${getIconColor(method.color)}`} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{method.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{method.description}</p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 ${isSelected ? `border-${method.color}-500 bg-${method.color}-500` : 'border-gray-300 dark:border-gray-600'}`} />
          </div>
        )
      })}
    </div>
  )
}