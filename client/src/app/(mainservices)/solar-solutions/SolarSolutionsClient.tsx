// app/(services)/solar-solutions/SolarSolutionsClient.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { 
  Home, 
  Building2, 
  Droplets, 
  Battery, 
  Zap, 
  Shield, 
  TrendingDown, 
  Leaf,
  ArrowRight,
  CheckCircle,
  Clock,
  Award,
  Phone,
  Mail,
  Activity,
  DollarSign,
  ThumbsUp
} from 'lucide-react';

// Dynamically import CircularGallery with no SSR
const CircularGallery = dynamic(
  () => import('@/components/CircularGallery').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
    )
  }
);

const galleryItems = [
  { image: '/backup/solar-backup-kenya.png', text: 'Residential Solar' },
  { image: '/images/100kw_solar_plant.jpg', text: 'Commercial Solar' },
  { image: '/solar-water-heaters.jpg', text: 'Solar Water Heater' },
  { image: '/water-pump/Honda-Water-Pump.png', text: 'Solar Water Pump' },
  { image: '/images/solar.jpg', text: 'Solar Installation' },
  { image: '/images/solar-4.jpg', text: 'Hybrid System' },
];

const solarServices = [
  {
    slug: 'solar-home-systems',
    title: 'Residential Solar Systems',
    description: 'Custom solar power systems for homes. Reduce or eliminate electricity bills with clean, reliable energy.',
    icon: Home,
    features: ['6kW Systems', '5kVA Inverters', 'Battery Storage', '24/7 Power'],
    image: '/backup/solar-backup-kenya.png',
    savings: '70-90%',
  },
  {
    slug: 'solar-commercial-systems',
    title: 'Commercial Solar Solutions',
    description: 'Scalable solar installations for businesses, offices, and industries. Maximize ROI and energy independence.',
    icon: Building2,
    features: ['30kW+ Systems', 'Custom Design', 'Grid-Tied Options', 'Monitoring'],
    image: '/images/100kw_solar_plant.jpg',
    savings: '60-80%',
  },
  {
    slug: 'solar-water-heaters',
    title: 'Solar Water Heaters',
    description: 'Seven Stars solar water heaters. Save up to 85% on water heating costs with endless hot water.',
    icon: Droplets,
    features: ['70-90% Savings', '20-25 Year Lifespan', 'Low Maintenance', 'All-Weather'],
    image: '/solar-water-heaters.jpg',
    savings: '85%',
  },
  {
    slug: 'solar-water-pumps',
    title: 'Solar Water Pumps',
    description: 'Efficient solar-powered pumping solutions for irrigation, livestock, and domestic water supply.',
    icon: Droplets,
    features: ['2.5kW+ Systems', 'No Fuel Costs', 'Easy Installation', 'Minimal Maintenance'],
    image: '/water-pump/Honda-Water-Pump.png',
    savings: '90%',
  },
  {
    slug: 'solar-backup-systems',
    title: 'Solar Backup Systems',
    description: 'Reliable backup power with solar batteries. Never experience power outages again.',
    icon: Battery,
    features: ['Automatic Switchover', 'Scalable Storage', 'Clean Energy', 'Peace of Mind'],
    image: '/backup/solar-backup-kenya.png',
    savings: '100%',
  },
 
];

const benefits = [
  { icon: DollarSign, title: '70-90% Savings', description: 'Reduce electricity bills dramatically' },
  { icon: Shield, title: '25-Year Warranty', description: 'Long-term peace of mind' },
  { icon: Leaf, title: 'Clean Energy', description: 'Zero carbon emissions' },
  { icon: TrendingDown, title: '2-5 Year Payback', description: 'Quick return on investment' },
  { icon: Clock, title: '24/7 Monitoring', description: 'Real-time system tracking' },
  { icon: ThumbsUp, title: 'Expert Installation', description: 'Certified solar technicians' },
];

export default function SolarSolutionsClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] dark:bg-[hsl(var(--background))]">
      
      {/* Hero Section - Minimalistic */}
      <section className="relative overflow-hidden pt-16 lg:pt-20 pb-12 lg:pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-white dark:hidden" />
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-gray-900 via-blue-950/20 to-gray-950" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Solar{' '}
              <span className="text-blue-600 dark:text-blue-400">
                Energy Solutions
              </span>
            </h1>
            
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Harness the power of the sun with our premium solar solutions. 
                   </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Our{' '}
              <span className="text-blue-600 dark:text-blue-400">Solar Solutions</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive solar energy systems tailored to your specific needs
            </p>
            <div className="w-16 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-3 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {solarServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Link href={`/${service.slug}`} key={index}>
                  <div className="group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-800">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    <div className="p-5">
                      <div className="inline-flex p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 mb-3">
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {service.features.slice(0, 2).map((feature, i) => (
                          <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-semibold group-hover:gap-2.5 transition-all">
                        Learn More <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Why Choose{' '}
              <span className="text-blue-600 dark:text-blue-400">Plasma Water Africa?</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We deliver excellence in every solar installation
            </p>
            <div className="w-16 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-3 rounded-full" />
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { title: 'Premium Quality', desc: 'Top-tier components with full warranties', icon: Shield },
              { title: 'Expert Team', desc: 'Certified solar technicians and engineers', icon: Award },
              { title: 'Custom Design', desc: 'Tailored solutions for your needs', icon: CheckCircle },
              { title: '24/7 Support', desc: 'Round-the-clock monitoring and assistance', icon: Activity },
            ].map((item, i) => (
              <div key={i} className="text-center p-5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Our Solar Installations
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Browse our completed solar projects</p>
            <div className="w-12 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-2 rounded-full" />
          </div>
          {mounted && (
            <div className="h-[400px] md:h-[450px] rounded-xl overflow-hidden shadow-lg">
              <CircularGallery 
                items={galleryItems}
                bend={2.5}
                textColor="#ffffff"
                borderRadius={0.08}
                font="bold 18px Figtree, sans-serif"
                scrollSpeed={2.8}
                scrollEase={0.05}
              />
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-blue-600 dark:bg-blue-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              Ready to Switch to Solar?
            </h2>
            <p className="text-blue-100 text-sm mb-5">
              Get a free consultation and quote from our solar experts today
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-md"
              >
                <Phone className="h-3.5 w-3.5" />
                Schedule Consultation
              </Link>
              <Link 
                href="mailto:plasmawaterafrica@gmail.com" 
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                <Mail className="h-3.5 w-3.5" />
                Email Inquiry
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}