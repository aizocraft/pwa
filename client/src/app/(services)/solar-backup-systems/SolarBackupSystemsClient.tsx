// app/(services)/solar-backup-systems/SolarBackupSystemsClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Battery, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Shield,
  Clock,
  TrendingDown,
  Home,
  Building2,
  Activity
} from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';
import { useTheme } from '@/context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types/product';

const backupImages = [
  { image: '/backup/solar-backup-kenya1.png', location: 'Runda, Nairobi', system: '' },
  { image: '/images/Combined-1.jpg', location: 'Westlands, Nairobi', system: '' },
  { image: '/images/combined-2.jpg', location: 'Kiambu Road', system: '' },
  { image: '/images/solar-4.jpg', location: 'Karen, Nairobi', system: '' },
];

const formattedGalleryItems = backupImages.map(item => ({
  image: item.image,
  text: `${item.location}\n${item.system}`
}));

const benefits = [
  { value: '10+', label: 'Years Battery Warranty', icon: Shield, description: 'Long-term peace of mind' },
  { value: '24/7', label: 'Continuous Power', icon: Zap, description: 'No more outages' },
  { value: '5-10', label: 'Seconds Switchover', icon: Clock, description: 'Automatic and seamless' },
  { value: '100%', label: 'Clean Energy', icon: Battery, description: 'Eco-friendly backup' },
];

const features = [
  { icon: Shield, title: 'Automatic Switchover', description: 'Seamless transition during power outages' },
  { icon: Battery, title: 'Lithium Battery Technology', description: 'Safe, efficient, and long-lasting' },
  { icon: TrendingDown, title: 'Scalable Storage', description: 'Expand from 5kWh to 50kWh+' },
  { icon: Activity, title: 'Smart Monitoring', description: 'Track your system via mobile app' },
  { icon: Shield, title: '10-Year Warranty', description: 'Comprehensive battery warranty' },
  { icon: Zap, title: 'Silent Operation', description: 'No noise, unlike diesel generators' },
];

const perfectFor = [
  { icon: Home, title: 'Homes', description: 'Areas with frequent power outages' },
  { icon: Building2, title: 'Businesses', description: 'Shops, salons, and small offices' },
  { icon: Shield, title: 'Medical Equipment', description: 'Life-support and critical devices' },
  { icon: Activity, title: 'Home Offices', description: 'Uninterrupted work from home' },
  { icon: Shield, title: 'Security Systems', description: 'Cameras, alarms, and gates' },
  { icon: Zap, title: 'Entertainment', description: 'TVs, computers, and appliances' },
];

const whyBackupBenefits = [
  'Never experience power outages again - automatic switchover',
  'No noise or fumes - unlike diesel generators',
  'Zero maintenance - no fuel, oil, or moving parts',
  'Instant backup power within milliseconds',
  'Monitor your system remotely via smartphone',
  'Eco-friendly - clean battery storage',
  'Save money compared to fuel-powered generators',
  'Increase your property value',
];

export default function SolarBackupSystemsClient() {
  const { theme } = useTheme();
  const galleryTextColor = theme === 'dark' ? '#ffffff' : '#1f2937';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Inverter products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['inverter-products'],
    queryFn: () => getProducts({ category: 'inverters', limit: 8 }),
    staleTime: 5 * 60 * 1000,
  });

  const inverterProducts = (productsData?.products || []) as Product[];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 lg:pt-24 pb-16 lg:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-white dark:hidden" />
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-gray-900 via-blue-950/20 to-gray-950" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-6">
                <Battery className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Solar Backup Power Systems</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Never Be in the{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  Dark Again
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Never experience power outages again. Automatic solar battery backup for your home or business. 
                Seamless switchover, silent operation, zero maintenance.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-all">
                  Get Free Quote <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                {benefits.map((benefit, i) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={i} className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{benefit.value}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{benefit.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/backup/solar-backup-kenya.png"
                  alt="Solar backup system installation in Kenya"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback to existing image if new one doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/solar.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - Inverters */}
      <section className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our{' '}
              <span className="text-blue-600 dark:text-blue-400">Premium Inverters</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              High-quality solar inverters for reliable backup power
            </p>
            <div className="w-20 h-0.5 bg-blue-600 dark:text-blue-400 mx-auto mt-4 rounded-full" />
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : inverterProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {inverterProducts.slice(0, 8).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Link 
                  href="/products?category=inverters" 
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                >
                  View All Inverters <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No inverter products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose{' '}
              <span className="text-blue-600 dark:text-blue-400">Our Backup Systems?</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Reliable, automatic, and maintenance-free power backup
            </p>
            <div className="w-20 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-start gap-4 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Perfect For Section - With Image instead of gradient box */}
      <section className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Perfect{' '}
                <span className="text-blue-600 dark:text-blue-400">For:</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                From homes to businesses, our backup systems keep your critical loads running during outages.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {perfectFor.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{item.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{item.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Image instead of gradient box */}
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/backup/solarmax-inverter.png"
                alt="Solarmax inverter - premium solar backup solution"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback image if specific one doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/solar-image2.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits List Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white mb-6">
              Why Choose{' '}
              <span className="text-blue-600 dark:text-blue-400">Solar Backup?</span>
            </h2>
            <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-10">
              Better than generators - silent, clean, and maintenance-free
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {whyBackupBenefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our{' '}
              <span className="text-blue-600 dark:text-blue-400">Installations</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See how we've protected homes and businesses across Kenya
            </p>
            <div className="w-20 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="h-[500px] md:h-[550px] rounded-xl overflow-hidden shadow-lg">
            {mounted && (
              <CircularGallery
                items={formattedGalleryItems}
                bend={2.5}
                textColor={galleryTextColor}
                borderRadius={0.08}
                font="bold 16px Figtree, sans-serif"
                scrollSpeed={2.8}
                scrollEase={0.05}
              />
            )}
          </div>
          <p className="text-center text-base text-gray-500 dark:text-gray-400 mt-4">
            Hover or drag to explore - Each location features system details
          </p>
        </div>
      </section>

      {/* No More Outages CTA Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Never Be in the Dark Again
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Protect your home and business with automatic solar backup power
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg"
              >
                Request Backup Quote <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}