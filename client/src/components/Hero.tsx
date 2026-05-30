'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ArrowRight, 
  Headphones,
  ThumbsUp,
  Droplet,
  Sun
} from 'lucide-react';
import SplitText from './SplitText';
import ShinyText from './ShinyText';
import Counter from './Counter';

export default function Hero() {
  const [currentBgImage, setCurrentBgImage] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Background images for carousel
  const bgImages = [
    {
      src: "/images/borehole-drilling5.jpg",
      alt: 'Borehole drilling in Africa',
    },
    {
      src: "/images/solar.jpg",
      alt: 'Solar installations in Africa',
    },
    {
      src: "/images/watertower.jpg",
      alt: 'Water tower construction in Africa',
    }
  ];

  // Stats data
  const stats = [
    { value: 500, suffix: '+', label: 'Boreholes Drilled', icon: Droplet, duration: 2 },
    { value: 100, suffix: '+', label: 'Solar Installations', icon: Sun, duration: 2.5 },
    { value: 24, suffix: '/7', label: 'Expert Support', icon: Headphones, duration: 1.5 },
    { value: 100, suffix: '%', label: 'Satisfaction', icon: ThumbsUp, duration: 2 }
  ];

  // Background image carousel
  useEffect(() => {
    const bgInterval = setInterval(() => {
      setCurrentBgImage((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(bgInterval);
  }, [bgImages.length]);

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

  const rotateX = useTransform(mouseX, [0, 1], [5, -5]);
  const rotateY = useTransform(mouseY, [0, 1], [-5, 5]);

  const goToBgImage = (index: number) => {
    setCurrentBgImage(index);
  };

  return (
    <>
      <section 
        ref={heroRef} 
        className="relative min-h-[85vh] md:min-h-[95vh] lg:min-h-[90vh] lg:mt-7 flex items-center justify-center overflow-hidden"
      >
        {/* Background Images Carousel - No overlay */}
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
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
          
          {/* Subtle dark gradient only at bottom for text readability - no overlay on main image */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
          
          {/* Background Dots Indicator */}
          <div className="absolute bottom-28 sm:bottom-24 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 sm:gap-3">
            {bgImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                  index === currentBgImage 
                    ? 'bg-[#3b82f6] scale-125 shadow-lg shadow-blue-500/50 w-4 sm:w-5' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                onClick={() => goToBgImage(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Subtle Animated Orbs - very faint */}
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 -left-32 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, -50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 5 }}
            className="absolute bottom-1/4 -right-32 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 md:py-16 lg:py-20">
          <div className="flex flex-col items-center text-center">
            
            {/* Animated Main Title - Delayed and centered */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="mb-4 sm:mb-6"
            >
              <SplitText
                text="Plasma Water Africa"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 leading-tight drop-shadow-2xl tracking-tight"
                delay={60}
                duration={0.7}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 60 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="center"
                onLetterAnimationComplete={() => {}} 
              />
            </motion.div>

            {/* Glassmorphism style with shiny text - Black text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12"
            >
              <div className="bg-white/30 backdrop-blur-md rounded-2xl p-5 sm:p-8 shadow-xl border border-white/50">
                <ShinyText 
                  text="Experts in borehole drilling, solar installations, and water tower construction. Bringing clean water and renewable energy to communities across Africa." 
                  disabled={false} 
                  speed={4} 
                  className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed font-medium text-center text-black" 
                />
              </div>
            </motion.div>

            {/* CTA Buttons - Minimalist Ultra-Modern */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4 justify-center mb-10 sm:mb-16 md:mb-20"
            >
              {/* Shop Now - Solid Modern */}
              <Link href="/products">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-6 sm:px-9 py-3 sm:py-4 bg-[#1e3a8a] text-white font-semibold text-sm sm:text-base rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#1e3a8a] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center gap-2">
                    Shop Now
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </motion.button>
              </Link>

              {/* Learn More - Outline Modern */}
              <Link href="/about">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative px-6 sm:px-9 py-3 sm:py-4 font-semibold text-sm sm:text-base rounded-full transition-all duration-300 group"
                >
                  <span className="absolute inset-0 border-2 border-white/80 rounded-full group-hover:border-[#3b82f6] transition-colors duration-300" />
                  <span className="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                  <span className="relative z-10 text-white group-hover:text-white flex items-center gap-2">
                    Learn More
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.span>
                  </span>
                </motion.button>
              </Link>
            </motion.div> 
          
            {/* Stats Section - Extreme Minimalist */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap justify-center gap-6 sm:gap-12 md:gap-16 max-w-3xl mx-auto w-full px-2"
            >
              {/* Boreholes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  <Counter end={500} duration={2} suffix="+" />
                </div>
                <div className="text-xs sm:text-sm text-white/60 mt-1 sm:mt-2">Boreholes</div>
              </motion.div>

              {/* Solar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  <Counter end={100} duration={2.5} suffix="+" />
                </div>
                <div className="text-xs sm:text-sm text-white/60 mt-1 sm:mt-2">Solar Projects</div>
              </motion.div>

              {/* Satisfaction */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  <Counter end={100} duration={2} suffix="%" />
                </div>
                <div className="text-xs sm:text-sm text-white/60 mt-1 sm:mt-2">Satisfaction</div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Wave - Pushed further down */}
        <div className="absolute bottom-0 left-0 right-0 z-10 leading-none pointer-events-none">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path 
              d="M0 70L60 63.3C120 56.7 240 43.3 360 38.3C480 33.3 600 36.7 720 40C840 43.3 960 46.7 1080 43.3C1200 40 1320 30 1380 25L1440 20V70H1380C1320 70 1200 70 1080 70C960 70 840 70 720 70C600 70 480 70 360 70C240 70 120 70 60 70H0Z" 
              fill="hsl(var(--background))"
            />
          </svg>
        </div>

        {/* Scroll Indicator - Moved up slightly to avoid hiding dots */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 cursor-pointer z-20 hidden sm:block"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-9 sm:w-7 sm:h-10 border-2 border-white/40 rounded-full flex flex-col items-center justify-start pt-1.5 sm:pt-2 hover:border-white/70 transition-colors"
          >
            <motion.div 
              animate={{ height: [4, 8, 4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 bg-gradient-to-t from-[#3b82f6] to-[#1e3a8a] rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}