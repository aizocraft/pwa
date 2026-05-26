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
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null)
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


  // Check if user has sales access
  const hasSalesAccess = isSales || isAdmin

  // Navigation Links
  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/about', label: 'About', icon: Briefcase },
    { href: '/products', label: 'Products', icon: Package },
  ]

  // Main hub pages for dropdowns
  const boreholeHub = '/borehole-services'
  const solarHub = '/solar-solutions'
  const waterTowerHub = '/water-towers'

  // Borehole Services Dropdown
  const boreholeServices = [
    { href: '/hydro-geological-survey', label: 'Hydro-Geological Survey', icon: Map, description: 'Site assessment & analysis' },
    { href: '/environmental-impact-assessment', label: 'Environmental Impact Assessment', icon: FileText, description: 'Environmental compliance' },
    { href: '/borehole-drilling', label: 'Borehole Drilling', icon: Drill, description: 'Professional drilling services' },
    { href: '/submersible-pumps', label: 'Submersible & Booster Pumps', icon: GitBranch, description: 'Pump installation & maintenance' },
    { href: '/borehole-rehabilitation', label: 'Borehole Rehabilitation', icon: Wrench, description: 'Restore & optimize boreholes' },
    { href: '/geo-membrane-ponds', label: 'Geo-Membrane Ponds', icon: Waves, description: 'Water storage solutions' },
  ]

  // Solar Solutions Dropdown
  const solarSolutions = [
    { href: '/solar-home-systems', label: 'Residential Solar', icon: Home, description: 'Home energy solutions' },
    { href: '/solar-commercial-systems', label: 'Commercial Solar', icon: Building2, description: 'Business solar systems' },
    { href: '/solar-water-heaters', label: 'Solar Water Heaters', icon: Thermometer, description: 'Efficient water heating' },
    { href: '/solar-water-pumps', label: 'Solar Water Pumps', icon: Droplets, description: 'Solar-powered pumping' },
    { href: '/solar-backup-systems', label: 'Solar Backup Systems', icon: Battery, description: 'Reliable power backup' },
    { href: '/solar-hybrid-systems', label: 'Hybrid Solar Systems', icon: SunIcon, description: 'Integrated power solutions' },
  ]

  // Water Tower Solutions Dropdown
  const waterTowerSolutions = [
    { href: '/elevated-steel-tanks', label: 'Steel Water Towers', icon: Building2, description: 'Durable steel structures' },
    { href: '/elevated-pvc-tanks', label: 'PVC Water Towers', icon: Droplets, description: 'Lightweight PVC tanks' },
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

  // Handle mobile dropdown toggle
  const toggleMobileDropdown = useCallback((dropdownName: string) => {
    setActiveMobileDropdown(prev => prev === dropdownName ? null : dropdownName)
  }, [])

  // Close all dropdowns
  const closeAllDropdowns = useCallback(() => {
    setActiveMobileDropdown(null)
    setShowProfileMenu(false)
  }, [])

  // Toggle mobile menu
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
    if (!isMenuOpen) {
      closeAllDropdowns()
    }
  }, [isMenuOpen, closeAllDropdowns])

  // Close dropdowns on route change
  useEffect(() => {
    setIsMenuOpen(false)
    closeAllDropdowns()
  }, [pathname, closeAllDropdowns])

  // Handle mounting and resize
  useEffect(() => {
    setMounted(true)

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false)
        closeAllDropdowns()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [closeAllDropdowns])

  // Close profile dropdown when clicking outside

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowProfileMenu(false)
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
<div className="flex items-center justify-between h-20 sm:h-20">
            
            {/* Logo Section - Moved to right with margin left auto */}
            {/* ml-auto pushes logo to the right side */}
            <div className="flex-shrink-0 -ml-2 sm:-ml-3 md:-ml-60">
              <Link
                href="/"
                className="flex items-center transition-opacity duration-300 hover:opacity-90 active:scale-[0.98] group"
                aria-label="Home"
              >
                {/* Keep logo vertically centered within nav height */}
                <div className="relative h-20 w-80 sm:h-20 sm:w-80 md:h-20 md:w-80 lg:h-20 lg:w-80">
                  <Image
                    src={logoUrl}
                    alt={companyName}
                    fill
                    className="object-contain drop-shadow-sm"
                    priority
                    sizes="(max-width: 640px) 160px, (max-width: 768px) 176px, (max-width: 1024px) 192px, 224px"
                  />
                </div>
              </Link>
            </div>


            {/* Desktop Navigation */}
            <div className="hidden lg:flex flex-1 items-center justify-center gap-1 xl:gap-2">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`relative h-10 flex items-center px-3 xl:px-4 rounded-xl text-sm xl:text-base font-medium overflow-hidden transition-colors duration-200 group whitespace-nowrap ${
                    pathname === href
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <span className="relative z-10 leading-none">{label}</span>
                  <span
                    className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 transform transition-transform duration-200 ${
                      pathname === href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-blue-50/0 via-blue-50/30 to-blue-50/0 rounded-xl -z-0" />
                </Link>
              ))}


              {/* Borehole Services Dropdown - Desktop */}
                <div className="relative group/dropdown">
                <button
                  className={`flex items-center gap-1.5 px-3 xl:px-4 h-10 rounded-xl text-sm xl:text-base font-medium transition-colors duration-200 group whitespace-nowrap ${
                    boreholeServices.some(s => pathname === s.href) || pathname === boreholeHub
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <span className="leading-none whitespace-nowrap">Borehole Services</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                </button>

                
                <div className="absolute top-full left-0 mt-2 w-80 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 transform -translate-y-2 group-hover/dropdown:translate-y-0 z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="py-2">
                      {boreholeServices.map((service) => (
                        <Link
                          key={service.href}
                          href={service.href}
                          className="flex items-start gap-3 px-4 py-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 group/item"
                        >
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 group-hover/item:bg-blue-100 dark:group-hover/item:bg-blue-800/50 transition-colors">
                            <service.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {service.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {service.description}
                            </div>
                          </div>
                          <ArrowRight className="w-3 h-3 text-gray-400 opacity-0 group-hover/item:opacity-100 transition-all duration-200" />
                        </Link>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <Link
                        href={boreholeHub}
                        className="flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 group/link"
                      >
                        <span>View All Borehole Services</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solar Solutions Dropdown - Desktop */}
              <div className="relative group/dropdown">
                <button
                  className={`flex items-center gap-1.5 px-3 xl:px-4 h-10 rounded-xl text-sm xl:text-base font-medium transition-colors duration-200 group whitespace-nowrap ${
                    solarSolutions.some(s => pathname === s.href) || pathname === solarHub
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400'
                  }`}
                >
                  <span className="leading-none whitespace-nowrap">Solar Solutions</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                </button>

                
                <div className="absolute top-full left-0 mt-2 w-80 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 transform -translate-y-2 group-hover/dropdown:translate-y-0 z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="py-2">
                      {solarSolutions.map((solution) => (
                        <Link
                          key={solution.href}
                          href={solution.href}
                          className="flex items-start gap-3 px-4 py-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 group/item"
                        >
                          <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 group-hover/item:bg-yellow-100 dark:group-hover/item:bg-yellow-800/50 transition-colors">
                            <solution.icon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {solution.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {solution.description}
                            </div>
                          </div>
                          <ArrowRight className="w-3 h-3 text-gray-400 opacity-0 group-hover/item:opacity-100 transition-all duration-200" />
                        </Link>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <Link
                        href={solarHub}
                        className="flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-all duration-200 group/link"
                      >
                        <span>View All Solar Solutions</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Water Tower Solutions Dropdown - Desktop */}
              <div className="relative group/dropdown">
                <button
                  className={`flex items-center gap-1.5 px-3 xl:px-4 h-10 rounded-xl text-sm xl:text-base font-medium transition-colors duration-200 group whitespace-nowrap ${
                    waterTowerSolutions.some(s => pathname === s.href) || pathname === waterTowerHub
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400'
                  }`}
                >
                  <span className="leading-none whitespace-nowrap">Water Towers</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                </button>

                
                <div className="absolute top-full left-0 mt-2 w-80 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 transform -translate-y-2 group-hover/dropdown:translate-y-0 z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="py-2">
                      {waterTowerSolutions.map((tower) => (
                        <Link
                          key={tower.href}
                          href={tower.href}
                          className="flex items-start gap-3 px-4 py-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 group/item"
                        >
                          <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 group-hover/item:bg-cyan-100 dark:group-hover/item:bg-cyan-800/50 transition-colors">
                            <tower.icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {tower.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {tower.description}
                            </div>
                          </div>
                          <ArrowRight className="w-3 h-3 text-gray-400 opacity-0 group-hover/item:opacity-100 transition-all duration-200" />
                        </Link>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <Link
                        href={waterTowerHub}
                        className="flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 transition-all duration-200 group/link"
                      >
                        <span>View All Water Towers</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
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

            {/* Right Section - Icons and User Menu */}
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
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
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
                            )}
                            
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

        {/* Mobile Menu - Improved with smooth animations and better dropdown logic */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[calc(100vh-80px)] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-xl max-h-[calc(100vh-80px)] overflow-y-auto">
            <div className="px-4 py-3 space-y-1">
              {/* Main Navigation Links */}
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}

              {/* Borehole Services Mobile Section */}
              <div className="mt-1">
                <button
                  onClick={() => toggleMobileDropdown('borehole')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Drill className="w-5 h-5" />
                    <span>Borehole Services</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${activeMobileDropdown === 'borehole' ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${
                  activeMobileDropdown === 'borehole' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1 mt-1">
                    {boreholeServices.map((service) => (
                      <Link
                        key={service.href}
                        href={service.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <service.icon className="w-4 h-4" />
                        <div className="flex-1">
                          <div>{service.label}</div>
                          <div className="text-xs text-gray-400">{service.description}</div>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={boreholeHub}
                      className="flex items-center justify-center gap-2 mt-3 mx-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View All Services
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Solar Solutions Mobile Section */}
              <div>
                <button
                  onClick={() => toggleMobileDropdown('solar')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <SunIcon className="w-5 h-5" />
                    <span>Solar Solutions</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${activeMobileDropdown === 'solar' ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${
                  activeMobileDropdown === 'solar' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1 mt-1">
                    {solarSolutions.map((solution) => (
                      <Link
                        key={solution.href}
                        href={solution.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <solution.icon className="w-4 h-4" />
                        <div className="flex-1">
                          <div>{solution.label}</div>
                          <div className="text-xs text-gray-400">{solution.description}</div>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={solarHub}
                      className="flex items-center justify-center gap-2 mt-3 mx-2 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View All Solutions
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Water Towers Mobile Section */}
              <div>
                <button
                  onClick={() => toggleMobileDropdown('watertower')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5" />
                    <span>Water Towers</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${activeMobileDropdown === 'watertower' ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${
                  activeMobileDropdown === 'watertower' ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1 mt-1">
                    {waterTowerSolutions.map((tower) => (
                      <Link
                        key={tower.href}
                        href={tower.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <tower.icon className="w-4 h-4" />
                        <div className="flex-1">
                          <div>{tower.label}</div>
                          <div className="text-xs text-gray-400">{tower.description}</div>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={waterTowerHub}
                      className="flex items-center justify-center gap-2 mt-3 mx-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View All Towers
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Projects and Contact for Mobile */}
              {rightNavLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
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
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      
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