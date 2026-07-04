'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Phone,
  Mail,
  Eye,
  Target,
  ArrowRight,
  Download,
  Loader2,
} from 'lucide-react';

interface HeroProps {
  onOpenProfile: () => void;
}

const stagger = (i: number, base = 0.08) => ({ delay: i * base });

export default function Hero({ onOpenProfile }: HeroProps) {
  const [mounted, setMounted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { scrollY } = useScroll();
  const indicatorOpacity = useTransform(scrollY, [0, 150], [1, 0]);
  const indicatorY = useTransform(scrollY, [0, 150], [0, 20]);

  const opacity = useTransform(scrollY, [0, 300], [1, 0.95]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.98]);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch('/profile.pdf');
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      
      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Plasma_Water_Africa_Profile.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 500);
      
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
      alert('Download failed. Please try again later.');
    }
  };

  const cards = useMemo(
    () => [
      {
        icon: Eye,
        label: 'Vision',
        text: 'To be a global leader in sustainable water and energy solutions, pioneering innovative technologies to ensure equitable access to clean water for all community groups.',
      },
      {
        icon: Target,
        label: 'Mission',
        text: 'To leverage innovative water and energy systems to address the urgent challenges of water scarcity in Africa through cutting-edge technology, sustainable practices and community engagement.',
      },
    ],
    []
  );

  if (!mounted) return null;

return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] lg:min-h-[92vh] flex flex-col justify-center overflow-hidden bg-[hsl(var(--background))] dark:bg-[hsl(var(--background))]">
      {/* ===== BACKGROUND IMAGE ===== */}
      <div className="absolute inset-0">
        <img
          src="/borehole.jpg"
          alt="Borehole drilling operations"
          className="w-full h-full object-cover object-center opacity-20 dark:opacity-10"
        />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <motion.div
        style={{ opacity, scale }}
        className="container mx-auto px-6 lg:px-20 relative z-10 pt-12 pb-24 md:pt-2 md:pb-32"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Eyebrow Section */}
          <motion.div
            className="mt-2 flex items-center justify-center gap-4 mb-8 sm:mt-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-12 h-px bg-[#009dff] dark:bg-[#009dff]" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#0043b3] dark:text-[#009dff]">
              Since 2010
            </span>
            <div className="w-12 h-px bg-[#009dff] dark:bg-[#009dff]" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="font-bold leading-[1.2] mb-6 text-gray-900 dark:text-white"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
              letterSpacing: '-0.02em',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Leading the
            <br />
            <span className="text-[#0043b3] dark:text-[#009dff] inline-block mt-2">
              Water Revolution
            </span>
            <br />
           
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Plasma Water Africa delivers comprehensive, ISO-standard engineering for water and energy
            challenges across the continent.
          </motion.p>

          {/* CTA Actions */}
          <motion.div
            className="flex flex-wrap gap-4 items-center justify-center mb-16"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 }}
          >
            {/* Primary CTA - Download Button */}
            <div className="relative">
              <motion.button
                onClick={handleDownload}
                disabled={isDownloading}
                className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-[#0043b3] hover:bg-[#009dff] dark:bg-[#0043b3] dark:hover:bg-[#009dff] transition-all duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                whileHover={!isDownloading ? { scale: 1.02, y: -2 } : {}}
                whileTap={!isDownloading ? { scale: 0.98 } : {}}
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    <span>Downloading... {downloadProgress}%</span>
                  </>
                ) : (
                  <>
                    <Download size={17} strokeWidth={1.8} />
                    <span>Download Company Profile</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </motion.button>
              
              {/* Progress Bar */}
              {isDownloading && (
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="h-full bg-[#009dff] rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${downloadProgress}%` }}
                  />
                </motion.div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 hidden sm:block" />

            {/* Contact Icons */}
            <div className="flex gap-3">
              <motion.a
                href="tel:+254728749722"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-[#0043b3] dark:hover:bg-[#0043b3] hover:text-white dark:hover:text-white hover:border-[#009dff] transition-all duration-300"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Phone size={14} className="text-[#0043b3] dark:text-[#009dff] group-hover:text-white" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">+254 728 749 722</span>
              </motion.a>

              <motion.a
                href="mailto:plasmawaterafrica@gmail.com"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-[#0043b3] dark:hover:bg-[#0043b3] hover:text-white dark:hover:text-white hover:border-[#009dff] transition-all duration-300"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mail size={14} className="text-[#0043b3] dark:text-[#009dff]" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 hidden lg:inline">Email Us</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Vision & Mission Cards */}
          <motion.div
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  className="group relative rounded-xl p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#009dff] dark:hover:border-[#009dff] transition-all duration-300 shadow-sm hover:shadow-md"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={stagger(i, 0.1)}
                  whileHover={{ y: -4 }}
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#0043b3] dark:bg-[#0043b3] flex items-center justify-center">
                        <Icon size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0043b3] dark:text-[#009dff]">
                          {card.label}
                        </p>
                        <p className="text-gray-900 dark:text-white font-bold text-base leading-tight">
                          Our {card.label}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {card.text}
                    </p>

                    <div className="mt-4 h-px w-12 bg-[#009dff] group-hover:w-20 transition-all duration-300" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

  <motion.div
  className="hidden lg:flex absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-3 pointer-events-none"
  style={{
    opacity: indicatorOpacity,
    y: indicatorY,
  }}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 1.2, duration: 0.8 }}
>
  <span className="text-[11px] uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
    Scroll Down
  </span>

  <div className="w-7 h-12 border-2 border-[#009dff]/70 rounded-full flex justify-center p-1">
    <motion.div
      className="w-1.5 h-3 rounded-full bg-[#009dff]"
      animate={{
        y: [0, 16, 0],
        opacity: [1, 0.3, 1],
      }}
      transition={{
        duration: 1.6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </div>
</motion.div>

      {/* ===== BOTTOM WAVE ===== */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-16 md:h-20">
          <path
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,53.3C672,53,768,75,864,80C960,85,1056,75,1152,69.3C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            className="fill-gray-100 dark:fill-gray-900"
          />
        </svg>
      </div>
    </section>
  );
}