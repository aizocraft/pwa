// src/app/privacy/page.tsx

'use client'

import Link from 'next/link'
import { Shield, Lock, Eye, Database, Cookie, Mail, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  const lastUpdated = "April 4, 2026"

  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, place an order, or contact us. This may include your name, email address, phone number, shipping address, and payment information. We also automatically collect certain information about your device and how you interact with our website."
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: "We use your information to process orders, provide customer support, improve our services, communicate with you about products and promotions, and protect against fraudulent transactions. We never sell your personal data to third parties."
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security."
    },
    {
      icon: Cookie,
      title: "Cookies & Tracking",
      content: "We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences. Essential cookies cannot be disabled as they're necessary for site functionality."
    },
    {
      icon: Mail,
      title: "Your Rights",
      content: "You have the right to access, correct, or delete your personal information. You may also opt-out of marketing communications at any time. Contact us to exercise these rights, and we'll respond within 30 days."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
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
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Privacy Policy
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Your privacy matters to us. This policy explains how we collect, use, and protect your personal information when you use our services.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <div 
                key={index}
                className="group bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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

        {/* Contact Section */}
        <div className="mt-12 p-6 lg:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Questions About Privacy?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            If you have any questions about this Privacy Policy or how we handle your data, please contact us.
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors group"
          >
            Contact Our Privacy Team
            <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}