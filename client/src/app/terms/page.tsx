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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
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
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <div 
                key={index}
                className="group bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-800/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {section.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Agreement Section */}
        <div className="mt-10 p-6 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Electronic Agreement
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                By using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. These terms may be updated periodically, and continued use constitutes acceptance of any changes.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-between items-center p-6 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Questions about our terms?
          </p>
          <div className="flex gap-3">
            <Link 
              href="/contact" 
              className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 hover:border-purple-500 transition-all duration-300"
            >
              Contact Support
            </Link>
            <button 
              onClick={() => window.print()}
              className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}