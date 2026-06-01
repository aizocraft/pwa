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
  },
  { 
    src: "/logos/deye.png", 
    alt: "Deye",
    href: "https://www.deyeinverter.com",
    width: 160,
    height: 80
  },  
  { 
    src: "/logos/doyin.png", 
    alt: "Doyin",
    href: "https://doyin.com",
    width: 160,
    height: 80
  },
  { 
    src: "/logos/genvik.png", 
    alt: "Genvik",
    href: "https://genvik.com",
    width: 160,
    height: 80
  },
  { 
    src: "/logos/megatank.png", 
    alt: "Megatank",
    href: "https://megatank.com",
    width: 160,
    height: 80
  },
  { 
    src: "/logos/snre.png", 
    alt: "SNRE",
    href: "https://www.snre.com",
    width: 160,
    height: 80
  },

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

// Animated Feature Card Component 
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
      <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950 hover:shadow-xl transition-all duration-300">
        {/* Icon - Larger size */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Icon className="h-16 w-16 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>
        
        {/* Title - Larger */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {feature.title}
        </h3>
        
        {/* Divider */}
        <div className="w-16 h-0.5 bg-blue-500/50 mx-auto mb-4 group-hover:w-28 transition-all duration-300" />
        
        {/* Description - Larger text */}
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
          {feature.description}
        </p>
      </div>
    </div>
  )
})

FeatureCard.displayName = 'FeatureCard'

// Infinite Scrolling Logos Component - Larger logos
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
      className={`relative overflow-hidden ${fadeOut ? `before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-24 before:bg-gradient-to-r before:${getFadeColor()} before:to-transparent before:content-[''] after:absolute after:right-0 after:top-0 after:h-full after:w-24 after:bg-gradient-to-l after:${getFadeColor()} after:to-transparent after:content-['']` : ''}`}
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
        className="flex flex-none gap-16 pr-16"
      >
        {/* Double the logos for seamless loop */}
        {[...new Array(2)].fill(0).map((_, index) => (
          <div key={index} className="flex gap-16">
            {logos.map((logo) => (
              <Link
                key={`${logo.alt}-${index}`}
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 transition-all duration-300 hover:scale-110 hover:opacity-100"
              >
               <div className="relative h-24 w-48 sm:h-28 sm:w-56 lg:h-32 lg:w-64">
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
      {/* Reduced margins - full width with max-width constraint */}
      <div className="px-2 sm:px-4 lg:max-w-8xl lg:mx-auto">
        
        {/* Header Section - Larger spacing */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 rounded-full px-5 py-2 mb-6">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Why Choose Us
            </span>
          </div>

          
          <div className="max-w-3xl mx-auto">
            <AnimatedText
              text="Delivering excellence through expertise, quality, and unwavering commitment"
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-400"
              tag="p"
              delay={300}
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 xl:gap-10 mb-28 lg:mb-10">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              index={index}
              isVisible={visibleFeatures}
            />
          ))}
        </div>

        {/* Partner Logos Section with Infinite Scrolling*/}
        <div className="pt-16 border-t border-gray-100 dark:border-gray-800">
          <div className="text-center mb-12">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Partnering with world-class brands for premium solutions
            </h3>
            
          </div>
          
          <div className="relative py-10">
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