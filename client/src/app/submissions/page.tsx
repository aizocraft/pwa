'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FeedbackCategory } from '@/types/feedback'
import { submitFeedback, submitContact } from '@/lib/api'

import { 
  Star, 
  Send, 
  MessageSquare, 
  ThumbsUp, 
  Smile, 
  Meh, 
  Frown, 
  Angry,
  Mail,
  User,
  ShoppingBag,
  Truck,
  Globe,
  Phone,
  Headphones,
  Wrench,
  CheckCircle
} from 'lucide-react'



export default function SubmissionsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'feedback' | 'contact'>('feedback')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submissionType, setSubmissionType] = useState<'feedback' | 'contact' | null>(null)

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    rating: 0,
    category: 'product' as FeedbackCategory,
    feedback: '',
    isPublic: true
  })
  const [hoveredRating, setHoveredRating] = useState(0)

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',  
    subject: '',
    message: ''
  })

  const ratingLabels = {
    1: { label: 'Very Poor', icon: Angry, color: 'text-red-500' },
    2: { label: 'Poor', icon: Frown, color: 'text-orange-500' },
    3: { label: 'Average', icon: Meh, color: 'text-yellow-500' },
    4: { label: 'Good', icon: Smile, color: 'text-green-500' },
    5: { label: 'Excellent', icon: ThumbsUp, color: 'text-blue-500' }
  }

  const categories = [
    { value: 'product', label: 'Product Quality', icon: ShoppingBag },
    { value: 'service', label: 'Customer Service', icon: Headphones },
    { value: 'shipping', label: 'Shipping & Delivery', icon: Truck },
    { value: 'website', label: 'Website Experience', icon: Globe },
    { value: 'customer-support', label: 'Technical Support', icon: Wrench },
    { value: 'other', label: 'Other', icon: MessageSquare }
  ]

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Prepare submission data - only include name/email if they have values
      const submitData: any = {
        rating: feedbackForm.rating,
        category: feedbackForm.category,
        feedback: feedbackForm.feedback,
        isPublic: feedbackForm.isPublic
      }
      
      // Only include name if provided and not empty
      if (feedbackForm.name && feedbackForm.name.trim()) {
        submitData.name = feedbackForm.name.trim()
      }
      
      // Only include email if provided and valid format
      if (feedbackForm.email && feedbackForm.email.trim()) {
        submitData.email = feedbackForm.email.trim()
      }
      
      await submitFeedback(submitData)
      setSubmissionType('feedback')
      setSubmitted(true)
      setFeedbackForm({
        name: '',
        email: '',
        rating: 0,
        category: 'product',
        feedback: '',
        isPublic: true
      })
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (error: any) {
      console.error('Feedback submission error:', error)
      toast.error(error.response?.data?.error || 'Failed to submit feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Validate that either email or phone is provided
      if (!contactForm.email?.trim() && !contactForm.phone?.trim()) {
        toast.error('Please provide either an email address or phone number')
        setLoading(false)
        return
      }
      
      // Prepare submission data
      const submitData: any = {
        name: contactForm.name.trim(),
        subject: contactForm.subject.trim(),
        message: contactForm.message.trim()
      }
      
      // Only include email if provided
      if (contactForm.email && contactForm.email.trim()) {
        submitData.email = contactForm.email.trim()
      }
      
      // Only include phone if provided
      if (contactForm.phone && contactForm.phone.trim()) {
        submitData.phone = contactForm.phone.trim()
      }
      
      await submitContact(submitData)
      setSubmissionType('contact')
      setSubmitted(true)
      setContactForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (error: any) {
      console.error('Contact submission error:', error)
      toast.error(error.response?.data?.error || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center transform animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {submissionType === 'feedback' ? 'Thank You for Your Feedback!' : 'Message Sent Successfully!'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {submissionType === 'feedback' 
              ? 'We appreciate your feedback and will use it to improve our services.'
              : 'Our team will get back to you within 24-48 hours.'}
          </p>
          <div className="animate-pulse text-sm text-gray-500">Redirecting to home...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
            We Value Your Voice
          </h1>
          <p className="text-lg md:text-xl text-blue-100 animate-fade-in-up animation-delay-200">
            Share your experience with us or get in touch with our team
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-lg inline-flex">
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'feedback'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Give Feedback
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'contact'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-5 h-5" />
              Contact Us
            </button>
          </div>
        </div>

        {/* Feedback Form */}
        {activeTab === 'feedback' && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <form onSubmit={handleFeedbackSubmit} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share Your Experience</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Your feedback helps us improve</p>
              </div>

              {/* Name - Optional */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-xs font-normal text-gray-500">(optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={feedbackForm.name}
                    onChange={(e) => setFeedbackForm({...feedbackForm, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="John Doe (optional)"
                  />
                </div>
              </div>

              {/* Email - Optional */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-xs font-normal text-gray-500">(optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={feedbackForm.email}
                    onChange={(e) => setFeedbackForm({...feedbackForm, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="john@example.com (optional)"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Providing your email helps us follow up if needed</p>
              </div>

              {/* Rating - Required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Rating *
                </label>
                <div className="flex gap-2 justify-center flex-wrap">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const ratingInfo = ratingLabels[star as keyof typeof ratingLabels]
                    const Icon = ratingInfo.icon
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setFeedbackForm({...feedbackForm, rating: star})}
                        className="group relative"
                      >
                        <div className={`transform transition-all duration-300 ${
                          (hoveredRating >= star || feedbackForm.rating >= star)
                            ? 'scale-110'
                            : 'scale-100'
                        }`}>
                          <Icon className={`w-10 h-10 transition-all ${
                            (hoveredRating >= star || feedbackForm.rating >= star)
                              ? ratingInfo.color
                              : 'text-gray-300 dark:text-gray-600'
                          }`} />
                        </div>
                        <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          {ratingInfo.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Category - Required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={feedbackForm.category}
                  onChange={(e) => setFeedbackForm({...feedbackForm, category: e.target.value as FeedbackCategory})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Feedback Message - Required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Your Feedback *
                </label>
                <textarea
                  required
                  rows={5}
                  value={feedbackForm.feedback}
                  onChange={(e) => setFeedbackForm({...feedbackForm, feedback: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Tell us about your experience..."
                />
              </div>

              {/* Public Consent */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={feedbackForm.isPublic}
                  onChange={(e) => setFeedbackForm({...feedbackForm, isPublic: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  I consent to having my feedback displayed publicly as a testimonial
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || feedbackForm.rating === 0 || !feedbackForm.feedback.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    Submit Feedback
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Contact Form */}
        {activeTab === 'contact' && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <form onSubmit={handleContactSubmit} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Get in Touch</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">We'd love to hear from you</p>
              </div>

              {/* Name - Required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email - Optional */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-xs font-normal text-gray-500">(optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Phone - Optional */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number <span className="text-xs font-normal text-gray-500">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Please provide either email or phone number</p>
              </div>

              {/* Subject - Required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="How can we help you?"
                />
              </div>

              {/* Message - Required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Please provide details about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={loading || (!contactForm.email?.trim() && !contactForm.phone?.trim())}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    Send Message
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeInUp 0.5s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  )
}