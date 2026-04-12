'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, Shield, Truck, Play, TrendingUp, Star, Clock, Award } from 'lucide-react';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { value: '10K+', label: 'Happy Customers', icon: TrendingUp },
    { value: '500+', label: 'Products', icon: Star },
    { value: '24/7', label: 'Support', icon: Clock },
    { value: '5★', label: 'Rating', icon: Award }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className={`text-center lg:text-left transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 lg:mb-8">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm text-white/90">Trusted by 10,000+ Customers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
              Power Your World with{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Premium Equipment
                </span>
                <svg className="absolute bottom-2 left-0 w-full h-3 -z-0 hidden sm:block" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,5 L100,5" stroke="url(#gradient-hero)" strokeWidth="3" strokeDasharray="5 5"/>
                  <defs>
                    <linearGradient id="gradient-hero" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FBBF24"/>
                      <stop offset="100%" stopColor="#F97316"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl lg:mx-0 mx-auto">
              Discover top-quality pumps, generators, solar panels, and inverters for residential and industrial use. Built to last, designed to perform. Best Prices.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-12">
              <Link href="/products">
                <button className="group relative px-6 sm:px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-gray-900 font-bold text-sm sm:text-base rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <span className="relative z-10 flex items-center">
                    Shop Now
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Link>
              <Link href="/categories">
                <button className="px-6 sm:px-8 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 text-white font-bold text-sm sm:text-base rounded-full transition-all duration-300 transform hover:scale-105">
                  Browse Categories
                </button>
              </Link>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto lg:mx-0">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                      <Icon className="w-5 h-5 text-yellow-400" />
                      <span className="text-2xl font-bold text-white">{stat.value}</span>
                    </div>
                    <p className="text-sm text-blue-200">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div> {/* This was missing - closes the left content div */}

          {/* Right Side Image */}
          <div className={`hidden lg:block transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            <div className="relative">
              <div className="relative aspect-[4/3] lg:aspect-[5/4] xl:aspect-[4/3] w-full max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
                <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-700 group">
                  <Image
                    src="https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800&auto=format"
                    alt="Premium Industrial Equipment"
                    fill
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                    priority
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full px-3 py-1.5 shadow-lg animate-bounce-slow">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Best Seller
                    </span>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-lg">
                    <span className="text-xs text-white flex items-center gap-1">
                      <Shield className="w-3 h-3 text-green-400" /> 2-Year Warranty
                    </span>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-lg">
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Free Shipping
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-white/50 rounded-full mt-2 animate-ping" />
        </div>
      </div>

      <style jsx>{`
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
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite; }
      `}</style>
    </section>
  );
}