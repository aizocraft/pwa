'use client'

import { MapPin, User, Home, Building2, Phone, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'

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

  // Load from localStorage on mount - ONLY ONCE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load saved shipping address
      const savedAddress = localStorage.getItem('saved_shipping_address');
      if (savedAddress) {
        try {
          const parsedAddress: ShippingAddress = JSON.parse(savedAddress);
          // Only update if there's actual data
          if (parsedAddress.fullName || parsedAddress.address1) {
            setShippingAddress(parsedAddress);
            console.log('ShippingForm loaded address with data:', parsedAddress);
          } else {
            console.log('ShippingForm loaded empty address, ignoring');
          }
        } catch (e) {
          console.error('Error loading saved address:', e);
        }
      }

      // Load saved guest info for guest checkout
      if (isGuest) {
        const savedEmail = localStorage.getItem('saved_guest_email');
        const savedPhone = localStorage.getItem('saved_guest_phone');
        if (savedEmail) setGuestEmail(savedEmail);
        if (savedPhone) setGuestPhone(savedPhone);
        console.log('ShippingForm loaded guest info:', { savedEmail, savedPhone });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array - only run once on mount

  // Save to localStorage whenever values change
  const saveToLocalStorage = () => {
    if (typeof window !== 'undefined') {
      // Save shipping address
      localStorage.setItem('saved_shipping_address', JSON.stringify(shippingAddress));
      console.log('Saved shipping address:', shippingAddress);
      
      // Save guest info if guest checkout
      if (isGuest) {
        localStorage.setItem('saved_guest_email', guestEmail);
        localStorage.setItem('saved_guest_phone', guestPhone);
        console.log('Saved guest info:', { guestEmail, guestPhone });
      }
    }
  };

  // Auto-save on any input change
  useEffect(() => {
    saveToLocalStorage();
  }, [shippingAddress, guestEmail, guestPhone, isGuest]);

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({ ...shippingAddress, phone: e.target.value });
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
                State/Province *
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
          </div>

          <button
            onClick={onContinue}
            disabled={!isShippingValid() || (isGuest && !isGuestInfoValid())}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 group"
          >
            <span>Continue to Payment</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}