// src/app/terms/page.tsx

'use client'

import Link from 'next/link'
import { FileText, ShoppingBag, RefreshCw, AlertCircle, CreditCard, Truck, ShieldCheck, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  const effectiveDate = "April 4, 2026"

  const sections = [
    {
      icon: ShoppingBag,
      title: "Orders & Purchases",
      content: "By placing an order, you agree to provide accurate and complete information. All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason, including product availability, pricing errors, or suspected fraud."
    },
    {
      icon: CreditCard,
      title: "Pricing & Payments",
      content: "All prices are listed in your local currency and include applicable taxes unless otherwise noted. We accept major credit cards and secure payment methods. Payment must be received in full before order processing begins."
    },
    {
      icon: Truck,
      title: "Shipping & Delivery",
      content: "Estimated delivery times are provided for reference only. We are not responsible for delays caused by carriers, customs, or events beyond our control. Risk of loss transfers to you upon delivery to the shipping carrier."
    },
    {
      icon: RefreshCw,
      title: "Returns & Refunds",
      content: "Most products can be returned within 30 days of delivery, provided they are unused and in original packaging. Custom or personalized items are non-returnable. Refunds will be issued to the original payment method within 14 days of return receipt."
    },
    {
      icon: ShieldCheck,
      title: "Warranty & Liability",
      content: "Products come with manufacturer warranties as specified. Our liability is limited to the purchase price of the product. We are not liable for indirect, incidental, or consequential damages arising from product use."
    },
    {
      icon: AlertCircle,
      title: "User Conduct",
      content: "You agree not to misuse our services, including attempting to bypass security features, interfering with site operations, or using automated systems to access our platform without permission."
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 print:bg-white print:min-h-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 print:py-0 print:max-w-none">
        
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors mb-8 group print:hidden"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" style={{ color: '#0043b3' }} />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl shadow-md print:shadow-none" style={{ backgroundColor: '#000063' }}>
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white" style={{ color: '#000063' }}>
                Terms of Service
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Effective date: {effectiveDate}
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            By accessing or using our services, you agree to be bound by these terms. Please read them carefully before making a purchase.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6 print:space-y-4">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl print:border-b print:border-gray-300 print:rounded-none print:p-4 print:shadow-none print:bg-transparent"
                style={{ borderColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#009dff'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl transition-transform duration-300 print:p-0" style={{ backgroundColor: '#f0f4ff' }}>
                    <Icon className="w-5 h-5 print:text-black" style={{ color: '#0043b3' }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3" style={{ color: '#000063' }}>
                      {section.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed print:text-black print:text-sm">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Agreement Section */}
        <div className="mt-10 p-6 bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl border print:mt-6 print:p-4 print:bg-gray-50" style={{ borderColor: '#0043b3' }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 print:text-black" style={{ color: '#0043b3' }} />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1" style={{ color: '#000063' }}>
                Electronic Agreement
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 print:text-black">
                By using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. These terms may be updated periodically, and continued use constitutes acceptance of any changes.
              </p>
            </div>
          </div>
        </div>

        {/* Contact & Print Action Section */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-between items-center p-6 bg-gray-100 dark:bg-gray-800/50 rounded-2xl print:hidden">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Questions about our terms?
          </p>
          <div className="flex gap-3">
            <Link 
              href="/contact" 
              className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 transition-all duration-300"
              style={{ backgroundColor: '#ffffff' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0043b3'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
            >
              Contact Support
            </Link>
            <button 
              onClick={() => window.print()}
              className="px-5 py-2 text-sm font-medium text-white rounded-xl transition-all duration-300 shadow-md hover:opacity-90"
              style={{ backgroundColor: '#0043b3' }}
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
