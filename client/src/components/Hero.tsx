'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Star, 
  Clock, 
  Award,
  Sparkles,
  ChevronDown,
  Battery,
  Droplet,
  Sun,
  ThumbsUp,
  Headphones,
  Heart
} from 'lucide-react';

export default function Hero() {
  const [activeImage, setActiveImage] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mouseX.set(x);
        mouseY.set(y);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY, mouseX, mouseY]);

  const stats = [
    { value: '1K+', label: 'Happy Customers', icon: Heart, gradient: 'from-blue-500 to-cyan-500' },
    { value: '100+', label: ' Products', icon: Star, gradient: 'from-blue-600 to-indigo-600' },
    { value: '24/7', label: 'Expert Support', icon: Headphones, gradient: 'from-cyan-500 to-teal-500' },
    { value: '100%', label: 'Satisfaction', icon: ThumbsUp, gradient: 'from-blue-500 to-sky-500' }
  ];

  const categories = [
    { name: 'Pumps', icon: Droplet, color: 'from-cyan-500 to-blue-500' },
    { name: 'Generators', icon: Zap, color: 'from-blue-500 to-indigo-500' },
    { name: 'Solar', icon: Sun, color: 'from-sky-500 to-blue-500' },
    { name: 'Inverters', icon: Battery, color: 'from-blue-600 to-cyan-600' }
  ];

  const products = [
    {
      image: 'https://res.cloudinary.com/duxnsu61a/image/upload/v1775035077/dc2_rbbsin.jpg',
      title: 'Industrial Pump Systems',
      badge: 'Best Seller',
      price: 'KSh 45,000',
      rating: 4.8
    },
    {
      image: 'https://res.cloudinary.com/duxnsu61a/image/upload/v1776678927/natures-generator-elite-671170_qelk6n.webp',
      title: 'Solar Power Generator',
      badge: 'Eco Friendly',
      price: 'KSh 125,000',
      rating: 4.9
    },
    {
      image: 'https://res.cloudinary.com/duxnsu61a/image/upload/v1776678680/solar_panel_kit_xosdup.webp',
      title: 'Solar Panel Kit',
      badge: 'Energy Saver',
      price: 'KSh 85,000',
      rating: 4.7
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products.length]);

  const rotateX = useTransform(mouseX, [0, 1], [5, -5]);
  const rotateY = useTransform(mouseY, [0, 1], [-5, 5]);

  return (
    <>
      {/* Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full pointer-events-none z-50 hidden lg:block"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      />

      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
        
        {/* Animated Background Grid */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-cyan-500/5" />
        </div>

        {/* Animated Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
            className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
          

              {/* Main Heading */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-[1.2] tracking-tight"
              >
                Power Your
                <span className="relative inline-block mx-2">
                  <span className="relative z-10 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 bg-clip-text text-transparent">
                    World
                  </span>
                  <motion.svg 
                    className="absolute -bottom-2 left-0 w-full h-2"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                  >
                    <path 
                      d="M0,5 L100,5" 
                      stroke="#3B82F6" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                  </motion.svg>
                </span>
                <br />
                with Premium Equipment
              </motion.h1>
              
              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl lg:mx-0 mx-auto"
              >
                Discover top-quality pumps, generators, solar panels, and inverters for residential and industrial use. Engineered for excellence, built to last.
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 justify-center lg:justify-start mb-12"
              >
                <Link href="/products">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative z-10 flex items-center">
                      Explore Collection
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>
                </Link>
                <Link href="/categories">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 font-bold text-base rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    View Categories
                  </motion.button>
                </Link>
              </motion.div>

              {/* Stats Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto lg:mx-0"
              >
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="group text-center lg:text-left"
                    >
                      <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} bg-opacity-10 group-hover:scale-110 transition-all duration-300`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* Right Side - 3D Image Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main Image Container */}
                <div className="relative aspect-[4/3] w-full max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
                  {/* Glow Effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-2xl opacity-20 animate-pulse" />
                  
                  {/* Image Card */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                      className="relative h-full rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800"
                    >
                      <Image
                        src={products[activeImage].image}
                        alt={products[activeImage].title}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      
                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <motion.h3 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xl font-bold mb-1"
                        >
                          {products[activeImage].title}
                        </motion.h3>
                        <motion.p 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-2xl font-bold text-amber-400"
                        >
                          {products[activeImage].price}
                        </motion.p>
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center gap-1 mt-2"
                        >
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.floor(products[activeImage].rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                            ))}
                          </div>
                          <span className="text-sm">{products[activeImage].rating}</span>
                        </motion.div>
                      </div>
                      
                      {/* Badge */}
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-3 py-1.5 shadow-lg">
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          <Zap className="w-3 h-3" /> {products[activeImage].badge}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Thumbnail Navigation */}
                <div className="flex justify-center gap-3 mt-6">
                  {products.map((product, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                        activeImage === idx 
                          ? 'ring-2 ring-blue-500 shadow-lg' 
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </motion.button>
                  ))}
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                  {categories.map((cat, idx) => {
                    const Icon = cat.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + idx * 0.1 }}
                        whileHover={{ y: -3 }}
                        className="relative group"
                      >
                        <Link href={`/products?category=${cat.name}`}>
                          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
                            <div className={`p-1 rounded-lg bg-gradient-to-br ${cat.color}`}>
                              <Icon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 cursor-pointer z-20"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-12 border-2 border-gray-400 dark:border-gray-600 rounded-full flex flex-col items-center justify-start pt-2 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <motion.div 
              animate={{ height: [6, 12, 6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        .animate-pulse { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </>
  );
}