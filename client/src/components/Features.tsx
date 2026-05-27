// src/components/Features.tsx
"use client"

import { useEffect, useRef, useState, useCallback, memo } from 'react'
import { 
  ShieldCheck, 
  Wrench, 
  Globe, 
  Headset, 
} from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

// Partner logos configuration
const partnerLogos = [
  { 
    src: "/logos/dayliff.png", 
    alt: "Dayliff", 
    href: "https://www.dayliff.com",
    width: 160,
    height: 80
  },
  { 
    src: "/logos/grundfos.png", 
    alt: "Grundfos", 
    href: "https://www.grundfos.com",
    width: 160,
    height: 100
  },
  { 
    src: "/logos/taflo.png", 
    alt: "Taflo", 
    href: "https://www.taflo.com",
    width: 160,
    height: 80
  },
  { 
    src: "/logos/pedrollo.png", 
    alt: "Pedrollo", 
    href: "https://pedrollo.com",
    width: 160,
    height: 80
  }
]

const features = [
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    description: "Certified materials and equipment ensuring long-lasting reliability",
  },
  {
    icon: Wrench,
    title: "Expert Engineering",
    description: "Professional team with decades of specialized experience",
  },
  {
    icon: Globe,
    title: "Sustainable Solutions",
    description: "Eco-friendly systems designed for maximum efficiency",
  },
  {
    icon: Headset,
    title: "24/7 Support",
    description: "Round-the-clock assistance and maintenance services",
  }
]

// Custom hook for scroll animation
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

// Split Text Animation Component
const AnimatedText = ({ 
  text, 
  className = "", 
  delay = 0,
  tag: Tag = 'h2'
}: { 
  text: string; 
  className?: string; 
  delay?: number;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLHeadingElement | HTMLParagraphElement | HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const Component = Tag as keyof JSX.IntrinsicElements

  return (
    <div ref={ref as any} className={`overflow-hidden ${className}`}>
      <Component>
        <span
          className={`inline-block transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {text}
        </span>
      </Component>
    </div>
  )
}

// Animated Feature Card Component - Minimalistic
const FeatureCard = memo(({ 
  feature, 
  index, 
  isVisible 
}: { 
  feature: typeof features[0]; 
  index: number; 
  isVisible: boolean;
}) => {
  const Icon = feature.icon
  
  return (
    <div 
      className={`group transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="text-center">
        {/* Icon - Clean and minimal */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Icon className="h-12 w-12 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {feature.title}
        </h3>
        
        {/* Divider */}
        <div className="w-12 h-0.5 bg-blue-500/50 mx-auto mb-3 group-hover:w-20 transition-all duration-300" />
        
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
          {feature.description}
        </p>
      </div>
    </div>
  )
})

FeatureCard.displayName = 'FeatureCard'

// Infinite Scrolling Logos Component
const InfiniteScrollingLogos = ({ 
  logos, 
  speed = 80,
  direction = 'left',
  pauseOnHover = true,
  fadeOut = true,
  fadeOutColor = 'white'
}: { 
  logos: typeof partnerLogos;
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: 'white' | 'gray-950' | string;
}) => {
  const [isPaused, setIsPaused] = useState(false)
  
  // Get the fade color based on background
  const getFadeColor = () => {
    if (fadeOutColor === 'white') return 'from-white dark:from-gray-950'
    if (fadeOutColor === 'gray-950') return 'from-gray-950'
    return `from-${fadeOutColor}`
  }

  return (
    <div 
      className={`relative overflow-hidden ${fadeOut ? `before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-20 before:bg-gradient-to-r before:${getFadeColor()} before:to-transparent before:content-[''] after:absolute after:right-0 after:top-0 after:h-full after:w-20 after:bg-gradient-to-l after:${getFadeColor()} after:to-transparent after:content-['']` : ''}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <motion.div
        transition={{
          duration: speed,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        }}
        initial={{ translateX: direction === 'left' ? 0 : '-50%' }}
        animate={{ 
          translateX: direction === 'left' ? '-50%' : 0,
        }}
        style={{
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
        className="flex flex-none gap-12 pr-12"
      >
        {/* Double the logos for seamless loop */}
        {[...new Array(2)].fill(0).map((_, index) => (
          <div key={index} className="flex gap-12">
            {logos.map((logo) => (
              <Link
                key={`${logo.alt}-${index}`}
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 transition-all duration-300 hover:scale-110 hover:opacity-100"
              >
               <div className="relative h-20 w-40 sm:h-24 sm:w-48 lg:h-28 lg:w-56">


                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    className="object-contain filter grayscale-[50%] hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </Link>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// Main Features Component
const Features = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const [visibleFeatures, setVisibleFeatures] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleFeatures(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
     <section ref={sectionRef} className="pt-0 pb-4 sm:pb-6 lg:pb-8 bg-white dark:bg-gray-950">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header Section - Minimalistic */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Why Choose Us
            </span>
          </div>
          
          <AnimatedText
            text="Premium Solutions Trusted Across Africa"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            tag="h2"
            delay={100}
          />
          
          <div className="max-w-2xl mx-auto">
            <AnimatedText
              text="Delivering excellence through expertise, quality, and unwavering commitment"
              className="text-base sm:text-lg text-gray-600 dark:text-gray-400"
              tag="p"
              delay={300}
            />
          </div>
        </div>

        {/* Features Grid - Minimalistic Design */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-24">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              index={index}
              isVisible={visibleFeatures}
            />
          ))}
        </div>

        {/* Partner Logos Section with Infinite Scrolling */}
        <div className="pt-12 border-t border-gray-100 dark:border-gray-800">
          <div className="text-center mb-12">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Trusted by Industry Leaders
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Partnering with world-class brands for premium solutions
            </p>
          </div>
          
          <div className="relative py-8">
            <InfiniteScrollingLogos 
              logos={partnerLogos}
              speed={60}
              direction="left"
              pauseOnHover={true}
              fadeOut={true}
              fadeOutColor="white"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features