'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/lib/api';
import { ArrowRight, ChevronRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import Services from '@/components/Services';
import Features from '@/components/Features';

export default function HomeClient() {
  // Featured products query
  const { data: featuredData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => getProducts({ featured: true, limit: 10 }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      <Hero />
      <Services />

      <section className="py-12 lg:py-16 bg-white dark:bg-gray-950">
        <div className="px-2 sm:px-4 lg:max-w-8xl lg:mx-auto lg:mx-4 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 max-w-full"
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-1.5 mb-4">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  Shop Now
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Featured Products
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                Our most popular and trusted equipment for your needs
              </p>
            </div>

            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View All Products
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {featuredData?.products?.slice(0, 5).map((product: any, index: number) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="min-w-0"
              >
                <ProductCard product={product} />
              </motion.div>
            )) ||
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-2xl h-80"
                />
              ))}
          </div>

          <div className="text-center mt-10 sm:hidden">
            <Link href="/products">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-all duration-300">
                View All Products
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Features />

<section className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-blue-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              }}
              animate={{ y: [null, -150, -300], opacity: [0, 0.5, 0] }}
              transition={{ duration: Math.random() * 6 + 4, repeat: Infinity, delay: Math.random() * 5 }}
            />
          ))}

          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
          />

          <motion.div
            animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, 30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear', delay: 3 }}
            className="absolute bottom-20 right-10 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-white/80" />
              <span className="text-sm font-medium text-white/90">Trusted by Clients</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to Transform Your{' '}
<span className="text-blue-200">
                Water & Energy Solutions?
              </span>
            </h2>

            <div className="flex flex-wrap justify-center gap-4">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-8 py-4 bg-white text-blue-700 font-bold text-base sm:text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
<span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative z-10 flex items-center gap-2">
                  Contact Our Experts
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </motion.a>

              <motion.a
                href="/products"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 border-2 border-white/30 text-white hover:bg-white/10 font-bold text-base sm:text-lg rounded-xl transition-all duration-300 backdrop-blur-sm"
              >
                Browse Products
              </motion.a>
            </div>

            <p className="text-xs text-white/50 mt-8">Free consultation • Quick response</p>
          </motion.div>
        </div>
      </section>
    </>
  );
}

