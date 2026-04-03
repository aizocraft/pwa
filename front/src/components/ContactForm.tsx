// src/components/ContactForm.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, XCircle, ChevronDown } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', phone: '', service: '', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isOpen, setIsOpen] = useState(false); // For custom dropdown animation

  const services = [
    'Solar Boreholes',
    'Water Pumps',
    'Solar Water Heaters',
    'Borehole Equipping',
    'Site Survey & Testing',
    'Consultation & Design'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    await new Promise(r => setTimeout(r, 1800));
    setStatus('success');
    setIsSubmitting(false);
    setTimeout(() => setStatus('idle'), 5000);
    setFormData({ name: '', email: '', phone: '', service: '', message: '' });
  };

  return (
    <motion.div
      className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-xl border border-white/50 dark:border-white/10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField name="name" placeholder="Your Name" value={formData.name} onChange={setFormData} />
          <InputField name="phone" placeholder="Phone e.g. 0712 345 678" value={formData.phone} onChange={setFormData} />
        </div>

        <InputField name="email" type="email" placeholder="Email (optional)" value={formData.email} onChange={setFormData} />

        {/* CUSTOM DROPDOWN - SUPER VISIBLE & BEAUTIFUL */}
        <div className="relative">
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-5 py-4 bg-gradient-to-r from-teal-500/10 to-blue-500/10 
                       dark:from-teal-400/10 dark:to-blue-400/10 
                       border-2 border-teal-500/50 dark:border-teal-400/50 
                       rounded-xl cursor-pointer 
                       flex items-center justify-between 
                       shadow-inner hover:shadow-md 
                       transition-all duration-300"
          >
            <span className={`font-medium ${
              formData.service 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {formData.service || 'Select Service'}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 
                           rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 
                           overflow-hidden z-50"
              >
                {services.map((service, i) => (
                  <motion.div
                    key={service}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, service }));
                      setIsOpen(false);
                    }}
                    className="px-5 py-4 hover:bg-teal-50 dark:hover:bg-teal-900/30 
                               cursor-pointer transition-all duration-200 
                               flex items-center justify-between 
                               border-b border-gray-100 dark:border-gray-800 
                               last:border-b-0"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {service}
                    </span>
                    {formData.service === service && (
                      <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <textarea
          name="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={4}
          placeholder="Tell us about your project or water challenge..."
          required
          className="w-full px-5 py-4 bg-white/50 dark:bg-white/10 
                     border-2 border-gray-300/50 dark:border-gray-700/50 
                     rounded-xl focus:border-teal-500 focus:outline-none 
                     focus:ring-4 focus:ring-teal-500/20 resize-none 
                     text-gray-800 dark:text-white transition-all"
        />

        <motion.button
          type="submit"
          disabled={isSubmitting || !formData.service}
          whileHover={{ scale: (isSubmitting || !formData.service) ? 1 : 1.02 }}
          whileTap={{ scale: (isSubmitting || !formData.service) ? 1 : 0.98 }}
          className={`w-full py-5 rounded-xl font-bold text-lg 
                     flex items-center justify-center gap-3 shadow-lg 
                     transition-all duration-300
                     ${isSubmitting || !formData.service
                       ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed'
                       : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white'
                     }`}
        >
          {isSubmitting ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
                        className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full" />
          ) : (
            <Send className="w-6 h-6" />
          )}
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </motion.button>
      </form>

      <AnimatePresence>
        {status === 'success' && (
          <SuccessMessage message="Got it! We'll call you within 1 hour" />
        )}
        {status === 'error' && (
          <ErrorMessage message="Failed. Tap WhatsApp below" />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Reusable Input
const InputField = ({ name, type = "text", placeholder, value, onChange }: any) => (
  <motion.input
    whileFocus={{ scale: 1.02 }}
    type={type}
    name={name}
    value={value}
    onChange={(e) => onChange(prev => ({ ...prev, [name]: e.target.value }))}
    placeholder={placeholder}
    required={name !== 'email'}
    className="w-full px-5 py-4 bg-white/50 dark:bg-white/10 
               border-2 border-gray-300/50 dark:border-gray-700/50 
               rounded-xl focus:border-teal-500 focus:outline-none 
               focus:ring-4 focus:ring-teal-500/20 transition-all 
               text-gray-800 dark:text-white font-medium"
  />
);

// Success/Error Messages
const SuccessMessage = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="mt-4 p-5 bg-gradient-to-r from-teal-100 to-emerald-100 
               dark:from-teal-900/50 dark:to-emerald-900/50 
               border-2 border-teal-500 dark:border-teal-400 
               rounded-xl flex items-center gap-3"
  >
    <CheckCircle className="w-8 h-8 text-teal-600 dark:text-teal-400 flex-shrink-0" />
    <div>
      <p className="font-bold text-teal-900 dark:text-teal-100">Success!</p>
      <p className="text-sm text-teal-800 dark:text-teal-200">{message}</p>
    </div>
  </motion.div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="mt-4 p-5 bg-gradient-to-r from-red-100 to-rose-100 
               dark:from-red-900/50 dark:to-rose-900/50 
               border-2 border-red-500 dark:border-red-400 
               rounded-xl flex items-center gap-3"
  >
    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
    <div>
      <p className="font-bold text-red-900 dark:text-red-100">Error</p>
      <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
    </div>
  </motion.div>
);