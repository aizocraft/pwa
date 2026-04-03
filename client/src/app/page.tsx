'use client'

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../lib/api'
import { Zap, Truck, Shield, HeadphonesIcon, ChevronRight, ArrowRight } from 'lucide-react';
import { useMemo } from 'react';

import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  // Featured products query
  const { data: featuredData } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => getProducts({ featured: true, limit: 8 }),
    staleTime: 5 * 60 * 1000 
  })

  // Benefits data
  const benefits = [
    {
      icon: Zap,
      title: 'Premium Quality',
      description: 'All products undergo rigorous quality testing',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Free delivery on orders above KSh 50,000',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Warranty Protection',
      description: 'Extended warranty on all equipment',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Expert technical support anytime',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <>
      <Hero />

      {/* Featured Products Section */}
      <section className="py-20 lg:py-28 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Our most popular and trusted equipment
              </p>
            </div>
            <Link href="/products">
              <button className="hidden sm:inline-flex items-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105">
                View All
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredData?.products?.map((product) => (
              <ProductCard 
                key={product._id}
                product={product}
              />
            )) || [...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-80" />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index} 
                  className="group text-center p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                >
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${benefit.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid-cta' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid-cta)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}
          />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Need Help Choosing the Right Equipment?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Our expert team is here to guide you. Get personalized recommendations based on your specific requirements.
          </p>
            <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://plasmawater.vercel.app/contact"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="group px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg rounded-full shadow-xl transition-all duration-300 transform hover:scale-105">
                <span className="flex items-center">
                  Contact Our Experts
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </a>

            <Link href="/products">
              <button className="px-8 py-4 border-2 border-white text-white hover:bg-white/10 font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105">
                Browse Products
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}