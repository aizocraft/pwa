// src/app/checkout/components/ShippingForm.tsx
'use client'

import { MapPin, User, Home, Building2, Phone, ArrowRight } from 'lucide-react'
import { useCartStore } from '../../../store/cart'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

// Define the shipping address type
interface ShippingAddress {
  fullName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

interface ShippingFormProps {
  isGuest: boolean
  guestEmail: string
  setGuestEmail: (email: string) => void
  guestPhone: string
  setGuestPhone: (phone: string) => void
  shippingAddress: ShippingAddress
  setShippingAddress: (address: ShippingAddress | ((prev: ShippingAddress) => ShippingAddress)) => void
  isShippingValid: () => boolean
  isGuestInfoValid: () => boolean
  onContinue: () => void
}

// Storage keys
const STORAGE_KEYS = {
  SHIPPING_ADDRESS: 'saved_shipping_address',
  GUEST_EMAIL: 'saved_guest_email',
  GUEST_PHONE: 'saved_guest_phone'
}

export default function ShippingForm({
  isGuest,
  guestEmail,
  setGuestEmail,
  guestPhone,
  setGuestPhone,
  shippingAddress,
  setShippingAddress,
  isShippingValid,
  isGuestInfoValid,
  onContinue
}: ShippingFormProps) {
  const cart = useCartStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // LOAD from localStorage on mount - ONLY ONCE
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoaded) {
      console.log('📦 Loading saved shipping data...');
      
      // Load saved shipping address
      const savedAddress = localStorage.getItem(STORAGE_KEYS.SHIPPING_ADDRESS);
      if (savedAddress) {
        try {
          const parsedAddress: ShippingAddress = JSON.parse(savedAddress);
          console.log('📍 Loaded shipping address:', parsedAddress);
          
          // Update all fields at once
          setShippingAddress(parsedAddress);
        } catch (e) {
          console.error('Error loading saved address:', e);
        }
      }

      // Load saved guest info for guest checkout
      if (isGuest) {
        const savedEmail = localStorage.getItem(STORAGE_KEYS.GUEST_EMAIL);
        const savedPhone = localStorage.getItem(STORAGE_KEYS.GUEST_PHONE);
        if (savedEmail) setGuestEmail(savedEmail);
        if (savedPhone) setGuestPhone(savedPhone);
      }
      
      setIsLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // SAVE to localStorage whenever values change (with debounce)
  useEffect(() => {
    if (!isLoaded) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce save to avoid excessive writes
    saveTimeoutRef.current = setTimeout(() => {
      if (typeof window !== 'undefined') {
        // Save shipping address - check if we have at least some data
        if (shippingAddress.fullName || shippingAddress.address1 || shippingAddress.phone) {
          localStorage.setItem(STORAGE_KEYS.SHIPPING_ADDRESS, JSON.stringify(shippingAddress));
          console.log('💾 Saved shipping address:', shippingAddress);
        }
        
        // Save guest info if guest checkout
        if (isGuest) {
          if (guestEmail && guestEmail.includes('@')) {
            localStorage.setItem(STORAGE_KEYS.GUEST_EMAIL, guestEmail);
          }
          if (guestPhone && guestPhone.length >= 10) {
            localStorage.setItem(STORAGE_KEYS.GUEST_PHONE, guestPhone);
          }
        }
      }
    }, 300); // 300ms debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [shippingAddress, guestEmail, guestPhone, isGuest, isLoaded]);

  // Handle phone number with proper formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Format as Kenyan phone number
    if (value.startsWith('0') && value.length <= 10) {
      value = '254' + value.slice(1);
    } else if (value.startsWith('+254')) {
      value = value.substring(1);
    } else if (!value.startsWith('254') && value.length > 0 && value.length <= 9) {
      // If user types a number without 254 prefix (e.g., 712345678)
      value = '254' + value;
    }
    
    // Fix for 2540xxxxxx (extra zero)
    if (value.startsWith('2540')) {
      value = '254' + value.slice(3);
    }
    
    // Limit to 12 digits
    if (value.length > 12) {
      value = value.slice(0, 12);
    }
    
    setShippingAddress({ ...shippingAddress, phone: value });
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({ ...shippingAddress, fullName: e.target.value });
  };

  const handleAddress1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({ ...shippingAddress, address1: e.target.value });
  };

  const handleAddress2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({ ...shippingAddress, address2: e.target.value });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({ ...shippingAddress, city: e.target.value });
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({ ...shippingAddress, state: e.target.value });
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({ ...shippingAddress, zip: e.target.value });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setShippingAddress({ ...shippingAddress, country: e.target.value });
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
      <div className="p-6 lg:p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          Shipping Address
        </h2>
        
        {/* Guest Info */}
        {isGuest && (
          <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">1</span>
              </div>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                  placeholder="254700000000"
                />
              </div>
            </div>
          </div>
        )}

        {/* Address Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={shippingAddress.fullName}
                onChange={handleFullNameChange}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address Line 1 *
            </label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={shippingAddress.address1}
                onChange={handleAddress1Change}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                placeholder="123 Main St"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address Line 2 (Optional)
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={shippingAddress.address2}
                onChange={handleAddress2Change}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                placeholder="Apt 4B"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={handleCityChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                placeholder="Nairobi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Region *
              </label>
              <input
                type="text"
                value={shippingAddress.state}
                onChange={handleStateChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                placeholder="Nairobi"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ZIP/Postal Code *
              </label>
              <input
                type="text"
                value={shippingAddress.zip}
                onChange={handleZipChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                placeholder="00100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country *
              </label>
              <select
                value={shippingAddress.country}
                onChange={handleCountryChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
              >
                <option value="Kenya">Kenya</option>
                <option value="Uganda">Uganda</option>
                <option value="Tanzania">Tanzania</option>
              </select>
            </div>
          </div>

          {/* Phone field with proper formatting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={shippingAddress.phone}
                onChange={handlePhoneChange}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                placeholder="254700000000"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Format: 254XXXXXXXXX (12 digits total)
            </p>
          </div>

          {/* Continue Button */}
          <motion.button
            onClick={onContinue}
            disabled={!isShippingValid() || (isGuest && !isGuestInfoValid()) || !cart.selectedShippingAreaId}
            className="group relative w-full mt-6 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 p-1 shadow-xl ring-1 ring-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:ring-blue-400/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center justify-center gap-2 text-white font-semibold py-3 px-6">
              Continue to Payment
              <motion.div 
                animate={{ x: [0, 4, 0] }} 
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </motion.div>
            </span>
          </motion.button>
          
          {/* Show saved data indicator */}
          {isLoaded && (shippingAddress.fullName || shippingAddress.phone) && (
            <p className="text-xs text-green-600 dark:text-green-400 text-center mt-2">
              ✓ Shipping details saved locally
            </p>
          )}
        </div>
      </div>
    </div>
  )
}