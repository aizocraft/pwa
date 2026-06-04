'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Minus,
  Star,
  MessageCircle,
  Send,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { submitFeedback } from '@/lib/api';

const faqs = [
  { 
    q: "What services do you offer?", 
    a: "Borehole drilling, solar pumping, water treatment, generators, and irrigation networking — all to ISO standards. Our comprehensive approach ensures end-to-end solutions for any water or energy challenge." 
  },
  { 
    q: "How can I contact you?", 
    a: "Reach us via our contact form, phone (+254 728 749 722 /+254 728 899 757), or email (plasmawaterafrica@gmail.com)." 
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
  { 
  q: "How long does a borehole drilling project take?", 
  a: "Most borehole drilling projects are completed within a few days, depending on site conditions, depth requirements, and geological factors. Our team conducts a site assessment and provides a clear project timeline before work begins." 
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
      
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-gray-950">
    <div className="w-full px-4 sm:px-6 lg:px-32">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* LEFT COLUMN - FAQ with larger text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-px bg-cyan-500" />
              <span className="text-sm font-semibold tracking-[0.2em] uppercase text-cyan-600 dark:text-cyan-400">
                Got Questions?
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked{' '}
              <span className="text-cyan-500 dark:text-cyan-400">
                Questions
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-base leading-relaxed">
              Find quick answers to common questions about our services, process, and how we can help you achieve water security.
            </p>

            <div className="space-y-4">
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
                    className={`w-full flex items-center justify-between p-5 text-left transition-all duration-300 ${
                      openIdx === i
                        ? 'bg-cyan-50 dark:bg-cyan-950/30'
                        : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <span className={`font-semibold text-base md:text-lg pr-6 transition-colors duration-300 ${
                      openIdx === i
                        ? 'text-cyan-700 dark:text-cyan-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {f.q}
                    </span>
                    <motion.div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        openIdx === i
                          ? 'bg-[#009dff]'
                        : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                      animate={{ rotate: openIdx === i ? 180 : 0 }}
                      >
                      {openIdx === i ? (
                        <Minus size={16} className="text-white" />
                      ) : (
                        <Plus size={16} className="text-gray-600 dark:text-gray-400" />
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
                        <div className="px-5 pb-5 pt-2 text-base md:text-lg text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700 leading-relaxed">
                          {f.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <motion.a
              href="/contact"
              className="inline-flex items-center gap-2 mt-6 text-sm md:text-base text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold group"
              whileHover={{ x: 4 }}
            >
              <MessageCircle size={16} />
              Still have questions? Contact our support team
              <motion.span className="inline-block transition-transform group-hover:translate-x-1">→</motion.span>
            </motion.a>
          </motion.div>

          {/* RIGHT COLUMN - FEEDBACK FORM */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-px bg-cyan-500" />
              <span className="text-sm font-semibold tracking-[0.2em] uppercase text-cyan-600 dark:text-cyan-400">
                We Value Your Opinion
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Share Your{' '}
              <span className="text-cyan-500 dark:text-cyan-400">
                Experience
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-base leading-relaxed">
              Help us improve by sharing your feedback. We value every opinion and use it to enhance our services.
            </p>

            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-lg">
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
                    className="w-16 h-16 rounded-full bg-[#10b981] flex items-center justify-center mx-auto mb-4"
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
                  {/* Rating Stars */}
                  <div className="text-center mb-6">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                      How would you rate your experience? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex justify-center gap-3">
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
                            size={36}
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
                        className="text-sm text-green-600 dark:text-green-400 mt-3"
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
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-base cursor-pointer transition-all duration-200"
                    >
                      {feedbackCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Feedback Textarea */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Your Feedback <span className="text-red-500">*</span>
                      <span className="text-gray-400 ml-2 text-xs">
                        ({feedbackText.length}/2000)
                      </span>
                    </label>
                    <textarea
                      rows={4}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value.slice(0, 2000))}
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-base resize-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder="Tell us about your experience… What did we do well? What could be improved?"
                    />
                  </div>

                  {/* Name & Email - Optional */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-base transition-all duration-200"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-base transition-all duration-200"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  {/* Public Testimonial Consent */}
              {false && (
                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      I consent to display my feedback publicly as a testimonial
                    </span>
                  </label>
                </div>
              )}

                  {/* Error Message */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center gap-2"
                    >
                      <XCircle size={16} className="text-red-500 shrink-0" />
                      <span className="text-sm text-red-600 dark:text-red-400">{errorMessage}</span>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    onClick={handleSubmitFeedback}
                    disabled={status === 'submitting' || rating === 0 || !feedbackText.trim()}
                    className={`w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 ${
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
                        <Send size={16} />
                        Submit Feedback
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </div>

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