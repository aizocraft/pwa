'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Eye,
  Star,
  Download,
  X,
  Sparkles,
  FileText,
  ExternalLink,
  Loader2,
  Droplets,
  Sun,
  Filter,
  Zap,
  Waves,
  Network,
  Phone,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Quote,
} from "lucide-react";
import Hero from './Hero';
import Value from './Value';
import FAQ from './FAQ';

// PDF metadata
const profilePdf = {
  url: "/profile.pdf",
  name: "Plasma_Water_Africa_Profile.pdf",
  size: "1 MB",
  lastUpdated: "January 2026",
};

// Data
const services = [
  { icon: Droplets, label: "Hydrogeological Surveys" },
  { icon: Waves, label: "Borehole Drilling" },
  { icon: Sun, label: "Solar Pumping Design" },
  { icon: Filter, label: "Advanced Purification" },
  { icon: Zap, label: "Power Backup Systems" },
  { icon: Network, label: "Irrigation Networking" },
];

const whyUs = [
  "We offer tremendous value — maximising energy savings and sustainable self-sufficiency at competitive prices every time.",
  "Every project we undertake ensures expectations are met, backed by vast experience in water and solar power systems.",
  "Cutting-edge technology and expert installation make going solar simple, so you start saving immediately.",
  "Highly trained, skilled employees who will never sacrifice quality in any installation or service.",
];

const testimonials = [
  { name: "James Mwangi", role: "Nairobi County Farmer", stars: 5, text: "Plasma Water Africa transformed our irrigation setup. The borehole they drilled now supplies our entire 20-acre farm year-round. Professional team, on-time delivery." },
  { name: "Grace Achieng", role: "Community Health Officer", stars: 5, text: "Clean water access for our clinic jumped from 40% to 100% after their purification system. Truly life-changing work." },
  { name: "David Kariuki", role: "SME Owner, Thika", stars: 4, text: "The solar pumping system they designed has cut our water costs by 70%. Reliable, quiet, and zero maintenance issues in 18 months." },
];

