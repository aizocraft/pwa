// src/components/Features.tsx
"use client"

import { useEffect, useRef, useState, useCallback, memo } from 'react'
import { CheckCircle, Award, Users, Wrench } from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'

// Partner logos configuration
const partnerLogos = [
  { 
    src: "/logos/dayliff.png", 
    alt: "Dayliff", 
    href: "https://www.dayliff.com",
    width: 120,
    height: 60
  },
  { 
    src: "/logos/grundfos.png", 
    alt: "Grundfos", 
    href: "https://www.grundfos.com",
    width: 120,
    height: 60
  },
  { 
    src: "/logos/taflo.png", 
    alt: "Taflo", 
    href: "https://www.taflo.com",
    width: 120,
    height: 60
  },
  { 
    src: "/logos/pedrollo.png", 
    alt: "Pedrollo", 
    href: "https://pedrollo.com",
    width: 120,
    height: 60
  },
  { 
    src: "/logo.png", 
    alt: "Plasma Water Africa", 
    href: "/",
    width: 120,
    height: 60
  },
]

const features = [
  {
    icon: Award,
    title: "Expert Team",
    description: "Certified professionals with years of experience in water and energy solutions",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: CheckCircle,
    title: "Quality Assured",
    description: "Premium equipment and materials ensuring long-lasting, reliable installations",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Users,
    title: "Community Focused",
    description: "Committed to improving lives through sustainable water and energy access",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Wrench,
    title: "Full Support",
    description: "Comprehensive maintenance and support services for all our installations",
    gradient: "from-purple-500 to-pink-500"
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

// Animated Counter Component
const AnimatedCounter = ({ target, duration = 2000 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0)
  const { ref, isVisible } = useScrollAnimation()

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount)
      }
    }

    animationFrame = requestAnimationFrame(updateCount)
    return () => cancelAnimationFrame(animationFrame)
  }, [isVisible, target, duration])

  return <span ref={ref}>{count.toLocaleString()}+</span>
}

// Split Text Animation Component (standalone with proper typing)
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
      className={`text-center group transform transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-all duration-300 group-hover:shadow-2xl`}>
        <Icon className="h-12 w-12 text-white" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
        {feature.title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-xs mx-auto">
        {feature.description}
      </p>
    </div>
  )
})

FeatureCard.displayName = 'FeatureCard'

// Logo Loop Component (standalone)
const LogoLoop = memo(({ 
  logos, 
  speed = 20,
  direction = 'left' 
}: { 
  logos: typeof partnerLogos; 
  speed?: number;
  direction?: 'left' | 'right';
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [duplicatedLogos, setDuplicatedLogos] = useState(partnerLogos)

  useEffect(() => {
    setDuplicatedLogos([...logos, ...logos, ...logos])
  }, [logos])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationId: number
    let position = 0
    const speedPx = speed
    let lastTimestamp = 0

    const animate = (timestamp: number) => {
      if (!container) return
      
      if (lastTimestamp === 0) {
        lastTimestamp = timestamp
        animationId = requestAnimationFrame(animate)
        return
      }

      const delta = Math.min(timestamp - lastTimestamp, 16)
      lastTimestamp = timestamp

      if (!isHovered) {
        position += speedPx * (delta / 16) * (direction === 'left' ? 1 : -1)
        
        const containerWidth = container.offsetWidth
        const contentWidth = container.scrollWidth / 3
        
        if (direction === 'left') {
          if (position >= contentWidth) position = 0
          if (position < 0) position = contentWidth
        } else {
          if (position <= -contentWidth) position = 0
          if (position > 0) position = -contentWidth
        }
        
        container.style.transform = `translateX(${-position}px)`
      }
      
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [speed, direction, isHovered])

  return (
    <div 
      className="w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        ref={containerRef}
        className="flex gap-12 items-center will-change-transform"
        style={{ width: 'max-content' }}
      >
        {duplicatedLogos.map((logo, idx) => (
          <Link
            key={idx}
            href={logo.href}
            target={logo.href.startsWith('http') ? '_blank' : undefined}
            rel={logo.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="flex-shrink-0 transition-all duration-300 hover:scale-110 hover:opacity-80"
          >
            <div className="relative w-32 h-16">
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 96px, 128px"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
})

LogoLoop.displayName = 'LogoLoop'


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
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="mb-4">
            <AnimatedText
              text="Why Choose Plasma Water Africa?"
              className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
              tag="h2"
              delay={100}
            />
          </div>
          
          <div className="max-w-2xl mx-auto">
            <AnimatedText
              text="Trusted expertise delivering sustainable solutions across Africa"
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300"
              tag="p"
              delay={300}
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              index={index}
              isVisible={visibleFeatures}
            />
          ))}
        </div>

    

        {/* Partner Logos Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Partnering with world-class brands 
          
            </h3>

          </div>
          
          <div className="relative py-8">
            {/* Gradient overlays for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
            
            <LogoLoop logos={partnerLogos} speed={7.5} direction="left" />
          </div>
        </div>
 
      </div>
    </section>
  )
}

export default Features