// app/(mainservices)/water-towers/client.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { 
  Building2, 
  Shield, 
  Droplets, 
  ArrowRight,
  CheckCircle,
  Zap,
  Clock,
  ChevronRight,
  Phone,
  Mail,
  Gauge,
  Ruler,
  HardHat
} from 'lucide-react';

// Dynamic import with ssr: false - allowed in Client Component
const CircularGallery = dynamic(
  () => import('@/components/CircularGallery').then(mod => mod.default),
  { ssr: false, loading: () => <div className="h-[400px] md:h-[450px] animate-pulse rounded-2xl bg-gradient-to-r from-gray-100 to-cyan-100 dark:from-gray-800 dark:to-cyan-900/20" /> }
);

const specifications = [
  {
    type: 'Steel Water Towers',
    icon: Building2,
    capacities: ['5,000L', '10,000L', '20,000L', '30,000L', '50,000L+'],
    features: ['Heavy-duty galvanized steel', 'Corrosion-resistant coating', 'Seismic design', '20+ year lifespan'],
    color: 'from-gray-600 to-slate-600',
  },
  {
    type: 'PVC Water Towers',
    icon: Droplets,
    capacities: ['1,000L', '2,000L', '3,000L', '5,000L', '10,000L'],
    features: ['UV-protected material', 'Lightweight design', 'Easy installation', 'Affordable pricing'],
    color: 'from-cyan-500 to-blue-500',
  },
];

const benefits = [
  'Consistent water pressure throughout your facility',
  'Emergency water reserve for power outages',
  'Reduced pump cycling and energy costs',
  'Gravity-fed distribution system',
  'Increased property value',
  'Reliable water supply for fire protection',
];

export default function WaterTowersClient() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] dark:bg-[hsl(var(--background))]">
      
      {/* Hero Section - Reduced height */}
      <section className="relative overflow-hidden pt-12 lg:pt-16 pb-8 lg:pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-white dark:hidden" />
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-gray-900 via-blue-950/30 to-gray-950" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Professional{' '}
              <span className="text-blue-600 dark:text-blue-400">
                Water Towers
              </span>
            </h1>
            
            <p className="text-base text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Custom-designed elevated water tanks for reliable storage and consistent pressure. 
             
            </p>
          </div>
        </div>
      </section>

      {/* Available Configurations Section - Cards at 80% width on desktop */}
      <section id="configurations" className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Available{' '}
              <span className="text-blue-600 dark:text-blue-400">Configurations</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose the perfect water tower for your needs
            </p>
            <div className="w-16 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-3 rounded-full" />
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 lg:w-[80%] lg:mx-auto">
            {specifications.map((spec, idx) => {
              const Icon = spec.icon;
              return (
                <div key={idx} className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-800">
                  <div className={`bg-gradient-to-r ${spec.color} p-5 text-white`}>
                    <div className="flex items-center gap-3">
                      <Icon className="h-7 w-7" />
                      <h3 className="text-xl font-bold">{spec.type}</h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-5">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-blue-500" />
                        Capacities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {spec.capacities.map((cap, i) => (
                          <span key={i} className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg">
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-5">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <HardHat className="h-4 w-4 text-blue-500" />
                        Key Features
                      </h4>
                      <ul className="space-y-1.5">
                        {spec.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Link 
                      href="/contact" 
                      className={`inline-flex items-center justify-center w-full gap-2 bg-gradient-to-r ${spec.color} text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg group-hover:gap-3`}
                    >
                      Get Quote <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section - With Image instead of stats */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center lg:w-[85%] lg:mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-5">
                Why Install an{' '}
                <span className="text-blue-600 dark:text-blue-400">Elevated Water Tank?</span>
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8">
                Elevated water towers provide natural pressure through gravity, eliminating the need for 
                booster pumps and reducing energy costs while ensuring consistent water supply.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-base text-gray-600 dark:text-gray-400">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-base transition-all mt-8"
              >
                Request Consultation <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            {/* Image replacing the stats grid */}
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/tower-construction1.jpg"
                alt="Water tower construction and installation by Plasma Water Africa"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback to a default image if the specified one doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/water_tower1.jpeg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Our Water Tower Installations
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Browse our completed projects</p>
            <div className="w-12 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-2 rounded-full" />
          </div>
          <div className="h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-xl">
            <CircularGallery 
              items={[
                { image: '/images/water_tower1.jpeg', text: 'Steel Water Tower' },
                { image: '/images/water_tower2.jpeg', text: 'Tank Installation' },
                { image: '/images/water_tower5.jpeg', text: 'PVC Water Tower' },
                { image: '/images/water_tower7.jpeg', text: 'Support Structure' },
                { image: '/images/water_tower8.jpeg', text: 'Completed Tower' },
              ]}
              bend={2.5}
              textColor="#ffffff"
              borderRadius={0.08}
              font="bold 18px Figtree, sans-serif"
              scrollSpeed={2.8}
              scrollEase={0.05}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to Install Your Water Tower?
            </h2>
            <p className="text-blue-100 mb-6">
              Contact our team today for a free consultation and quote
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg"
              >
                <Phone className="h-4 w-4" />
                Contact Us
              </Link>
              <Link 
                href="mailto:info@plasmawater.co.ke" 
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-semibold transition-all"
              >
                <Mail className="h-4 w-4" />
                Email Inquiry
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}