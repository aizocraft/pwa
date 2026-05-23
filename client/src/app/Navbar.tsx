// src/app/Navbar.tsx
"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useCartStore } from '@/store/cart'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Search, 
  User, 
  ChevronDown,
  Home,
  Package,
  Phone,
  Droplets,
  Sun as SunIcon,
  Building2,
  Wrench,
  Map,
  FileText,
  Drill,
  GitBranch,
  Waves,
  Battery,
  Thermometer,
  Sprout,
  Award,
  Shield,
  ArrowRight,
  Briefcase,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/context/ThemeContext'
import Avatar from '@/components/Avatar'
import { useProfile } from '@/lib/profile'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showBoreholeMenu, setShowBoreholeMenu] = useState(false)
  const [showSolarMenu, setShowSolarMenu] = useState(false)
  const [showWaterTowerMenu, setShowWaterTowerMenu] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [avatarKey, setAvatarKey] = useState(Date.now())
  
  const { totalItems, loading: cartLoading } = useCartStore()
  const { user, isLoggedIn, loading: authLoading, logout, isAdmin, isSales } = useAuth()
  const { profile, refetch: refetchProfile } = useProfile()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  // Refs for dropdowns
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const boreholeMenuRef = useRef<HTMLDivElement>(null)
  const solarMenuRef = useRef<HTMLDivElement>(null)
  const waterTowerMenuRef = useRef<HTMLDivElement>(null)
  let hoverTimeout: NodeJS.Timeout

  // Check if user has sales access
  const hasSalesAccess = isSales || isAdmin

  // Navigation Links
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/products', label: 'Products' },
  ]

  // Main hub pages for dropdowns
  const boreholeHub = '/borehole-services'
  const solarHub = '/solar-solutions'
  const waterTowerHub = '/water-towers'

  // Borehole Services Dropdown
  const boreholeServices = [
    { href: '/hydro-geological-survey', label: 'Hydro-Geological Survey', icon: Map },
    { href: '/environmental-impact-assessment', label: 'Environmental Impact Assessment', icon: FileText },
    { href: '/borehole-drilling', label: 'Borehole Drilling', icon: Drill },
    { href: '/submersible-pumps', label: 'Submersible & Booster Pumps', icon: GitBranch },
    { href: '/borehole-rehabilitation', label: 'Borehole Rehabilitation', icon: Wrench },
    { href: '/geo-membrane-ponds', label: 'Geo-Membrane Ponds', icon: Waves },
  ]

  // Solar Solutions Dropdown
  const solarSolutions = [
    { href: '/solar-home-systems', label: 'Residential Solar', icon: Home },
    { href: '/solar-commercial-systems', label: 'Commercial Solar', icon: Building2 },
    { href: '/solar-water-heaters', label: 'Solar Water Heaters', icon: Thermometer },
    { href: '/solar-water-pumps', label: 'Solar Water Pumps', icon: Droplets },
    { href: '/solar-backup-systems', label: 'Solar Backup Systems', icon: Battery },
    { href: '/solar-hybrid-systems', label: 'Hybrid Solar Systems', icon: SunIcon },
  ]

  // Water Tower Solutions Dropdown
  const waterTowerSolutions = [
    { href: '/elevated-steel-tanks', label: 'Steel Water Towers', icon: Building2 },
    { href: '/elevated-pvc-tanks', label: 'PVC Water Towers', icon: Droplets },
  ]

  // Additional nav items after dropdowns
  const rightNavLinks = [
    { href: '/projects', label: 'Projects', icon: Briefcase },
    { href: '/contact', label: 'Contact', icon: Phone },
  ]

  // Refresh avatar when profile changes
  useEffect(() => {
    if (profile?.avatar) {
      setAvatarKey(Date.now())
    }
  }, [profile?.avatar])

  const handleLogout = useCallback(async () => {
    await logout()
    router.push('/auth/login')
    setIsMenuOpen(false)
    setShowProfileMenu(false)
  }, [logout, router])

  // Hover handlers for desktop dropdowns
  const handleMouseEnter = (dropdown: string) => {
    if (window.innerWidth >= 1024) {
      if (hoverTimeout) clearTimeout(hoverTimeout)
      setShowBoreholeMenu(false)
      setShowSolarMenu(false)
      setShowWaterTowerMenu(false)
      setShowProfileMenu(false)
      if (dropdown === 'borehole') setShowBoreholeMenu(true)
      if (dropdown === 'solar') setShowSolarMenu(true)
      if (dropdown === 'watertower') setShowWaterTowerMenu(true)
    }
  }

  const handleMouseLeave = (dropdown: string) => {
    if (window.innerWidth >= 1024) {
      hoverTimeout = setTimeout(() => {
        if (dropdown === 'borehole') setShowBoreholeMenu(false)
        if (dropdown === 'solar') setShowSolarMenu(false)
        if (dropdown === 'watertower') setShowWaterTowerMenu(false)
      }, 150)
    }
  }

  // Click handlers for mobile
  const toggleBoreholeMenu = useCallback(() => {
    if (window.innerWidth < 1024) {
      setShowBoreholeMenu(prev => !prev)
      setShowSolarMenu(false)
      setShowWaterTowerMenu(false)
      setShowProfileMenu(false)
    }
  }, [])

  const toggleSolarMenu = useCallback(() => {
    if (window.innerWidth < 1024) {
      setShowSolarMenu(prev => !prev)
      setShowBoreholeMenu(false)
      setShowWaterTowerMenu(false)
      setShowProfileMenu(false)
    }
  }, [])

  const toggleWaterTowerMenu = useCallback(() => {
    if (window.innerWidth < 1024) {
      setShowWaterTowerMenu(prev => !prev)
      setShowBoreholeMenu(false)
      setShowSolarMenu(false)
      setShowProfileMenu(false)
    }
  }, [])

  const toggleProfileMenu = useCallback(() => {
    setShowProfileMenu(prev => !prev)
    setShowBoreholeMenu(false)
    setShowSolarMenu(false)
    setShowWaterTowerMenu(false)
  }, [])

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
    if (!isMenuOpen) {
      setShowBoreholeMenu(false)
      setShowSolarMenu(false)
      setShowWaterTowerMenu(false)
      setShowProfileMenu(false)
    }
  }, [isMenuOpen])

  // Close dropdowns on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setShowBoreholeMenu(false)
    setShowSolarMenu(false)
    setShowWaterTowerMenu(false)
    setShowProfileMenu(false)
  }, [pathname])

  // Handle mounting and resize
  useEffect(() => {
    setMounted(true)
    
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (hoverTimeout) clearTimeout(hoverTimeout)
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowProfileMenu(false)
      }
      if (boreholeMenuRef.current && !boreholeMenuRef.current.contains(target) && window.innerWidth < 1024) {
        setShowBoreholeMenu(false)
      }
      if (solarMenuRef.current && !solarMenuRef.current.contains(target) && window.innerWidth < 1024) {
        setShowSolarMenu(false)
      }
      if (waterTowerMenuRef.current && !waterTowerMenuRef.current.contains(target) && window.innerWidth < 1024) {
        setShowWaterTowerMenu(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-20">
        <div className="max-w-7xl mx-auto px-4 h-full" />
      </nav>
    )
  }

  const logoUrl = '/logo1.png'
  const companyName = 'Plasma Water Africa'

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/98 dark:bg-gray-900/98 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo Section - Responsive sizing */}
            <div className="flex-shrink-0 -ml-2 sm:-ml-3">
              <Link 
                href="/" 
                className="flex items-center transition-all duration-300 hover:opacity-90 active:scale-95 group"
                aria-label="Home"
              >
                <div className="relative w-48 h-12 sm:w-64 sm:h-16 md:w-80 md:h-20 lg:w-96 lg:h-24">
                  <Image
                    src={logoUrl}
                    alt={companyName}
                    fill
                    className="object-contain drop-shadow-sm"
                    priority
                    sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 xl:px-4 py-2.5 rounded-xl text-sm xl:text-base font-medium transition-all duration-300 group overflow-hidden ${
                    pathname === href
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <span className="relative z-10">{label}</span>
                  <span className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 transform transition-transform duration-300 ${
                    pathname === href 
                      ? 'scale-x-100' 
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/30 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-0" />
                </Link>
              ))}

              {/* Borehole Services Dropdown */}
              <div 
                className="relative" 
                ref={boreholeMenuRef}
                onMouseEnter={() => handleMouseEnter('borehole')}
                onMouseLeave={() => handleMouseLeave('borehole')}
              >
                <button
                  onClick={toggleBoreholeMenu}
                  className={`flex items-center gap-1.5 px-3 xl:px-4 py-2.5 rounded-xl text-sm xl:text-base font-medium transition-all duration-300 group ${
                    showBoreholeMenu || boreholeServices.some(s => pathname === s.href) || pathname === boreholeHub
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <span>Borehole Services</span>
                  <ChevronDown className={`w-4 h-4 transition-all duration-300 ${showBoreholeMenu ? 'rotate-180 translate-y-0.5' : 'group-hover:translate-y-0.5'}`} />
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/30 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-0" />
                </button>
                
                {showBoreholeMenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                      {boreholeServices.map((service, index) => (
                        <Link
                          key={service.href}
                          href={service.href}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 group/item ${
                            pathname === service.href
                              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <service.icon className="w-4 h-4 opacity-70 transition-transform duration-200 group-hover/item:scale-110" />
                          <span className="flex-1">{service.label}</span>
                          <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 transition-all duration-200 group-hover/item:opacity-100 group-hover/item:translate-x-0" />
                        </Link>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <Link
                        href={boreholeHub}
                        className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 group/link"
                      >
                        <span>All Borehole Services</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Solar Solutions Dropdown */}
              <div 
                className="relative" 
                ref={solarMenuRef}
                onMouseEnter={() => handleMouseEnter('solar')}
                onMouseLeave={() => handleMouseLeave('solar')}
              >
                <button
                  onClick={toggleSolarMenu}
                  className={`flex items-center gap-1.5 px-3 xl:px-4 py-2.5 rounded-xl text-sm xl:text-base font-medium transition-all duration-300 group ${
                    showSolarMenu || solarSolutions.some(s => pathname === s.href) || pathname === solarHub
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400'
                  }`}
                >
                  <span>Solar Solutions</span>
                  <ChevronDown className={`w-4 h-4 transition-all duration-300 ${showSolarMenu ? 'rotate-180 translate-y-0.5' : 'group-hover:translate-y-0.5'}`} />
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-50/0 via-yellow-50/30 to-yellow-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-0" />
                </button>
                
                {showSolarMenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                      {solarSolutions.map((solution, index) => (
                        <Link
                          key={solution.href}
                          href={solution.href}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 group/item ${
                            pathname === solution.href
                              ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <solution.icon className="w-4 h-4 opacity-70 transition-transform duration-200 group-hover/item:scale-110" />
                          <span className="flex-1">{solution.label}</span>
                          <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 transition-all duration-200 group-hover/item:opacity-100 group-hover/item:translate-x-0" />
                        </Link>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <Link
                        href={solarHub}
                        className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-semibold text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-all duration-200 group/link"
                      >
                        <span>All Solar Solutions</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Water Tower Solutions Dropdown */}
              <div 
                className="relative" 
                ref={waterTowerMenuRef}
                onMouseEnter={() => handleMouseEnter('watertower')}
                onMouseLeave={() => handleMouseLeave('watertower')}
              >
                <button
                  onClick={toggleWaterTowerMenu}
                  className={`flex items-center gap-1.5 px-3 xl:px-4 py-2.5 rounded-xl text-sm xl:text-base font-medium transition-all duration-300 group ${
                    showWaterTowerMenu || waterTowerSolutions.some(s => pathname === s.href) || pathname === waterTowerHub
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400'
                  }`}
                >
                  <span>Water Towers</span>
                  <ChevronDown className={`w-4 h-4 transition-all duration-300 ${showWaterTowerMenu ? 'rotate-180 translate-y-0.5' : 'group-hover:translate-y-0.5'}`} />
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-50/0 via-cyan-50/30 to-cyan-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-0" />
                </button>
                
                {showWaterTowerMenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                      {waterTowerSolutions.map((tower, index) => (
                        <Link
                          key={tower.href}
                          href={tower.href}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 group/item ${
                            pathname === tower.href
                              ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <tower.icon className="w-4 h-4 opacity-70 transition-transform duration-200 group-hover/item:scale-110" />
                          <span className="flex-1">{tower.label}</span>
                          <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 transition-all duration-200 group-hover/item:opacity-100 group-hover/item:translate-x-0" />
                        </Link>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <Link
                        href={waterTowerHub}
                        className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 transition-all duration-200 group/link"
                      >
                        <span>All Water Towers</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {rightNavLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 xl:px-4 py-2.5 rounded-xl text-sm xl:text-base font-medium transition-all duration-300 group overflow-hidden ${
                    pathname === href
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <span className="relative z-10">{label}</span>
                  <span className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 transform transition-transform duration-300 ${
                    pathname === href 
                      ? 'scale-x-100' 
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/30 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-0" />
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Cart Button */}
              <Link
                href="/cart"
                className="relative p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                aria-label="Shopping cart"
              >
                {cartLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                )}
                {totalItems > 0 && !cartLoading && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-md animate-pulse">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Auth Section */}
              {!authLoading && (
                <>
                  {isLoggedIn && user ? (
                    <div className="relative" ref={profileMenuRef}>
                      <button
                        onClick={toggleProfileMenu}
                        className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          showProfileMenu ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }`}
                      >
                        <Avatar 
                          key={avatarKey}
                          size="sm"
                          userId={user?.id || user?._id}
                          className="ring-2 ring-white dark:ring-gray-800 shadow-md hover:scale-105 transition-transform duration-200"
                        />
                        <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                          {user.name?.split(' ')[0]}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-all duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Profile Dropdown */}
                      {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800 dark:to-gray-800">
                            <div className="flex items-center gap-3">
                              <Avatar 
                                size="lg"
                                userId={user?.id || user?._id}
                                className="ring-3 ring-white dark:ring-gray-800 shadow-lg"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 dark:text-white text-base">
                                  {user.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {user.email}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {isAdmin && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-xs font-medium text-white">
                                      <Shield className="w-3 h-3" />
                                      Admin
                                    </span>
                                  )}
                                  {isSales && !isAdmin && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-xs font-medium text-white">
                                      <Award className="w-3 h-3" />
                                      Sales
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="py-2">
                            <Link
                              href="/profile"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                                <User className="w-4 h-4" />
                              </div>
                              My Profile
                            </Link>
                            
                            {isAdmin && (
                              <>
                                <Link
                                  href="/dashboard"
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                                  onClick={() => setShowProfileMenu(false)}
                                >
                                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                                    <LayoutDashboard className="w-4 h-4" />
                                  </div>
                                  Admin Dashboard
                                </Link>
                              </>
                            )}
                            
                            {/* Sales Dashboard link for admin or sales role */}
                            {hasSalesAccess && (
                              <Link
                                href="/sales"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                                onClick={() => setShowProfileMenu(false)}
                              >
                                <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                                  <Award className="w-4 h-4" />
                                </div>
                                Sales Dashboard
                              </Link>
                            )}
                            
                            <Link
                              href="/orders"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                                <Package className="w-4 h-4" />
                              </div>
                              My Orders
                            </Link>
                            
                            <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                              <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                              >
                                <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                                  <LogOut className="w-4 h-4" />
                                </div>
                                Sign Out
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="hidden lg:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                      Sign In
                    </Link>
                  )}
                </>
              )}

              {/* Loading skeleton */}
              {authLoading && (
                <div className="hidden lg:block w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[calc(100vh-80px)] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-xl max-h-[calc(100vh-80px)] overflow-y-auto">
            <div className="px-4 py-3 space-y-1">
              {/* Main Navigation Links */}
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}

              {/* Borehole Services Mobile Section */}
              <div className="mt-1">
                <button
                  onClick={toggleBoreholeMenu}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <span>Borehole Services</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showBoreholeMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showBoreholeMenu && (
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1 mt-1">
                    {boreholeServices.map((service) => (
                      <Link
                        key={service.href}
                        href={service.href}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <service.icon className="w-4 h-4" />
                        {service.label}
                      </Link>
                    ))}
                    <Link
                      href={boreholeHub}
                      className="flex items-center justify-center gap-2 mt-2 mx-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View All Services
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Solar Solutions Mobile Section */}
              <div>
                <button
                  onClick={toggleSolarMenu}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <span>Solar Solutions</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showSolarMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showSolarMenu && (
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1 mt-1">
                    {solarSolutions.map((solution) => (
                      <Link
                        key={solution.href}
                        href={solution.href}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <solution.icon className="w-4 h-4" />
                        {solution.label}
                      </Link>
                    ))}
                    <Link
                      href={solarHub}
                      className="flex items-center justify-center gap-2 mt-2 mx-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View All Solutions
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Water Towers Mobile Section */}
              <div>
                <button
                  onClick={toggleWaterTowerMenu}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <span>Water Towers</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showWaterTowerMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showWaterTowerMenu && (
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1 mt-1">
                    {waterTowerSolutions.map((tower) => (
                      <Link
                        key={tower.href}
                        href={tower.href}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <tower.icon className="w-4 h-4" />
                        {tower.label}
                      </Link>
                    ))}
                    <Link
                      href={waterTowerHub}
                      className="flex items-center justify-center gap-2 mt-2 mx-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View All Towers
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Projects and Contact for Mobile */}
              {rightNavLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}

              {/* Mobile Auth Section */}
              {!authLoading && (
                <>
                  {isLoggedIn && user ? (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <Avatar 
                          size="md"
                          userId={user?.id || user?._id}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {isAdmin && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded text-[10px] font-medium text-blue-700 dark:text-blue-300">
                                Admin
                              </span>
                            )}
                            {isSales && !isAdmin && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/50 rounded text-[10px] font-medium text-green-700 dark:text-green-300">
                                Sales
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      
                      {isAdmin && (
                        <>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        </>
                      )}
                      
                      {/* Sales Dashboard link for admin or sales role */}
                      {hasSalesAccess && (
                        <Link
                          href="/sales"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Award className="w-4 h-4" />
                          Sales Dashboard
                        </Link>
                      )}
                      
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 mt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="flex items-center justify-center gap-2 mt-3 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl transition-all duration-200 hover:shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Sign In
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-20" />
    </>
  )
}