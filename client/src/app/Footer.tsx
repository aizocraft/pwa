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
  Heart,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'

export default function Footer() {
  const { data: company } = useCompanySettings()
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [isHovered, setIsHovered] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Social platform icon mapping with brand colors
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

  const getSocialColor = (platform: string) => {
    const colors: Record<string, string> = {
      facebook: 'hover:bg-[#1877f2]',
      instagram: 'hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#8134af]',
      twitter: 'hover:bg-[#1da1f2]',
      linkedin: 'hover:bg-[#0a66c2]',
      youtube: 'hover:bg-[#ff0000]',
      github: 'hover:bg-[#333]',
    }
    return colors[platform.toLowerCase()] || 'hover:bg-blue-600'
  }

  // Handle newsletter signup
  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      console.log('Newsletter signup:', email)
      setEmail('')
      // Add toast notification here
    }
  }

  return (
    <footer className="relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800 mt-auto w-full overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand & Contact - Takes 5 columns */}
          <div className="lg:col-span-5 space-y-5">
            <Link 
              href="/" 
              className="inline-flex items-center space-x-3 group"
              onMouseEnter={() => setIsHovered('brand')}
              onMouseLeave={() => setIsHovered(null)}
            >
              {company?.logo && (
                <div className="relative">
                  <img 
                    src={company.logo.url || `/api/company/logo/${company.logo.fileId}`} 
                    alt={company.companyName} 
                    className="w-12 h-12 rounded-xl object-contain bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-2 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-3"
                  />
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 transition-opacity duration-500 ${isHovered === 'brand' ? 'opacity-100' : 'opacity-0'}`} />
                </div>
              )}
              <div className="transform transition-all duration-500 group-hover:translate-x-1">
                <div className="font-bold text-xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent bg-300% animate-gradient">
                  {company?.companyName || 'PlasmaWater'}
                </div>
                {company?.slogan && (
                  <div className="text-blue-600 dark:text-blue-400 text-xs font-medium tracking-wide mt-0.5 flex items-center gap-1">
                    
                    {company.slogan}
                    <Sparkles className="w-3 h-3" />
                  </div>
                )}
              </div>
            </Link>
            
            
            {/* Contact Info with Icons */}
            <div className="space-y-3 pt-2">
              {company?.address && (
                <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 group">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all duration-300 group-hover:scale-110">
                    <MapPin className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                    {company.address}
                  </span>
                </div>
              )}
              {company?.phone && (
                <a 
                  href={`tel:${company.phone}`} 
                  className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all duration-300 group-hover:scale-110">
                    <Phone className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    {company.phone}
                  </span>
                </a>
              )}
              {company?.email && (
                <a 
                  href={`mailto:${company.email}`} 
                  className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all duration-300 group-hover:scale-110">
                    <Mail className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    {company.email}
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links - Takes 3 columns */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {['Home', 'Products', 'Categories', 'Orders'].map((item, idx) => (
                <li key={idx}>
                  <Link 
                    href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                    onMouseEnter={() => setIsHovered(item)}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <div className={`w-1 h-1 rounded-full bg-blue-500 transition-all duration-300 ${isHovered === item ? 'w-2 h-2 scale-150' : 'w-1 h-1'}`} />
                    <span className={`transition-all duration-300 ${isHovered === item ? 'translate-x-2 font-medium' : ''}`}>
                      {item}
                    </span>
                    <ArrowUpRight className={`w-3 h-3 transition-all duration-300 ${isHovered === item ? 'translate-x-1 -translate-y-1 opacity-100' : 'opacity-0'}`} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Socials - Takes 4 columns */}
          <div className="lg:col-span-4">
            {/* Stay Updated Section */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                Stay Updated
              </h4>
              <form onSubmit={handleNewsletter} className="space-y-3">
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 pr-12 placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  Get the latest updates and exclusive offers
                </p>
              </form>
            </div>

            {/* Social Links - Below Stay Updated */}
            {company?.socialLinks && company.socialLinks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                  Connect With Us
                </h4>
                <div className="flex gap-3">
                  {company.socialLinks.map((link, index) => {
                    const Icon = getSocialIcon(link.platform)
                    const socialColor = getSocialColor(link.platform)
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group"
                        onMouseEnter={() => setIsHovered(`social-${index}`)}
                        onMouseLeave={() => setIsHovered(null)}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-all duration-300 ${socialColor} group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:scale-110`}>
                          <Icon className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:text-white" />
                        </div>
                        {/* Ripple effect */}
                        <div className={`absolute inset-0 rounded-xl bg-blue-500/0 transition-all duration-500 ${isHovered === `social-${index}` ? 'scale-150 opacity-0' : ''}`} />
                        {/* Tooltip */}
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
                          {link.platform}
                        </span>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar - With Terms & Privacy */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span>© {currentYear}</span>
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span>{company?.companyName || 'PlasmaWater Africa'}</span>
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span className="flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-500 hover:scale-125 transition-transform duration-300 animate-pulse" /> by aizocraft
              </span>
            </div>
            <div className="flex gap-6">
              <Link 
                href="/terms" 
                className="relative hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:translate-y-[-2px] inline-block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Terms
              </Link>
              <Link 
                href="/privacy" 
                className="relative hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:translate-y-[-2px] inline-block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Privacy
              </Link>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:translate-y-[-2px] inline-flex items-center gap-1 group"
              >
                <span>Back to top</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add gradient animation keyframes */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </footer>
  )
}