// src/components/Contact.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContactForm } from './ContactForm';
import {
  Facebook,
  MessageCircle,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';

const Contact: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const links = [
    { icon: Facebook, label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=100083069751841&mibextid=ZbWKwL', color: 'from-blue-600 to-blue-700' },
    { icon: MessageCircle, label: 'WhatsApp', url: 'https://wa.me/254728749722?text=Hi%20Plasma%20Water%20Africa,%20I%20am%20interested%20in%20learning%20more%20about%20your%20products%20and%20services.', color: 'from-green-500 to-emerald-600' },
    { icon: Instagram, label: 'Instagram', url: 'https://www.instagram.com/plasmawaterafrica/', color: 'from-pink-500 to-rose-600' },
    { icon: Linkedin, label: 'LinkedIn', url: 'https://ke.linkedin.com/in/martin-mbaka-ba8446185', color: 'from-sky-600 to-blue-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-blue-950 dark:to-teal-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header - Compact & Powerful */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-teal-400 dark:to-emerald-400">
            Get in Touch
          </h1>
        
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.15 }}
              className="grid lg:grid-cols-2 gap-8"
            >
              {/* Left: Info + Social */}
              <motion.div className="space-y-8">
                {/* Company Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50 dark:border-white/10"
                >
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                    Plasma Water Africa
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                     Solar Boreholes • Water Pumps • Solar Heaters • Equipping
                  </p>
                  <div className="mt-6 space-y-4 text-sm">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <Phone className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      <span>+254 728 749 722</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span>info@plasmawaterafrica.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span>Nairobi, Kenya</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span>Mon–Sat: 8AM–6PM</span>
                    </div>
                  </div>
                </motion.div>

                {/* Social Links - Compact Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {links.map((link, i) => (
                    <motion.a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={`group relative overflow-hidden rounded-2xl p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${link.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                          <link.icon className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {link.label}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ backgroundImage: `linear-gradient(to bottom right, ${link.color.split(' ')[1]}, ${link.color.split(' ')[3]})` }}
                      />
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Right: Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ContactForm />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-blue-400/20 to-teal-400/20 dark:from-blue-600/10 dark:to-teal-600/10 blur-3xl"
            animate={{
              x: [0, 100, -100, 0],
              y: [0, -100, 100, 0],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 20}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Skeleton Component
const SkeletonLoader = () => (
  <motion.div
    key="skeleton"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="grid lg:grid-cols-2 gap-8"
  >
    <div className="space-y-6">
      <div className="h-48 bg-gray-200/70 dark:bg-gray-800/50 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200/70 dark:bg-gray-800/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
    <div className="h-96 bg-gray-200/70 dark:bg-gray-800/50 rounded-2xl animate-pulse" />
  </motion.div>
);

export default Contact;