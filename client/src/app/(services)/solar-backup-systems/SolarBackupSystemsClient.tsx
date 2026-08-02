'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Battery, 
  Zap, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  TrendingDown,
  Home,
  Building2,
  Factory,
  Users,
  Settings,
  Headphones,
  Phone,
  Sun,
  Play
} from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';
import { useTheme } from '@/context/ThemeContext';

const backupImages = [
  { image: '/images/battery-backup-1.jpg', text: 'Home Backup System\n5kWh Capacity' },
  { image: '/images/battery-backup-2.jpg', text: 'Commercial Backup\n10kWh Capacity' },
  { image: '/images/battery-backup-3.jpg', text: 'Industrial Backup\n50kWh Capacity' },
];

const formattedGalleryItems = backupImages.map(item => ({
  image: item.image,
  text: item.text
}));

const benefits = [
  { value: '24/7', label: 'Power Availability', icon: Zap },
  { value: '100%', label: 'Reliability', icon: Shield },
  { value: '5-10', label: 'Years Lifespan', icon: Clock },
  { value: '40-60%', label: 'Cost Savings', icon: DollarSign },
];

export default function BackupSystemsClient() {
  const { theme } = useTheme();
  const galleryTextColor = theme === 'dark' ? '#ffffff' : '#1f2937';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 lg:pt-24 pb-16 lg:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-amber-50 to-white dark:hidden" />
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-gray-900 via-yellow-950/20 to-gray-950" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full px-4 py-2 mb-6">
                <Battery className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Backup Power Solutions</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Never Experience{' '}
                <span className="text-yellow-600 dark:text-yellow-400">Power Outages</span>
                {' '}Again
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Keep your home or business running smoothly with our reliable backup power systems. 
                From 5kWh home solutions to 50kWh industrial systems.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-all">
                  Get Backup Quote <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                {benefits.map((benefit, i) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={i} className="text-center">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{benefit.value}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{benefit.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
                <video
                  src="/videos/inv01.mp4"
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm font-medium flex items-center gap-2">
                  <Play className="w-4 h-4" /> Watch Installation
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us + Content Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose <span className="text-yellow-600 dark:text-yellow-400">Us?</span>
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Shield, title: 'Unmatched Reliability', description: 'Premium components with comprehensive warranties' },
                  { icon: Users, title: 'Expert Team', description: 'Certified backup system technicians' },
                  { icon: DollarSign, title: 'Competitive Pricing', description: 'Best value for maximum ROI' },
                  { icon: Settings, title: 'Custom Solutions', description: 'Tailored to your specific power needs' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                      <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Backup Power For <span className="text-yellow-600 dark:text-yellow-400">Peace of Mind</span>
              </h2>
              <div className="relative h-[300px] rounded-xl overflow-hidden shadow-xl mb-6">
                <video
                  src="/videos/inv01.mp4"
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                Power outages in Kenya can be unpredictable and disruptive. Whether it's a brief blackout or extended load shedding, having a reliable backup power system ensures your home or business stays operational.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                Our backup power solutions are designed to automatically kick in when the grid fails, providing seamless transition and uninterrupted power. From small home systems to large industrial installations, we have the perfect solution for your needs.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Don't let power outages slow you down. Invest in reliable backup power and enjoy peace of mind knowing your operations will continue regardless of grid conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Backup <span className="text-yellow-600 dark:text-yellow-400">Installations</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See how we've helped homes and businesses stay powered
            </p>
            <div className="w-20 h-0.5 bg-yellow-600 dark:bg-yellow-400 mx-auto mt-4 rounded-full" />
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

      {/* CTA Section */}
      <section className="py-16 bg-yellow-600 dark:bg-yellow-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready for Reliable Backup Power?
            </h2>
            <p className="text-yellow-100 text-lg mb-6">
              Get your free quote today and never worry about power outages again
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white text-yellow-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold text-base transition-all shadow-md"
              >
                Request Free Quote
              </Link>
              <Link 
                href="tel:+254728749722" 
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold text-base transition-all"
              >
                Call: 0728 749 722
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}