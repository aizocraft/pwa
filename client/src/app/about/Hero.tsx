'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  BadgeCheck,
  FileText,
  Phone,
  Mail,
  Eye,
  Target,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface HeroProps {
  onOpenProfile: () => void;
}

const stagger = (i: number, base = 0.08) => ({ delay: i * base });

export default function Hero({ onOpenProfile }: HeroProps) {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cards = useMemo(
    () => [
      {
        icon: Eye,
        label: 'Vision',
        accent: 'cyan',
        gradient: 'from-cyan-500 to-blue-500',
        text: 'To be a global leader in sustainable water and energy solutions, pioneering innovative technologies to ensure equitable access to clean water for all community groups.',
      },
      {
        icon: Target,
        label: 'Mission',
        accent: 'emerald',
        gradient: 'from-emerald-500 to-teal-500',
        text: 'To leverage innovative water and energy systems to address the urgent challenges of water scarcity in Africa through cutting-edge technology, sustainable practices and community engagement.',
      },
    ],
    []
  );

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* ===== BACKGROUND LAYERS ===== */}
      
      {/* Base Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="/borehole.jpeg"
          alt="Borehole drilling operations"
          className="w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.45) saturate(0.9)' }}
        />
 
     
      </div>

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)`,
          backgroundSize: '40px 100%',
        }}
      />

      {/* Water Ripple Texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/water-pattern.jpg')",
          backgroundSize: '320px 320px',
          backgroundRepeat: 'repeat',
          opacity: 0.08,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Gradient Orbs for Depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Animated Floating Elements */}
      <motion.div
        className="absolute top-1/4 right-[15%] w-32 h-32 rounded-full border border-cyan-500/20 pointer-events-none"
        animate={{
          y: [0, 20, 0],
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/3 left-[10%] w-24 h-24 rounded-full border border-emerald-500/20 pointer-events-none"
        animate={{
          y: [0, -15, 0],
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* ===== MAIN CONTENT ===== */}
      <motion.div
        style={{ opacity, scale }}
        className="container mx-auto px-6 lg:px-20 relative z-10 pt-28 pb-24 md:pt-36 md:pb-32"
      >
        <div className="max-w-4xl">
          {/* Eyebrow Section with Animated Line */}
          <motion.div
            className="flex items-center gap-4 mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-12 h-px bg-gradient-to-r from-cyan-500 to-transparent" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-cyan-400 dark:text-cyan-400">
              Since 2010
            </span>
          </motion.div>

         

          {/* Main Headline */}
          <motion.h1
            className="font-black leading-[1.08] mb-8"
            style={{
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              letterSpacing: '-0.02em',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="text-white dark:text-white">
              Leading the
            </span>
            <br />
            <motion.span
              className="inline-block mt-2"
              style={{
                background: 'linear-gradient(105deg, #06b6d4 0%, #3b82f6 45%, #8b5cf6 70%, #06b6d4 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              animate={{
                backgroundPosition: ['0% center', '100% center', '0% center'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              Water Revolution
            </motion.span>
            <br />

          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-base md:text-lg leading-relaxed mb-10 max-w-xl text-gray-300 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Plasma Water Africa delivers comprehensive, ISO-standard engineering for water and energy
            challenges across the continent.
          </motion.p>

          {/* CTA Actions */}
          <motion.div
            className="flex flex-wrap gap-4 items-center mb-16"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 }}
          >
            {/* Primary CTA */}
            <motion.button
              onClick={onOpenProfile}
              className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white overflow-hidden shadow-2xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)',
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <FileText size={17} strokeWidth={1.8} />
              <span>View Company Profile</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
            </motion.button>

            {/* Divider */}
            <div className="w-px h-6 bg-white/15 hidden sm:block" />

            {/* Contact Icons */}
            <div className="flex gap-2">
              {[
                { href: 'tel:+254700000000', icon: Phone, label: 'Call us' },
                { href: 'mailto:info@plasmawater.co.ke', icon: Mail, label: 'Email us' },
              ].map((item, i) => (
                <motion.a
                  key={i}
                  href={item.href}
                  title={item.label}
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)',
                  }}
                  whileHover={{
                    scale: 1.02,
                    y: -1,
                    background: 'rgba(6, 182, 212, 0.15)',
                    borderColor: 'rgba(6, 182, 212, 0.4)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon size={14} className="text-cyan-400 group-hover:rotate-12 transition-transform duration-200" />
                  <span className="text-xs font-medium text-white/80 group-hover:text-white hidden sm:inline">
                    {item.label === 'Call us' ? '+254 700 000 000' : 'info@plasmawater.co.ke'}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Vision & Mission Cards */}
          <motion.div
            className="grid md:grid-cols-2 gap-5"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            {cards.map((card, i) => {
              const Icon = card.icon;
              const isCyan = card.accent === 'cyan';
              return (
                <motion.div
                  key={card.label}
                  className="group relative rounded-2xl p-6 overflow-hidden cursor-pointer transition-all duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${
                      isCyan ? 'rgba(8,145,178,0.15)' : 'rgba(5,150,105,0.15)'
                    }, rgba(0,0,0,0.2))`,
                    border: `1px solid ${
                      isCyan ? 'rgba(6,182,212,0.25)' : 'rgba(16,185,129,0.25)'
                    }`,
                    backdropFilter: 'blur(20px)',
                  }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={stagger(i, 0.1)}
                  whileHover={{
                    y: -6,
                    borderColor: isCyan ? 'rgba(6,182,212,0.5)' : 'rgba(16,185,129,0.5)',
                    transition: { duration: 0.2 },
                  }}
                >
                  {/* Animated Corner Accent */}
                  <motion.div
                    className={`absolute top-0 right-0 w-24 h-24 rounded-bl-3xl pointer-events-none ${
                      isCyan ? 'bg-gradient-to-bl from-cyan-500/20' : 'bg-gradient-to-bl from-emerald-500/20'
                    }`}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.3 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Glow Effect on Hover */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                    isCyan ? 'shadow-[0_0_30px_rgba(6,182,212,0.15)]' : 'shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                  }`} />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isCyan
                            ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/40'
                            : 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/40'
                        }`}
                        whileHover={{ rotate: 6, scale: 1.05 }}
                      >
                        <Icon size={20} className={isCyan ? 'text-cyan-300' : 'text-emerald-300'} strokeWidth={1.8} />
                      </motion.div>
                      <div>
                        <p className={`text-[10px] font-black tracking-[0.25em] uppercase ${
                          isCyan ? 'text-cyan-400/80' : 'text-emerald-400/80'
                        }`}>
                          {card.label}
                        </p>
                        <p className="text-white font-black text-lg leading-tight">
                          Our {card.label}
                        </p>
                      </div>
                    </div>

                    <p className="text-[13px] leading-relaxed text-gray-300/90">
                      {card.text}
                    </p>

                    {/* Decorative Line */}
                    <motion.div
                      className={`mt-4 h-0.5 w-10 rounded-full ${
                        isCyan ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      } group-hover:w-16 transition-all duration-300`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

      {/* ===== SCROLL INDICATOR ===== */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span className="text-[9px] font-semibold tracking-[0.3em] uppercase text-white/40 dark:text-white/40">
          Discover More
        </span>
        <motion.div
          className="w-6 h-10 rounded-full border border-white/20 flex justify-center p-1 backdrop-blur-sm"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="w-1 h-2 rounded-full bg-gradient-to-t from-cyan-400 to-blue-400"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>

      {/* ===== BOTTOM WAVE ===== */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-16 md:h-20">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0)', stopOpacity: 0 }} />
              <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.08 }} />
            </linearGradient>
            <linearGradient id="waveGradientDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgba(0,0,0,0)', stopOpacity: 0 }} />
              <stop offset="100%" style={{ stopColor: '#0f172a', stopOpacity: 0.15 }} />
            </linearGradient>
          </defs>
          <path
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,53.3C672,53,768,75,864,80C960,85,1056,75,1152,69.3C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            className="fill-white/5 dark:fill-gray-950/10"
          />
          <path
            d="M0,85.3L48,80C96,75,192,64,288,64C384,64,480,75,576,80C672,85,768,85,864,80C960,75,1056,64,1152,58.7C1248,53,1344,53,1392,53L1440,53L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            className="fill-white/10 dark:fill-gray-950/20"
          />
        </svg>
      </div>
    </section>
  );
}

// Additional Icon component needed
function ShieldCheck({ size, strokeWidth, className }: { size?: number; strokeWidth?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}