// app/(services)/solar-water-pumps/SolarWaterPumpsClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Droplets, 
  Sun, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Leaf,
  TrendingDown,
  Clock,
  Shield,
  Phone,
  Calendar,
  Sparkles,
  ThumbsUp,
  DollarSign,
  Users,
  Settings,
  Gauge,
  CloudRain
} from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';
import { useTheme } from '@/context/ThemeContext';

const pumpImages = [
  { image: '/images/solar-image4.jpg', location: 'Kiambu', system: '3kW Solar Water Pump' },
  { image: '/images/solar-image3.jpg', location: 'Machakos', system: '5kW Borehole Pump' },
  { image: '/images/solar-image1.jpg', location: 'Thika', system: '2.5kW Irrigation Pump' },
  { image: '/images/solar-image2.jpg', location: 'Nakuru', system: '7.5kW Solar Pump' },
];

const formattedGalleryItems = pumpImages.map(item => ({
  image: item.image,
  text: `${item.location}\n${item.system}`
}));

const benefits = [
  { value: '2.5kW+', label: 'System Sizes', icon: Zap, description: 'Scalable from 2.5kW to 50kW+' },
  { value: '100%', label: 'Free Energy', icon: Sun, description: 'Powered by the sun, zero fuel costs' },
  { value: '25+', label: 'Years Lifespan', icon: Shield, description: 'Long-term reliability' },
  { value: '0', label: 'Fuel Costs', icon: Leaf, description: 'No diesel or electricity bills' },
];

const features = [
  { icon: Shield, title: 'Premium Quality', description: 'High-efficiency solar pumps from leading manufacturers' },
  { icon: Gauge, title: 'High Performance', description: 'Pumps water from depths up to 200m' },
  { icon: Clock, title: 'Low Maintenance', description: 'Minimal maintenance required' },
  { icon: ThumbsUp, title: 'Easy Installation', description: 'Professional installation in 1-2 days' },
  { icon: TrendingDown, title: 'Immediate Savings', description: 'Start saving from day one' },
  { icon: CloudRain, title: 'Works Cloudy Days', description: 'Still pumps on overcast conditions' },
];

const applications = [
  { icon: Droplets, title: 'Irrigation', description: 'Farm and crop irrigation systems' },
  { icon: Droplets, title: 'Livestock', description: 'Watering cattle, sheep, and poultry' },
  { icon: Droplets, title: 'Domestic', description: 'Home water supply and storage' },
  { icon: Droplets, title: 'Commercial', description: 'Hotels, schools, and institutions' },
];

const whySolarPumpBenefits = [
  'No electricity bills - pump with free solar energy',
  'No diesel costs - eliminate fuel expenses completely',
  'Minimal maintenance - fewer moving parts than diesel pumps',
  'Easy installation - no grid connection required',
  'Environmentally friendly - zero carbon emissions',
  'Reliable water supply - consistent pumping during daylight',
  'Remote operation - perfect for off-grid locations',
  'Automatic operation - starts pumping at sunrise',
];

export default function SolarWaterPumpsClient() {
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
                <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Solar Powered Pumping Systems</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Solar{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  Water Pumps
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Efficient, cost-effective solar-powered pumping for irrigation, livestock, and domestic water supply. 
                Zero fuel costs, minimal maintenance, reliable water anywhere.
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
                  src="/images/solar-image4.jpg"
                  alt="Solar water pump installation"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose{' '}
              <span className="text-blue-600 dark:text-blue-400">Our Solar Pumps?</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Reliable, efficient, and cost-effective pumping solutions
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

      {/* Applications Section */}
      <section className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Perfect for{' '}
                <span className="text-blue-600 dark:text-blue-400">Every Application</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                From small farms to large commercial operations, our solar water pumps provide reliable 
                water supply without ongoing fuel costs.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {applications.map((app, i) => {
                  const Icon = app.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{app.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{app.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center">
              <Zap className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
              <div className="text-3xl font-bold mb-2">Save 100%</div>
              <p className="text-lg mb-4">on Pumping Energy Costs</p>
              <div className="text-6xl font-bold mb-2">₿0</div>
              <p className="text-blue-100">Monthly fuel/electricity bill for pumping</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits List Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white mb-6">
              Benefits of{' '}
              <span className="text-blue-600 dark:text-blue-400">Solar Water Pumps</span>
            </h2>
            <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-10">
              Switch to solar pumping and enjoy reliable water without ongoing costs
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {whySolarPumpBenefits.map((benefit, i) => (
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
              See how we've helped farmers and homeowners across Kenya
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

      {/* No Fuel Costs CTA Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
           
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Pump Water with Free Solar Energy
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Zero fuel costs. Zero electricity bills. Just reliable water, powered by the sun.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg"
              >
                Request Pump Sizing <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    
    </div>
  );
}