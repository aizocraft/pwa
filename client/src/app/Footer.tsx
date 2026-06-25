'use client'

import { useCompanySettings } from '@/lib/use-company-settings'
import Link from 'next/link'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube,
  Github,
  Send,
  ArrowUpRight,
  ChevronUp
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Footer() {
  const { data: company } = useCompanySettings()
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [isHovered, setIsHovered] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, any> = {
      facebook: Facebook,
      instagram: Instagram,
      twitter: Twitter,
      linkedin: Linkedin,
      youtube: Youtube,
      github: Github,
    }
    const Icon = icons[platform.toLowerCase()]
    return Icon || Send
  }

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      console.log('Newsletter signup:', email)
      setEmail('')
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Split phone numbers if they contain commas
  const getPhoneNumbers = (phoneString: string | undefined) => {
    if (!phoneString) return []
    return phoneString.split(',').map(phone => phone.trim()).filter(phone => phone)
  }

  const phoneNumbers = getPhoneNumbers(company?.phone)

  return (
    <>
      <footer className="relative bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 mt-auto w-full">
        {/* Divider */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary-500 dark:bg-primary-400" />
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, gray 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          {/* Main Footer Grid - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
            
            {/* Brand & Contact - Full width on mobile, 5 cols on desktop */}
            <div className="md:col-span-5 space-y-5">
              <Link 
                href="/" 
                className="inline-flex items-center gap-3 group"
                onMouseEnter={() => setIsHovered('brand')}
                onMouseLeave={() => setIsHovered(null)}
              >
                {company?.logo && (
                  <div className="relative">
                    <img 
                      src={company.logo.url || `/api/company/logo/${company.logo.fileId}`} 
                      alt={company.companyName} 
                      className="w-10 h-10 md:w-11 md:h-11 rounded-xl object-contain bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-2 transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg"
                    />
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 transition-opacity duration-500 ${isHovered === 'brand' ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                )}
                <div>
                  <div className="font-bold text-lg md:text-xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent bg-300% animate-gradient">
                    {company?.companyName || 'PlasmaWater'}
                  </div>
                  {company?.slogan && (
                    <div className="text-blue-600 dark:text-blue-400 text-[11px] md:text-xs font-medium tracking-wide mt-0.5 flex items-center gap-1">
                      {company.slogan}
                    </div>
                  )}
                </div>
              </Link>
              
              {/* Contact Info - Compact on mobile */}
              <div className="space-y-2.5">
                {company?.address && (
                  <div className="flex items-start gap-2.5 text-xs md:text-sm text-gray-600 dark:text-gray-400 group">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
                      <MapPin className="w-3.5 h-3.5 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <span className="group-hover:text-gray-900 dark:group-hover:text-white transition-colors leading-relaxed">
                      {company.address}
                    </span>
                  </div>
                )}
                
                {/* Multiple Phone Numbers */}
                {phoneNumbers.length > 0 && (
                  <div className="space-y-2">
                    {phoneNumbers.map((phone, index) => (
                      <a 
                        key={index}
                        href={`tel:${phone.replace(/\s/g, '')}`} 
                        className="flex items-center gap-2.5 text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
                        onMouseEnter={() => setIsHovered(`phone-${index}`)}
                        onMouseLeave={() => setIsHovered(null)}
                      >
                        <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
                          <Phone className="w-3.5 h-3.5 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <span className="group-hover:translate-x-0.5 transition-transform">
                          {phone}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
                
                {company?.email && (
                  <a 
                    href={`mailto:${company.email}`} 
                    className="flex items-center gap-2.5 text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
                      <Mail className="w-3.5 h-3.5 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      {company.email}
                    </span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links - 3 columns */}
<div className="md:col-span-3">
  <h4 className="text-[11px] md:text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
    Quick Links
  </h4>

  <ul className="space-y-2.5">
    {[
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
      { name: 'Solar Solutions', path: '/solar-solutions' },
      { name: 'Borehole Services', path: '/borehole-services' },
      { name: 'Products', path: '/products' },
      { name: 'Orders', path: '/orders' },
      { name: 'Projects', path: '/projects' },
    ].map((item, idx) => (
      <li key={idx}>
        <Link
          href={item.path}
          className="group flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
          onMouseEnter={() => setIsHovered(item.name)}
          onMouseLeave={() => setIsHovered(null)}
        >
          <div
            className={`w-1 h-1 rounded-full bg-blue-500 transition-all duration-300 ${
              isHovered === item.name ? 'w-1.5 h-1.5' : ''
            }`}
          />

          <span
            className={`transition-all duration-300 ${
              isHovered === item.name ? 'translate-x-1' : ''
            }`}
          >
            {item.name}
          </span>

          <ArrowUpRight
            className={`w-3 h-3 transition-all duration-300 ${
              isHovered === item.name
                ? 'translate-x-0.5 -translate-y-0.5 opacity-100'
                : 'opacity-0'
            }`}
          />
        </Link>
      </li>
    ))}
  </ul>
</div>

            {/* Newsletter & Socials - 4 columns */}
            <div className="md:col-span-4">
              {/* Newsletter */}
              <div className="mb-6">
                <h4 className="text-[11px] md:text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  Stay Updated
                </h4>
                <form onSubmit={handleNewsletter} className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Your email address"
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-12 placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all hover:scale-105 active:scale-95 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Social Links */}
              {company?.socialLinks && company.socialLinks.length > 0 && (
                <div>
                  <h4 className="text-[11px] md:text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    Connect
                  </h4>
                  <div className="flex gap-2">
                    {company.socialLinks.slice(0, 6).map((link, index) => {
                      const Icon = getSocialIcon(link.platform)
                      return (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative"
                          onMouseEnter={() => setIsHovered(`social-${index}`)}
                          onMouseLeave={() => setIsHovered(null)}
                        >
                          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-all duration-300 hover:scale-110 hover:shadow-md group-hover:-translate-y-0.5">
                            <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 transition-all duration-300 group-hover:scale-110" />
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar - Compact & Responsive */}
          <div className="border-t border-gray-100 dark:border-gray-800 mt-8 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span>© {currentYear}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="font-medium">{company?.companyName || 'PlasmaWater Africa'}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
 <span className="inline-flex items-center gap-1">
  Built in
</span>
<a 
  href="https://nextjs.org" 
  target="_blank" 
  rel="noopener noreferrer"
  className="relative font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all inline-flex items-center gap-1 group"
>
  <svg 
    className="w-3.5 h-3.5 transition-all duration-300 group-hover:scale-110" 
    viewBox="0 0 180 180" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <mask id="nextjs-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
      <circle cx="90" cy="90" r="90" fill="white" />
    </mask>
    <g mask="url(#nextjs-mask)">
      <circle cx="90" cy="90" r="90" fill="black" />
      <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="url(#nextjs-gradient)" />
      <rect x="115" y="54" width="12" height="72" fill="url(#nextjs-gradient)" />
    </g>
    <defs>
      <linearGradient id="nextjs-gradient" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
  Next.js
  <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
</a>
              </div>


              <div className="flex gap-4">
                <Link 
                  href="/terms" 
                  className="relative hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:translate-y-[-1px] inline-block"
                >
                  Terms
                </Link>
                <Link 
                  href="/privacy" 
                  className="relative hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:translate-y-[-1px] inline-block"
                >
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  )
}