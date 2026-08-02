'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, 
  Sun, 
  TrendingDown, 
  Clock, 
  Zap, 
  DollarSign, 
  CheckCircle, 
  ArrowRight,
  Shield,
  Phone,
  TrendingUp,
  Leaf,
  Award,
  Users,
  Settings,
  Play
} from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';
import { useTheme } from '@/context/ThemeContext';

const commercialImages = [
  { image: '/images/10kw_solar_plant.jpg', location: '', system: '10kW Solar System' },
  { image: '/images/30kw_solar_plant.jpg', location: '', system: '30kW Solar System' },
  { image: '/images/50kw_solar_plant.jpg', location: '', system: '50kW Solar System' },
  { image: '/images/100kw_solar_plant.jpg', location: '', system: '100kW Solar System' },
  { image: '/images/200kw_solar_plant.jpg', location: '', system: '200kW Solar System' },
  { image: '/images/500kw_solar_plant.jpg', location: '', system: '500kW Solar System' },
];

const formattedGalleryItems = commercialImages.map(item => ({
  image: item.image,
  text: `${item.location}\n${item.system}`
}));

const benefits = [
  { value: '40-60%', label: 'Electricity Savings', icon: TrendingDown },
  { value: '3-4', label: 'Years Payback', icon: Clock },
  { value: '30kW+', label: 'System Sizes', icon: Zap },
  { value: '25+', label: 'Years Savings', icon: DollarSign },
];

const whySolarBenefits = [
  { icon: TrendingDown, title: 'Lower Energy Costs', description: 'Solar power is often cheaper, especially for large commercial consumers' },
  { icon: Shield, title: 'Predictable Rates', description: 'Fixed electricity rates insulated from grid price fluctuations' },
  { icon: Zap, title: 'Reliable Power', description: 'Uninterrupted operations with consistent electricity supply' },
  { icon: Leaf, title: 'Environmental Responsibility', description: 'Enhance brand reputation with eco-conscious customers' },
  { icon: Award, title: 'Low Maintenance', description: 'Minimal maintenance beyond regular monitoring and cleaning' }
];

export default function CommercialSystemsClient() {
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-white dark:hidden" />
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-gray-900 via-blue-950/20 to-gray-950" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-6">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Commercial Solar Solutions</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Power Your Business with{' '}
                <span className="text-blue-600 dark:text-blue-400">Solar Energy</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Reduce operational costs by 40-60%, increase profits, and ensure business continuity 
                with our custom commercial solar installations.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-all">
                  Get Business Quote <ArrowRight className="h-5 w-5" />
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
                Why Choose <span className="text-blue-600 dark:text-blue-400">Us?</span>
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Shield, title: 'Unmatched Quality', description: 'Premium components with comprehensive warranties' },
                  { icon: Users, title: 'Expert Team', description: 'Certified commercial solar technicians' },
                  { icon: DollarSign, title: 'Competitive Pricing', description: 'Best value for maximum ROI' },
                  { icon: TrendingUp, title: 'Proven Track Record', description: '500+ successful commercial installations' },
                  { icon: Settings, title: 'Custom Design', description: 'Tailored solutions for your business needs' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                Cut Electricity Costs And <span className="text-blue-600 dark:text-blue-400">Increase Profits</span>
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
                High electricity bills and frequent power outages are some of the things that can disrupt your business operations in Kenya. The rising cost and unreliability of grid power can hinder your company's productivity and profitability. It's time to consider a dependable and cost-effective energy solution that keeps your business running smoothly.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                Commercial solar systems in Kenya are the ideal solution to your energy challenges. Our commercial solar installations utilize the abundant sunlight, transforming it into clean, reliable energy. By adopting solar power, you can drastically cut down on electricity costs and achieve long-term financial savings.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Join the increasing number of Kenyan businesses that are making the smart switch to solar energy. Embrace sustainability, reduce your operational costs, and ensure a consistent and reliable power supply for your commercial enterprise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Solar Power Section */}
      <section className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why You Should Use <span className="text-blue-600 dark:text-blue-400">Solar Power For Your Business</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Solar power has emerged as one of the most cost-effective and reliable sources of electricity generation in Kenya
            </p>
            <div className="w-20 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {whySolarBenefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div key={i} className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Commercial <span className="text-blue-600 dark:text-blue-400">Installations</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See how we've helped businesses across Kenya reduce energy costs
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
            Hover or drag to explore - Each location features system size details
          </p>
        </div>
      </section>

      {/* Switch to Solar CTA Card */}
      <section className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl overflow-hidden shadow-2xl">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="p-8 lg:p-12 text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Switch To Solar, <span className="text-yellow-300">Save Your Money!</span>
                  </h2>
                  <p className="text-blue-100 text-lg mb-6 leading-relaxed">
                    Solar power makes energy independence possible. If you have any questions or need help, feel free to contact our team any time.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold text-base transition-all shadow-lg">
                      Request A Quote <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link href="tel:+254759493610" className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 px-6 py-3 rounded-lg font-semibold text-base transition-all">
                      <Phone className="h-6 w-6" />
                      Call: 0728 749 722
                    </Link>
                  </div>
                </div>
                <div className="hidden lg:flex items-center justify-center p-8">
                  <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Sun className="h-32 w-32 text-yellow-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
}