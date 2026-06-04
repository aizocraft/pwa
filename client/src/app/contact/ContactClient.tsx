'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Briefcase,
  Clock as ClockIcon,
  Calendar,
  ChevronRight,
  Navigation,
  User,
} from 'lucide-react';
import { submitContact } from '@/lib/api';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  general?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const serviceOptions = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'borehole-drilling', label: 'Borehole Drilling' },
  { value: 'solar-pumping', label: 'Solar Pumping Systems' },
  { value: 'water-treatment', label: 'Water Treatment & Purification' },
  { value: 'irrigation', label: 'Irrigation Systems' },
  { value: 'maintenance', label: 'Maintenance & Support' },
  { value: 'quote', label: 'Request a Quote' },
  { value: 'partnership', label: 'Partnership Opportunity' },
];

export default function ContactClient() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.email && !formData.phone) {
      newErrors.general = 'Either email or phone number is required';
    }

    if (!formData.subject) {
      newErrors.subject = 'Please select a subject';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setStatus('submitting');
    setErrors({});

    try {
      await submitContact({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        subject:
          serviceOptions.find((opt) => opt.value === formData.subject)?.label ||
          formData.subject,
        message: formData.message.trim(),
      });

      setStatus('success');

      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        setStatus('idle');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setErrors({
        general:
          error.response?.data?.error || 'Failed to send message. Please try again.',
      });

      setTimeout(() => {
        setStatus('idle');
        setErrors({});
      }, 5000);
    }
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if ((errors as any)[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
<div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section - Minimal */}
      <section className="relative pt-18 pb-12 md:pt-12 md:pb-8 overflow-hidden">
        <div className="absolute inset-0">
<div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
<div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 lg:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
<h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-4">
              Get In{' '}
<span className="text-cyan-600">
                Touch
              </span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 pb-20">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* LEFT COLUMN - Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              {/* Location Card */}
              <div className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
<div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-bl-full" />

                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
<div className="w-14 h-14 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <MapPin size={24} className="text-white" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Location
                      </h3>
                      <div className="space-y-1">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          Hurlingum Shopping Square,
                          <br />
                          Opposite Total Energies Chokaa,
                          <br />
                          Kangundo Road, Nairobi
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Map Link */}
                  <motion.a
                    href="https://www.google.com/maps/search/Hurlingham%20Square%20Shopping%20Center%20-%20Njiru/@-1.25391636,36.96117471,17z?hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium mt-2 group/link"
                    whileHover={{ x: 4 }}
                  >
                    <Navigation size={14} />
                    Get Directions
                    <ChevronRight
                      size={14}
                      className="group-hover/link:translate-x-1 transition-transform"
                    />
                  </motion.a>
                </div>
              </div>

              {/* Contact Methods Grid */}
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                {/* Phone Card */}
                <div className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
<div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <Phone size={20} className="text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Call Us
                  </h3>

                  <div className="space-y-2">
                    <motion.a
                      href="tel:+254728749722"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group/link"
                      whileHover={{ x: 4 }}
                    >
                      <Phone size={12} />
                      <span>+254 728 749 722</span>
                    </motion.a>

                    <motion.a
                      href="tel:+254728899757"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group/link"
                      whileHover={{ x: 4 }}
                    >
                      <Phone size={12} />
                      <span>+254 728 899 757</span>
                    </motion.a>
                  </div>
                </div>

                {/* Email Card */}
                <div className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
<div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <Mail size={20} className="text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Email
                  </h3>

                  <motion.a
                    href="mailto:plasmawaterafrica@gmail.com"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all group/link inline-flex items-center gap-1"
                    whileHover={{ x: 4 }}
                  >
                    <Mail size={12} />
                    <span>plasmawaterafrica@gmail.com</span>
                  </motion.a>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-6 flex justify-center gap-3">
                {[
                  { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-[#1877f2]' },
                  { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-[#1da1f2]' },
                  { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:bg-[#0077b5]' },
                  { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-[#e4405f]' },
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-all duration-300 ${social.color} hover:text-white`}
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon size={18} />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* RIGHT COLUMN - Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="order-1 lg:order-2"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Send us a Message
                  </h2>
                </div>

                {status === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
<div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <CheckCircle size={40} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Thank you for reaching out. We'll respond shortly.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <User
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 bg-white dark:bg-gray-800 dark:text-white ${
                            errors.name
                              ? 'border-red-500 focus:ring-red-500'
                              : focusedField === 'name'
                              ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                              : 'border-gray-300 dark:border-gray-700'
                          }`}
                          placeholder="John Doe"
                        />
                      </div>

                      {errors.name && (
                        <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                      )}
                    </div>

                    {/* Email & Phone Row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>

                        <div className="relative">
                          <Mail
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 bg-white dark:bg-gray-800 dark:text-white ${
                              errors.email
                                ? 'border-red-500 focus:ring-red-500'
                                : focusedField === 'email'
                                ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                                : 'border-gray-300 dark:border-gray-700'
                            }`}
                            placeholder="john@example.com"
                          />
                        </div>

                        {errors.email && (
                          <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Phone
                        </label>

                        <div className="relative">
                          <Phone
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 bg-white dark:bg-gray-800 dark:text-white ${
                              errors.phone
                                ? 'border-red-500 focus:ring-red-500'
                                : focusedField === 'phone'
                                ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                                : 'border-gray-300 dark:border-gray-700'
                            }`}
                            placeholder="+254 700 000 000"
                          />
                        </div>

                        {errors.phone && (
                          <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* General Error */}
                    {errors.general && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">
                          {errors.general}
                        </span>
                      </div>
                    )}

                    {/* Subject Dropdown */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <Briefcase
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <select
                          value={formData.subject}
                          onChange={(e) => handleChange('subject', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="">Select a subject</option>
                          {serviceOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {errors.subject && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    {/* Message Textarea */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Message <span className="text-red-500">*</span>
                        <span className="text-gray-400 text-xs ml-2">
                          ({formData.message.length}/5000)
                        </span>
                      </label>

                      <textarea
                        rows={5}
                        value={formData.message}
                        onChange={(e) =>
                          handleChange('message', e.target.value.slice(0, 5000))
                        }
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full p-3 border rounded-xl transition-all duration-200 bg-white dark:bg-gray-800 dark:text-white resize-none ${
                          errors.message
                            ? 'border-red-500 focus:ring-red-500'
                            : focusedField === 'message'
                            ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                            : 'border-gray-300 dark:border-gray-700'
                        }`}
                        placeholder="Tell us about your project or inquiry..."
                      />

                      {errors.message && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={status === 'submitting'}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                        status === 'submitting'
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                      whileHover={status !== 'submitting' ? { scale: 1.01, y: -1 } : {}}
                      whileTap={status !== 'submitting' ? { scale: 0.99 } : {}}
                    >
                      {status === 'submitting' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-8 pb-16">
        <div className="container mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800"
          >
            <iframe
              src="https://maps.google.com/maps?q=Hurlingham%20Square%20Shopping%20Centre,%20Kangundo%20Road,%20Nairobi&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
              title="Plasma Water Africa Location - Hurlingham Square Shopping Centre, Nairobi"
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}

