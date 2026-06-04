'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Star,
  Download,
  X,
  Wrench,
  FileText,
  ExternalLink,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Quote,
  Phone,
} from "lucide-react";
import Hero from './Hero';
import Value from './Value';
import FAQ from './FAQ';

const profilePdf = {
  url: "/profile.pdf",
  name: "Plasma_Water_Africa_Profile.pdf",
  size: "1 MB",
  lastUpdated: "January 2026",
};

const whyUs = [
  "We offer affordable borehole and solar solutions that help you save more.",
  "Every project we undertake ensures expectations are met, backed by vast experience.",
  "Cutting-edge technology and expert installation make going solar simple, so you start saving immediately.",
  "Highly trained, skilled employees who will never sacrifice quality in any installation or service.",
];

const testimonials = [
  { name: "James Mwangi", role: "Nairobi County Farmer", stars: 5, text: "Plasma Water Africa transformed our irrigation setup. The borehole they drilled now supplies our entire 20-acre farm year-round. Professional team, on-time delivery." },
  { name: "Grace Achieng", role: "Community Health Officer", stars: 5, text: "Clean water access for our clinic jumped from 40% to 100% after their purification system. Truly life-changing work." },
  { name: "David Kariuki", role: "SME Owner, Thika", stars: 4, text: "The solar pumping system they designed has cut our water costs by 70%. Reliable, quiet, and zero maintenance issues in 18 months." },
  { name: "Sarah Wanjiku", role: "School Administrator", stars: 5, text: "Our school now has clean running water thanks to Plasma Water Africa. The team was professional and the system works perfectly." },
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
<div className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 border border-cyan-200/50 dark:border-cyan-800/50 shadow-xl">
      <div className="text-center mb-5">
<div className="w-14 h-14 rounded-2xl bg-cyan-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
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
              className="bg-cyan-600 h-2 rounded-full"
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
className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-200"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          {downloading ? <><Loader2 className="h-4 w-4 animate-spin" />Downloading…</> : <><Download size={16} />Download PDF</>}
        </motion.button>
        <motion.button
          onClick={() => window.open(profilePdf.url, "_blank")}
          className="px-5 bg-white dark:bg-gray-800 border border-cyan-200 dark:border-cyan-700 text-gray-700 dark:text-gray-200 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
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

      {/* Meet Plasma Water Africa Section*/}
      <section className="py-10 md:py-16 bg-white dark:bg-gray-950">
        <div className="w-full px-4 sm:px-6 lg:px-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-px bg-cyan-500" />
                <span className="text-sm font-semibold tracking-[0.2em] uppercase text-cyan-600 dark:text-cyan-400">
                  Your Trusted Partner
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                Meet Plasma Water{' '}
                <span className="text-cyan-500 dark:text-cyan-400">
                  Africa
                </span>
              </h2>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 text-lg">
                We are dedicated to providing reliable and cost-effective water and solar energy systems for homes, farms, and businesses across Africa.
              </p>

              <div className="space-y-5 mb-10">
                {whyUs.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-3 items-start group"
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckCircle2 size={22} className="text-cyan-500 mt-0.5 shrink-0" />
                    </motion.div>
                    <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <motion.a
                  href="/contact"
                  className="px-7 py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl text-base transition-all duration-200 shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get A Quote
                </motion.a>
                <motion.a
                  href="/products"
                  className="px-7 py-3.5 bg-transparent border-2 border-gray-300 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 font-semibold rounded-xl text-base transition-all duration-200"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Browse Products
                </motion.a>
              </div>
            </motion.div>

            {/* Right Column - Feature Highlights */}
            <motion.div
              className="grid grid-cols-2 gap-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {[
                { label: "ISO Certified", icon: ShieldCheck },
                { label: "15+ Years Experience", icon: Target },
                { label: "24/7 Support", icon: Phone },
                { label: "Custom Solutions", icon: Wrench },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="group bg-gray-50 dark:bg-gray-900 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-800 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all duration-300 hover:shadow-lg"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-14 h-14 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500 transition-all duration-300">
                    <item.icon size={24} className="text-cyan-600 dark:text-cyan-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-32">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-px bg-cyan-500" />
              <span className="text-sm font-semibold tracking-[0.2em] uppercase text-cyan-600 dark:text-cyan-400">
                Client Stories
              </span>
              <div className="w-10 h-px bg-cyan-500" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              What Our{' '}
              <span className="text-cyan-500 dark:text-cyan-400">Clients Say</span>
            </h2>
            <div className="w-20 h-0.5 bg-cyan-500 mx-auto mt-4 rounded-full" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col relative overflow-hidden border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Quote size={28} className="text-cyan-400 dark:text-cyan-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base flex-1 mb-5">
                  "{t.text}"
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-base">
                      {t.name}
                    </p>
                    <p className="text-sm text-gray-400">{t.role}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        size={16}
                        className={`${s < t.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-gray-600"}`}
                      />
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
<div className="bg-cyan-700 p-4 flex items-center justify-between rounded-t-2xl">
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