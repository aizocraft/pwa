// app/(services)/solar-home-systems/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Sun, 
  Home, 
  Battery, 
  Zap, 
  Shield, 
  TrendingDown, 
  CheckCircle, 
  ArrowRight, 
  Clock,
  Award,
  ThumbsUp,
  DollarSign,
  Leaf,
  Smartphone,
  Wifi,
  CloudRain
} from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';

export const metadata: Metadata = {
  title: 'Solar Home Systems | Residential Solar Power Kenya | Plasma Water Africa',
  description: 'Cut electricity bills by 70-90% with our premium residential solar systems. 6kW and 5kVA solutions with battery storage. Professional installation across Kenya.',
  keywords: 'solar panels for homes Kenya, residential solar system, home solar installation, solar power Nairobi',
};

const homeSolarImages = [
  { image: '/images/solar-image1.jpg', text: 'Residential Solar Array' },
  { image: '/images/solar-image2.jpg', text: 'Modern Home Installation' },
  { image: '/images/solar-image3.jpg', text: 'Rooftop Panels' },
  { image: '/images/solar-image4.jpg', text: 'Battery Storage' },
  { image: '/images/solar.jpg', text: 'Clean Energy System' },
  { image: '/images/solar-4.jpg', text: 'Complete Setup' },
];

const features = [
  {
    icon: Zap,
    title: '6kW Solar System',
    description: 'Perfect for 3-4 bedroom homes with typical appliances',
    specs: 'Powers AC, fridge, TV, lights, and more'
  },
  {
    icon: Battery,
    title: '5kVA Hybrid Inverter',
    description: 'Smart energy management with grid and solar integration',
    specs: 'Automatic switchover, battery ready'
  },
  {
    icon: Shield,
    title: 'Premium Lithium Batteries',
    description: 'Long-lasting energy storage for night and cloudy days',
    specs: '10-year warranty, 6000+ cycles'
  },
  {
    icon: Smartphone,
    title: 'Smart Monitoring',
    description: 'Track your solar production and consumption in real-time',
    specs: 'Mobile app, remote access'
  }
];

const benefits = [
  { value: '70-90%', label: 'Electricity Savings', icon: TrendingDown },
  { value: '25+', label: 'Years Panel Warranty', icon: Award },
  { value: '3-5', label: 'Years Payback Period', icon: Clock },
  { value: '100%', label: 'Clean Energy', icon: Leaf },
];

const packageDetails = [
  {
    name: 'Essential Home Package',
    size: '3kW System',
    price: 'Starter',
    features: [
      '8 x 375W Mono Panels',
      '3kW Hybrid Inverter',
      '5kWh Lithium Battery',
      'Basic Monitoring',
      'Standard Installation',
      '5 Years Warranty'
    ],
    suitable: 'Small homes (1-2 bedrooms)'
  },
  {
    name: 'Family Home Package',
    size: '6kW System',
    price: 'Most Popular',
    features: [
      '16 x 375W Mono Panels',
      '6kW Hybrid Inverter',
      '10kWh Lithium Battery',
      'Premium Monitoring',
      'Professional Installation',
      '10 Years Warranty',
      'Backup Power Ready'
    ],
    suitable: 'Medium homes (3-4 bedrooms)'
  },
  {
    name: 'Premium Home Package',
    size: '10kW System',
    price: 'Ultimate',
    features: [
      '28 x 375W Mono Panels',
      '10kW Hybrid Inverter',
      '15kWh Lithium Battery',
      'Advanced Monitoring',
      'Premium Installation',
      '12 Years Warranty',
      'Full Home Backup'
    ],
    suitable: 'Large homes (5+ bedrooms)'
  }
];

export default function SolarHomeSystemsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-orange-50 dark:from-gray-950 dark:via-yellow-950/20 dark:to-orange-950/20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-yellow-900 to-orange-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>
        
        <div className="container mx-auto px-4 py-20 lg:py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Sun className="h-5 w-5 text-yellow-400" />
                <span className="text-sm font-medium">Residential Solar Solutions</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Power Your Home with{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Clean Solar Energy
                </span>
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                Slash your electricity bills by up to 90% with our premium residential solar systems. 
                Enjoy reliable, 24/7 power for your home while reducing your carbon footprint.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Get Free Quote <ArrowRight className="h-5 w-5" />
                </Link>
                <Link 
                  href="#packages" 
                  className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  View Packages
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/solar-image1.jpg"
                  alt="Solar panels on a modern home"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              
              {/* Floating stats */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">Save 70-90%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">On electricity bills</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <ThumbsUp className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">500+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Happy homeowners</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-gray-50 dark:text-gray-950" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor" />
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor" />
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* Benefits Stats */}
      <section className="py-16 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
                <benefit.icon className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{benefit.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{benefit.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Home Solar Systems?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Engineered for Kenyan homes with premium components and smart technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{feature.description}</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">{feature.specs}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Solar Packages for Every Home
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose the perfect system based on your energy needs and budget
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {packageDetails.map((pkg, i) => (
              <div key={i} className={`bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl transition-all hover:-translate-y-2 ${pkg.price === 'Most Popular' ? 'ring-2 ring-yellow-500 relative' : ''}`}>
                {pkg.price === 'Most Popular' && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{pkg.name}</h3>
                  <p className="text-yellow-600 dark:text-yellow-400 font-semibold mb-4">{pkg.size}</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{pkg.suitable}</p>
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href="/contact" 
                    className={`block text-center py-3 rounded-xl font-semibold transition-all ${pkg.price === 'Most Popular' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'}`}
                  >
                    Get Quote
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From consultation to installation - we make going solar effortless
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Free Consultation', desc: 'We assess your energy needs and site conditions', icon: Home },
              { step: '02', title: 'Custom Design', desc: 'Tailored system design for maximum savings', icon: Sun },
              { step: '03', title: 'Professional Install', desc: 'Expert installation in 1-3 days', icon: Zap },
              { step: '04', title: 'Start Saving', desc: 'Enjoy reliable, clean solar power', icon: DollarSign },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Our Recent Installations
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            See how we've transformed homes across Kenya with clean solar energy
          </p>
          <div className="h-96 w-full rounded-2xl overflow-hidden shadow-2xl">
            <CircularGallery
              items={homeSolarImages}
              bend={2}
              textColor="#ffffff"
              borderRadius={0.08}
              font="bold 24px Figtree"
              scrollSpeed={3}
              scrollEase={0.08}
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">Drag or scroll to explore gallery</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Switch to Solar?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get your free quote today and start saving on electricity bills
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-white text-yellow-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Request Free Quote
            </Link>
            <Link 
              href="tel:+254759493610" 
              className="border-2 border-white/50 hover:bg-white/10 px-8 py-3 rounded-xl font-semibold transition"
            >
              Call: 0759 493 610
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}