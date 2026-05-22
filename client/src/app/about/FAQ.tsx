'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  Sparkles, 
  Star, 
  MessageCircle, 
  Send,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { submitFeedback } from '@/lib/api';

const faqs = [
  { 
    q: "What services do you offer?", 
    a: "Borehole drilling, solar pumping, water treatment, generators, and irrigation networking — all to ISO standards. Our comprehensive approach ensures end-to-end solutions for any water or energy challenge." 
  },
  { 
    q: "How can I contact you?", 
    a: "Reach us via our contact form, phone (+254 700 000 000), or email (info@plasmawater.co.ke) — we respond within 24 hours. Our support team is available Monday to Friday, 8am-6pm EAT." 
  },
  { 
    q: "What areas do you serve?", 
    a: "We operate across multiple African countries, serving both rural communities and urban developments. Currently active in Kenya, Uganda, Tanzania, Rwanda, and expanding to more regions." 
  },
  { 
    q: "What makes you different?", 
    a: "Our ISO standards, 100% reliability track record, and genuine community-focused approach set us apart from the competition. We offer customized solutions with ongoing support." 
  },
  { 
    q: "Do you offer custom solutions?", 
    a: "Absolutely — every project is tailored for maximum efficiency and value specific to your site and needs. We conduct thorough assessments before proposing any solution." 
  },
];

const feedbackCategories = [
  { value: 'product', label: 'Product Quality' },
  { value: 'service', label: 'Service Experience' },
  { value: 'shipping', label: 'Delivery & Logistics' },
  { value: 'website', label: 'Website Experience' },
  { value: 'customer-support', label: 'Customer Support' },
  { value: 'other', label: 'Other Feedback' },
];

type FeedbackStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('product');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState<FeedbackStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const toggleFAQ = (i: number) => setOpenIdx(openIdx === i ? null : i);

  const handleSubmitFeedback = async () => {
    // Validate
    if (rating === 0) {
      setErrorMessage('Please select a rating');
      return;
    }
    if (!feedbackText.trim()) {
      setErrorMessage('Please share your feedback');
      return;
    }
    if (feedbackText.length > 2000) {
      setErrorMessage('Feedback cannot exceed 2000 characters');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      await submitFeedback({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        rating,
        category: feedbackCategory as any,
        feedback: feedbackText.trim(),
        isPublic,
      });

      setStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setRating(0);
        setFeedbackText('');
        setFeedbackCategory('product');
        setName('');
        setEmail('');
        setIsPublic(false);
        setStatus('idle');
      }, 3000);
      
    } catch (error: any) {
      console.error('Feedback submission error:', error);
      setStatus('error');
      setErrorMessage(error.response?.data?.error || 'Failed to submit feedback. Please try again.');
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* LEFT COLUMN - FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 text-xs font-bold tracking-widest uppercase mb-5 border border-cyan-200 dark:border-cyan-800"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
            >
              <Sparkles size={12} /> Support Center
            </motion.span>

            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              Frequently Asked{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                Questions
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              Find quick answers to common questions about our services, process, and how we can help you achieve water security.
            </p>

            <div className="space-y-3">
              {faqs.map((f, i) => (
                <motion.div
                  key={i}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                >
                  <motion.button
                    onClick={() => toggleFAQ(i)}
                    className={`w-full flex items-center justify-between p-4 text-left transition-all duration-300 ${
                      openIdx === i
                        ? 'bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30'
                        : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <span className={`font-semibold text-sm pr-6 transition-colors duration-300 ${
                      openIdx === i
                        ? 'text-cyan-700 dark:text-cyan-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {f.q}
                    </span>
                    <motion.div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        openIdx === i
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                      animate={{ rotate: openIdx === i ? 180 : 0 }}
                    >
                      {openIdx === i ? (
                        <Minus size={13} className="text-white" />
                      ) : (
                        <Plus size={13} className="text-gray-600 dark:text-gray-400" />
                      )}
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {openIdx === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700 leading-relaxed">
                          {f.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Contact Support Link */}
            <motion.a
              href="/contact"
              className="inline-flex items-center gap-2 mt-6 text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold group"
              whileHover={{ x: 4 }}
            >
              <MessageCircle size={14} />
              Still have questions? Contact our support team
              <motion.span
                className="inline-block transition-transform group-hover:translate-x-1"
              >
                →
              </motion.span>
            </motion.a>
          </motion.div>

          {/* RIGHT COLUMN - FEEDBACK FORM */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
          >
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-50 dark:bg-yellow-950/50 text-yellow-600 dark:text-yellow-400 text-xs font-bold tracking-widest uppercase mb-5 border border-yellow-200 dark:border-yellow-800"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
            >
              <Star size={12} className="fill-yellow-500" /> Your Voice Matters
            </motion.span>

            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              Share Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                Experience
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              Help us improve by sharing your feedback. We value every opinion and use it to enhance our services.
            </p>

            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-7 shadow-lg">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle size={32} className="text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Your feedback has been submitted successfully. We appreciate your input!
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Name Field - Optional */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Name <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm transition-all duration-200"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Email Field - Optional */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Email <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm transition-all duration-200"
                      placeholder="your@email.com"
                    />
                  </div>

                  {/* Rating Stars */}
                  <div className="text-center mb-4">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <motion.button
                          key={s}
                          type="button"
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          onHoverStart={() => setHoveredRating(s)}
                          onHoverEnd={() => setHoveredRating(0)}
                          onClick={() => setRating(s)}
                        >
                          <Star
                            size={32}
                            className={`transition-all duration-200 ${
                              (hoveredRating >= s || rating >= s)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        </motion.button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-green-600 dark:text-green-400 mt-2"
                      >
                        {rating === 5 && "Excellent! 🌟"}
                        {rating === 4 && "Good! 👍"}
                        {rating === 3 && "Average 🤔"}
                        {rating === 2 && "Could be better 📝"}
                        {rating === 1 && "We'll improve this 💪"}
                      </motion.p>
                    )}
                  </div>

                  {/* Category Select */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm cursor-pointer transition-all duration-200"
                    >
                      {feedbackCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Feedback Textarea */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Your Feedback <span className="text-red-500">*</span>
                      <span className="text-gray-400 ml-2">
                        ({feedbackText.length}/2000)
                      </span>
                    </label>
                    <textarea
                      rows={4}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value.slice(0, 2000))}
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm resize-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder="Tell us about your experience… What did we do well? What could be improved?"
                    />
                  </div>

                  {/* Public Consent */}
                  <div className="mb-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        I consent to display my feedback publicly as a testimonial
                      </span>
                    </label>
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center gap-2"
                    >
                      <XCircle size={16} className="text-red-500 shrink-0" />
                      <span className="text-xs text-red-600 dark:text-red-400">{errorMessage}</span>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    onClick={handleSubmitFeedback}
                    disabled={status === 'submitting' || rating === 0 || !feedbackText.trim()}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                      status === 'submitting' || rating === 0 || !feedbackText.trim()
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
                    }`}
                    whileHover={status !== 'submitting' && rating > 0 && feedbackText.trim() ? { scale: 1.02, y: -1 } : {}}
                    whileTap={status !== 'submitting' && rating > 0 && feedbackText.trim() ? { scale: 0.98 } : {}}
                  >
                    {status === 'submitting' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Submit Feedback
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </div>

            {/* Trust Badge */}
            <motion.div
              className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-1 h-1 rounded-full bg-green-500" />
              <span>Your feedback helps us improve</span>
              <div className="w-1 h-1 rounded-full bg-green-500" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}