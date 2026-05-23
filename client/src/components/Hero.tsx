'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Zap, 
  Star, 
  Headphones,
  ThumbsUp,
  Droplet,
  Sun
} from 'lucide-react';
import SplitText from './SplitText';
import ShinyText from './ShinyText';
import Counter from './Counter';

export default function Hero() {
  const [activeImage, setActiveImage] = useState(0);
  const [currentBgImage, setCurrentBgImage] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Background images for carousel - using public folder images
  const bgImages = [
    {
      src: "/images/borehole-drilling5.jpg",
      alt: 'Borehole drilling in Africa',
      opacity: 40
    },
    {
      src: "/images/solar.jpg",
      alt: 'Solar installations in Africa',
      opacity: 30
    },
    {
      src: "/images/watertower.jpg",
      alt: 'Water tower construction in Africa',
      opacity: 35
    }
  ];

  const products = [
    {
      image: 'https://res.cloudinary.com/duxnsu61a/image/upload/v1775035077/dc2_rbbsin.jpg',
      title: 'Industrial Borehole Pump',
      badge: 'Best Seller',
      price: 'KSh 45,000',
      description: 'High-efficiency submersible pump'
    },
    {
      image: 'https://res.cloudinary.com/duxnsu61a/image/upload/v1776678927/natures-generator-elite-671170_qelk6n.webp',
      title: 'Solar Power System',
      badge: 'Eco Friendly',
      price: 'KSh 125,000',
      rating: 4.9,
      description: 'Complete home solar solution'
    },
    {
      image: 'https://res.cloudinary.com/duxnsu61a/image/upload/v1776678680/solar_panel_kit_xosdup.webp',
      title: 'Water Tower Tank',
      badge: 'Premium',
      price: 'KSh 85,000',
      description: 'Elevated steel water tank'
    }
  ];

  const categories = [
    { name: 'Borehole', icon: Droplet, color: 'from-cyan-500 to-blue-500', href: '/borehole-services' },
    { name: 'Solar', icon: Sun, color: 'from-sky-500 to-blue-500', href: '/solar-solutions' },
    { name: 'Water Towers', icon: Zap, color: 'from-blue-600 to-cyan-600', href: '/water-towers' }
  ];

  // Background image carousel - 4 seconds interval like old hero
  useEffect(() => {
    const bgInterval = setInterval(() => {
      setCurrentBgImage((prev) => (prev + 1) % bgImages.length);
    }, 4000);
    return () => clearInterval(bgInterval);
  }, [bgImages.length]);

  // Product carousel
  useEffect(() => {
    const productInterval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % products.length);
    }, 6000);
    return () => clearInterval(productInterval);
  }, [products.length]);

  // Mouse move effect for 3D tilt
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

  const rotateX = useTransform(mouseX, [0, 1], [8, -8]);
  const rotateY = useTransform(mouseY, [0, 1], [-8, 8]);

  const handleTitleAnimationComplete = () => {
    console.log('Hero title animation completed!');
  };

  const goToBgImage = (index: number) => {
    setCurrentBgImage(index);
  };

  return (
    <>
      {/* Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full pointer-events-none z-50 hidden lg:block mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      />

      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        
        {/* Background Images Carousel  */}
        <div className="absolute inset-0 z-0">
          {bgImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBgImage ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={image.src} 
                alt={image.alt} 
                className="w-full h-full object-cover"
                style={{ opacity: image.opacity / 100 }}
              />
            </div>
          ))}
          
          {/* Enhanced Overlay - Improved for better visibility in both light/dark mode */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/60 to-primary/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
            {/* Additional overlay for better text contrast */}
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Dot Indicators for Background - Positioned exactly like old hero */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
            {bgImages.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                  index === currentBgImage 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                onClick={() => goToBgImage(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Animated Background Grid */}
        <div className="absolute inset-0 w-full h-full z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/5" />
        </div>

        {/* Animated Orbs */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
            className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl"
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
              {/* Animated Main Title with SplitText */}
              <div className="mb-8">
                <SplitText
                  text="Plasma Water Africa"
                  className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl"
                  delay={50}
                  duration={0.8}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 80 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-100px"
                  textAlign="center lg:text-left"
                  onLetterAnimationComplete={handleTitleAnimationComplete}
                />
              </div>

              {/* Shiny Text Subtitle  */}
              <div className="mb-10 max-w-2xl lg:mx-0 mx-auto">
                <ShinyText 
                  text="Experts in borehole drilling, solar installations, and water tower construction. Bringing clean water and renewable energy to communities across Africa." 
                  disabled={false} 
                  speed={2} 
                  className="text-xl md:text-2xl text-white/95 leading-relaxed font-medium drop-shadow-lg" 
                />
              </div>
              
              {/* CTA Buttons with Premium Styling */}
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
                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-base rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative z-10 flex items-center">
                      Shop Now 
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute inset-0 ripple-effect"></div>
                    </div>
                  </motion.button>
                </Link>
                <Link href="/about">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold text-base rounded-2xl transition-all duration-300 backdrop-blur-sm bg-white/10 group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                    <span className="relative z-10 group-hover:text-gray-900 transition-colors duration-300">
                      Learn More
                    </span>
                    <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute w-1 h-1 bg-white/50 rounded-full top-1/4 left-1/4 animate-float"></div>
                      <div className="absolute w-1 h-1 bg-white/50 rounded-full top-1/3 right-1/3 animate-float" style={{animationDelay: '0.5s'}}></div>
                    </div>
                  </motion.button>
                </Link>
              </motion.div>

              {/* Stats Section with Counter - Using old hero styling and positioning */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 max-w-2xl mx-auto lg:mx-0"
              >
                <div className="text-center group">
                  <div className="relative">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent drop-shadow-lg">
                      <Counter end={500} duration={2} suffix="+" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:via-white/20 transition-all duration-500"></div>
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-white/90 mt-2 group-hover:text-white transition-colors duration-300 flex items-center justify-center gap-1">
                    <Droplet className="w-3 h-3 md:w-4 md:h-4" />
                    Boreholes Drilled
                  </div>
                  <div className="w-0 group-hover:w-12 h-0.5 bg-accent mx-auto mt-2 transition-all duration-500"></div>
                </div>

                <div className="text-center group">
                  <div className="relative">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent drop-shadow-lg">
                      <Counter end={100} duration={2.5} suffix="+" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:via-white/20 transition-all duration-500"></div>
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-white/90 mt-2 group-hover:text-white transition-colors duration-300 flex items-center justify-center gap-1">
                    <Sun className="w-3 h-3 md:w-4 md:h-4" />
                    Solar Installations
                  </div>
                  <div className="w-0 group-hover:w-12 h-0.5 bg-accent mx-auto mt-2 transition-all duration-500"></div>
                </div>

                <div className="text-center group">
                  <div className="relative">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent drop-shadow-lg">
                      <Counter end={24} duration={1.5} suffix="/7" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:via-white/20 transition-all duration-500"></div>
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-white/90 mt-2 group-hover:text-white transition-colors duration-300 flex items-center justify-center gap-1">
                    <Headphones className="w-3 h-3 md:w-4 md:h-4" />
                    Expert Support
                  </div>
                  <div className="w-0 group-hover:w-12 h-0.5 bg-accent mx-auto mt-2 transition-all duration-500"></div>
                </div>

                <div className="text-center group">
                  <div className="relative">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent drop-shadow-lg">
                      <Counter end={100} duration={2} suffix="%" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:via-white/20 transition-all duration-500"></div>
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-white/90 mt-2 group-hover:text-white transition-colors duration-300 flex items-center justify-center gap-1">
                    <ThumbsUp className="w-3 h-3 md:w-4 md:h-4" />
                    Satisfaction
                  </div>
                  <div className="w-0 group-hover:w-12 h-0.5 bg-accent mx-auto mt-2 transition-all duration-500"></div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - 3D Product Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="hidden lg:block"
            >
              <motion.div 
                className="relative"
                style={{ rotateX, rotateY }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Main Image Container */}
                <div className="relative aspect-[4/3] w-full max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
                  {/* Glow Effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-2xl opacity-30 animate-pulse" />
                  
                  {/* Image Card */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 0.95, rotateY: 10 }}
                      transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
                      className="relative h-full rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800"
                    >
                      <img
                        src={products[activeImage].image}
                        alt={products[activeImage].title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      
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
                          className="text-sm text-white/80 mb-2"
                        >
                          {products[activeImage].description}
                        </motion.p>
                        <motion.p 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
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
                       
                          <span className="text-sm text-white/80">{products[activeImage].rating}</span>
                        </motion.div>
                      </div>
                      
                      {/* Badge */}
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-3 py-1.5 shadow-lg"
                      >
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          <Zap className="w-3 h-3" /> {products[activeImage].badge}
                        </span>
                      </motion.div>
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
                          ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover"
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
                        <Link href={cat.href}>
                          <div className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full border border-white/20 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
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
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Wave - Improved position like old hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background) / 0.95)"/>
          </svg>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2 cursor-pointer z-20"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-12 border-2 border-white/50 rounded-full flex flex-col items-center justify-start pt-2 hover:border-white transition-colors"
          >
            <motion.div 
              animate={{ height: [6, 12, 6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 bg-gradient-to-t from-blue-400 to-cyan-300 rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        .animate-pulse { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes ripple {
          0% { transform: scale(0); opacity: 0.5; }
          100% { transform: scale(4); opacity: 0; }
        }
        .ripple-effect {
          animation: ripple 0.6s ease-out;
        }
      `}</style>
    </>
  );
}