export default function About() {
  const [modalOpen, setModalOpen] = useState(false);
  const [downProg, setDownProg] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const startDownload = () => {
    setDownloading(true);
    setDownProg(0);
    const int = setInterval(() => {
      setDownProg((p) => {
        if (p >= 100) {
          clearInterval(int);
          setDownloading(false);
          const a = document.createElement("a");
          a.href = profilePdf.url;
          a.download = profilePdf.name;
          a.click();
          return 100;
        }
        return p + 10;
      });
    }, 100);
  };

  const PdfDownloadCard = () => (
    <div className="bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/50 rounded-2xl p-5 sm:p-6 border border-blue-200/50 dark:border-blue-800/50 shadow-xl">
      <div className="text-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
          <FileText className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">{profilePdf.name}</h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{profilePdf.size} • Updated {profilePdf.lastUpdated}</p>
      </div>
      {downloading && (
        <div className="mb-5">
          <div className="flex justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1.5">
            <span>Downloading…</span><span>{downProg}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${downProg}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          onClick={startDownload}
          disabled={downloading}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-200"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          {downloading ? <><Loader2 className="h-4 w-4 animate-spin" />Downloading…</> : <><Download size={16} />Download PDF</>}
        </motion.button>
        <motion.button
          onClick={() => window.open(profilePdf.url, "_blank")}
          className="px-5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <ExternalLink size={16} />Open
        </motion.button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans overflow-x-hidden">
      <Hero onOpenProfile={() => setModalOpen(true)} />

      

      <Value />

      {/* Technical Services Strip - Minimal Elegant */}
      <section className="py-20 md:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-6 lg:px-16">
          {/* Header with left accent */}
          <motion.div
            className="max-w-2xl mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-gradient-to-r from-cyan-500 to-transparent" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-cyan-600 dark:text-cyan-400">
                Core Services
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white">
              Technical{' '}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400">
                Engineering
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
              Specialized solutions for Africa's water and energy challenges
            </p>
          </motion.div>

          {/* Services Grid - Clean Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="group text-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-300 cursor-pointer"
                    whileHover={{ y: -2 }}
                  >
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-blue-600 flex items-center justify-center mb-3 transition-all duration-300">
                      <Icon size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                      {s.label}
                    </span>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Accent */}
          <div className="mt-10 flex justify-center">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 md:py-28 bg-white dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-80 h-80 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 lg:px-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center max-w-6xl mx-auto">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 text-xs font-bold tracking-widest uppercase mb-5 border border-cyan-100 dark:border-cyan-800"
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
              >
                <Sun size={12} /> Your Trusted Water & Energy Partner
              </motion.span>

              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-5">
                Meet Plasma Water{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                  Africa
                </span>
              </h2>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                We are dedicated to providing reliable and cost-effective water and solar energy systems for homes, farms, and businesses across Africa. Our technology is engineered to generate clean, dependable water supply and energy — helping communities reduce costs and build resilience.
              </p>

              <div className="space-y-4 mb-9">
                {whyUs.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-3 items-start group cursor-pointer"
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 4 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle2 size={20} className="text-cyan-500 mt-0.5 shrink-0" />
                    </motion.div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 items-center">
                <motion.a
                  href="/contact"
                  className="px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 text-sm transition-all duration-200"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Get A Quote
                </motion.a>

                <motion.a
                  href="tel:+254700000000"
                  className="flex items-center gap-2.5 px-5 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950 flex items-center justify-center group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900 transition-colors"
                    whileHover={{ rotate: 12 }}
                  >
                    <Phone size={16} className="text-cyan-500" />
                  </motion.div>
                  +254 700 000 000
                </motion.a>

                <motion.a
                  href="mailto:info@plasmawater.co.ke"
                  className="flex items-center gap-2.5 px-5 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950 flex items-center justify-center group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900 transition-colors"
                    whileHover={{ rotate: -12 }}
                  >
                    <Mail size={16} className="text-cyan-500" />
                  </motion.div>
                  Email Us
                </motion.a>
              </div>
            </motion.div>

            {/* Right – Stat Cards */}
            <motion.div
              className="grid grid-cols-2 gap-5"
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {[
                { label: "Projects Completed", value: "500+", color: "cyan", gradient: "from-cyan-500 to-cyan-600" },
                { label: "Counties Served", value: "30+", color: "blue", gradient: "from-blue-500 to-blue-600" },
                { label: "Litres / Day Delivered", value: "2M+", color: "emerald", gradient: "from-emerald-500 to-emerald-600" },
                { label: "Client Satisfaction", value: "100%", color: "violet", gradient: "from-violet-500 to-violet-600" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  className="group relative rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 p-7 text-center overflow-hidden cursor-pointer"
                  whileHover={{ scale: 1.04, y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Animated gradient overlay */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${s.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  <motion.p
                    className={`text-4xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r ${s.gradient}`}
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                  >
                    {s.value}
                  </motion.p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                    {s.label}
                  </p>

                  {/* Decorative dot */}
                  <div className={`absolute bottom-2 right-2 w-1 h-1 rounded-full bg-gradient-to-r ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-yellow-500/5 dark:bg-yellow-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 lg:px-16 relative z-10">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-50 dark:bg-yellow-950/50 text-yellow-600 dark:text-yellow-400 text-xs font-bold tracking-widest uppercase mb-4 border border-yellow-200 dark:border-yellow-800"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
            >
              <Star size={12} className="fill-yellow-500 text-yellow-500" /> Client Stories
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
              What Our Clients Say
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto mt-4 rounded-full" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 max-w-6xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-7 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col relative overflow-hidden"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                {/* Quote icon background */}
                <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                  <Quote size={80} className="text-gray-900 dark:text-white" />
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: i * 0.12 + 0.2, type: "spring" }}
                >
                  <Quote size={28} className="text-cyan-400 dark:text-cyan-600 mb-4" />
                </motion.div>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm flex-1 mb-6 relative z-10">
                  {t.text}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <motion.div
                        key={s}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        <Star
                          size={14}
                          className={`transition-all ${s < t.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-gray-600"}`}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FAQ />

      {/* PDF Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full"
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-4 flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-white" />
                  <h3 className="text-base font-bold text-white">Company Profile</h3>
                </div>
                <motion.button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5 text-white" />
                </motion.button>
              </div>
              <div className="p-5 sm:p-6">
                <PdfDownloadCard />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}