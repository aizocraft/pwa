'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Truck, 
  TrendingUp, 
  Star, 
  Clock, 
  Award,
  Sparkles,
  CheckCircle,
  Play,
  ChevronDown
} from 'lucide-react';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { value: '10K+', label: 'Happy Customers', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { value: '500+', label: 'Products', icon: Star, color: 'from-yellow-500 to-orange-500' },
    { value: '24/7', label: 'Support', icon: Clock, color: 'from-blue-500 to-cyan-500' },
    { value: '5★', label: 'Rating', icon: Award, color: 'from-purple-500 to-pink-500' }
  ];

  const features = [
    { icon: Shield, text: '2 Year Warranty', color: 'text-green-500' },
    { icon: Truck, text: 'Free Shipping', color: 'text-blue-500' },
    { icon: Zap, text: 'Energy Efficient', color: 'text-yellow-500' }
  ];

  const products = [
    {
      image: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800&auto=format',
      title: 'Industrial Pumps',
      badge: 'Best Seller'
    },
    {
      image: 'https://images.unsplash.com/photo-1581092335871-4d4b1e2e7b2c?w=800&auto=format',
      title: 'Solar Panels',
      badge: 'Eco Friendly'
    }
  ];

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-all duration-500">
        
        {/* Animated Background Elements - Light Mode */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='currentColor' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}
          />

          {/* Gradient Orbs */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-500/30 to-teal-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            
            {/* Left Content */}
            <div className={`text-center lg:text-left transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              
              {/* Trust Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm mb-6 lg:mb-8">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Trusted by 10,000+ Customers
                </span>
                <Sparkles className="w-3 h-3 ml-2 text-yellow-500" />
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Power Your World with{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                    Premium Equipment
                  </span>
                  {/* Animated underline */}
                  <svg className="absolute bottom-2 left-0 w-full h-3 -z-0 hidden sm:block" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 L100,5" stroke="url(#gradient-hero)" strokeWidth="3" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="gradient-hero" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6"/>
                        <stop offset="50%" stopColor="#8B5CF6"/>
                        <stop offset="100%" stopColor="#EC4899"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl lg:mx-0 mx-auto">
                Discover top-quality pumps, generators, solar panels, and inverters for residential and industrial use. Built to last, designed to perform at the best prices.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-12">
                <Link href="/products">
                  <button className="group relative px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-sm sm:text-base rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95">
                    <span className="relative z-10 flex items-center">
                      Shop Now
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </Link>
                <Link href="/categories">
                  <button className="px-6 sm:px-8 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 font-bold text-sm sm:text-base rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                    Browse Categories
                  </button>
                </Link>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto lg:mx-0">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="group text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                        </div>
                        <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Image Carousel */}
            <div className={`hidden lg:block transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                {/* Main Image Container */}
                <div className="relative aspect-[4/3] lg:aspect-[5/4] xl:aspect-[4/3] w-full max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
                  {/* Glow Effect */}
                  <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
                  
                  {/* Image Card */}
                  <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-700 group bg-white dark:bg-gray-800">
                    <Image
                      src={products[activeImage].image}
                      alt={products[activeImage].title}
                      fill
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                      priority
                      unoptimized
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full px-3 py-1.5 shadow-lg animate-bounce-slow">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <Zap className="w-3 h-3" /> {products[activeImage].badge}
                      </span>
                    </div>
                    
                    {/* Feature Pills */}
                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                      {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                          <div key={idx} className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-lg">
                            <span className={`text-xs text-white flex items-center gap-1 ${feature.color}`}>
                              <Icon className="w-3 h-3" /> {feature.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Thumbnail Navigation */}
                <div className="flex justify-center gap-3 mt-6">
                  {products.map((product, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                        activeImage === idx 
                          ? 'ring-2 ring-blue-500 scale-105 shadow-lg' 
                          : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-500 rounded-full blur-2xl opacity-30 animate-pulse delay-1000" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
          <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-500 rounded-full flex justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
            <div className="w-1.5 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 animate-ping" />
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-1 mx-auto" />
        </div>
      </section>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite; }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-pulse { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </>
  );
}