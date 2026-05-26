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
import { LogoLoop } from './LogoLoop'

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
    height: 80
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
    src: "/logo.png", 
    alt: "Plasma Water Africa", 
    href: "/",
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

  // Prepare logos for LogoLoop component
  const logosForLoop = partnerLogos.map(logo => ({
    src: logo.src,
    alt: logo.alt,
    href: logo.href,
    width: logo.width,
    height: logo.height
  }))

  return (
    <section ref={sectionRef} className="py-20 sm:py-24 lg:py-28 bg-white dark:bg-gray-950">
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

        {/* Partner Logos Section - Premium */}
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
<LogoLoop
  logos={partnerLogos.map(logo => ({
    src: logo.src,
    alt: logo.alt,
    href: logo.href,
    width: logo.width,
    height: logo.height
  }))}
  speed={80}
  direction="left"
  width="100%"
  logoHeight={64}
  gap={48}
  pauseOnHover={true}
  fadeOut={true}
  fadeOutColor="white"
  scaleOnHover={true}
  className="py-4"
/>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features