'use client'

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../lib/api'
import { ArrowRight, ChevronRight, Building2, Droplets, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import Services from '@/components/Services';
import Features from '@/components/Features';

export default function Home() {
  // Featured products query
  const { data: featuredData } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => getProducts({ featured: true, limit: 8 }),
    staleTime: 5 * 60 * 1000 
  })

  // Service categories for quick navigation
  const serviceCategories = [
    {
      name: 'Borehole Drilling',
      icon: Droplets,
      href: '/borehole-drilling',
      gradient: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30',
      stats: '500+ Projects'
    },
    {
      name: 'Solar Solutions',
      icon: Sun,
      href: '/solar-solutions',
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
      stats: '100+ Installations'
    },
    {
      name: 'Water Towers',
      icon: Building2,
      href: '/water-towers',
      gradient: 'from-emerald-500 to-green-500',
      bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30',
      stats: '50+ Structures'
    }
  ];

  return (
    <>
      <Hero />

      {/* Services Component */}
      <Services />

      {/* Featured Products Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-end mb-12"
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-1.5 mb-4">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Shop Now</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Our most popular and trusted equipment for your needs
              </p>
            </div>
            <Link href="/products">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                View All Products
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featuredData?.products?.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            )) || [...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-80" />
            ))}
          </div>
          
          {/* Mobile View All Button */}
          <div className="text-center mt-10 sm:hidden">
            <Link href="/products">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-lg">
                View All Products
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Service Categories Quick Links */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Our Solutions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose from our range of specialized services
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {serviceCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={category.href}>
                    <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.bgGradient} p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                      
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${category.gradient} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {category.name}
                      </h3>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {category.stats}
                      </p>
                      
                      <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-3 transition-all">
                        Learn More
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Component (Replaces Benefits) */}
      <Features />

  {/* Enhanced CTA Section */}
<section className="relative py-24 lg:py-32 overflow-hidden">
  {/* Animated Background - Plasma Water Africa Colors */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-orange-600">
    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
    
    {/* Animated floating particles */}
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          animate={{
            y: [null, -100, -200],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
    
    {/* Gradient orbs - Brand colors */}
    <motion.div 
      animate={{ 
        scale: [1, 1.2, 1],
        x: [0, 100, 0],
        y: [0, -50, 0]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl"
    />
    <motion.div 
      animate={{ 
        scale: [1, 1.3, 1],
        x: [0, -100, 0],
        y: [0, 50, 0]
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 3 }}
      className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-orange-400/30 to-yellow-400/30 rounded-full blur-3xl"
    />
  </div>
  
  <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
        Ready to Transform Your{' '}
        <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
          Energy & Water Solutions?
        </span>
      </h2>
      
      <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
        Our expert team is ready to provide personalized recommendations and guide you through every step of your project.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <motion.a 
          href="/contact"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="group relative px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative z-10 flex items-center gap-2">
            Contact Our Experts
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.a>

        <motion.a 
          href="/products"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-4 border-2 border-white/50 text-white hover:bg-white/10 font-bold text-lg rounded-2xl transition-all duration-300 backdrop-blur-sm"
        >
          Browse Products
        </motion.a>
      </div>
    </motion.div>
  </div>
</section>



    </>
  );
}