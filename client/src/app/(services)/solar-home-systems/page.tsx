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
  CloudRain,
  Star,
  Users,
  Heart,
  Calendar,
  Settings,
  Headphones,
  Play
} from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';

export const metadata: Metadata = {
  title: 'Solar Home Systems | Residential Solar Power Kenya | Plasma Water Africa',
  description: 'Cut electricity bills by 70-90% with our premium residential solar systems. 6kW and 5kVA solutions with battery storage. Professional installation across Kenya.',
  keywords: 'solar panels for homes Kenya, residential solar system, home solar installation, solar power Nairobi',
};

// Gallery items (CircularGallery supports { image: string; text: string }[])
const formattedGalleryItems: { image: string; text: string }[] = [
  { image: '/images/solar-image1.jpg', text: 'Solar Installation' },
  { image: '/images/solar-image2.jpg', text: 'Solar Installation' },
  { image: '/images/solar-image3.jpg', text: 'Solar Installation' },
  { image: '/images/solar-image4.jpg', text: 'Solar Installation' },
  { image: '/images/solar.jpg', text: 'Solar Installation' },
  { image: '/images/solar-4.jpg', text: 'Solar Installation' },
  { image: '/images/solar1.jpg', text: 'Solar Installation' },
  { image: '/images/solar2.jpg', text: 'Solar Installation' },
  { image: '/images/solar3.jpg', text: 'Solar Installation' },
  { image: '/images/solar4.jpg', text: 'Solar Installation' },
  { image: '/images/solar5.jpg', text: 'Solar Installation' },
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
    <div className="min-h-screen bg-[hsl(var(--background))] dark:bg-[hsl(var(--background))]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 lg:pt-24 pb-16 lg:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-white dark:hidden" />
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-gray-900 via-blue-950/20 to-gray-950" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-6">
                <Sun className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Residential Solar Solutions</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Power Your Home with{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  Clean Solar Energy
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Slash your electricity bills by up to 90% with our premium residential solar systems. 
                Enjoy reliable, 24/7 power for your home while reducing your carbon footprint.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-10">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-all"
                >
                  Get Free Quote <ArrowRight className="h-5 w-5" />
                </Link>
                <Link 
                  href="#packages" 
                  className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold text-base transition-all"
                >
                  View Packages
                </Link>
              </div>
              
              {/* Stats - Sleek design inside hero */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">70-90%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Electricity Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">25+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Years Warranty</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3-5</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Years Payback</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Clean Energy</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
                <video
                  src="/videos/inv00.mp4"
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Eliminate Electricity Cost With{' '}
                <span className="text-blue-600 dark:text-blue-400">Solar Power For Your Home</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                Are you tired of high electricity bills and frequent power outages in Kenya? Grid power is becoming costly and unreliable, disrupting daily life. This issue calls for a reliable and cost-effective solution to keep your home powered efficiently.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                Introducing solar power panels for homes in Kenya – your answer to energy problems. Our residential solar systems harness abundant sunlight, converting it into clean, renewable energy. By investing in solar power, you can significantly reduce or eliminate electricity costs, providing financial relief and stability.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Join the growing number of Kenyan homeowners who are making the smart switch to solar power. Embrace sustainability, save on electricity costs, and ensure a reliable energy source for your home.
              </p>
            </div>
            
            {/* Right Column - Why Choose Us Vertical Cards */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose{' '}
                <span className="text-blue-600 dark:text-blue-400">Us?</span>
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Shield, title: 'Unmatched Quality' },
                  { icon: ThumbsUp, title: '100% Satisfaction Guarantee' },
                  { icon: DollarSign, title: 'Competitive Pricing' },
                  { icon: Users, title: 'Experienced Solar Company' },
                  { icon: TrendingDown, title: 'Guaranteed Return on Investment' },
                  { icon: Settings, title: 'Customized Solar System Design' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-lg font-medium text-gray-800 dark:text-gray-200">{item.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Solar Packages for{' '}
              <span className="text-blue-600 dark:text-blue-400">Every Home</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose the perfect system based on your energy needs and budget
            </p>
            <div className="w-20 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packageDetails.map((pkg, i) => (
              <div key={i} className={`bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-200 dark:border-gray-800 ${pkg.price === 'Most Popular' ? 'ring-2 ring-blue-500 relative' : ''}`}>
                {pkg.price === 'Most Popular' && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="p-6 lg:p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{pkg.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold text-base mb-3">{pkg.size}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-base mb-6">{pkg.suitable}</p>
                  <ul className="space-y-3 mb-8">
                    {pkg.features.slice(0, 5).map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300 text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href="/contact" 
                    className={`block text-center py-3 rounded-lg font-semibold text-base transition-all ${pkg.price === 'Most Popular' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'}`}
                  >
                    Get Quote
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Save Money Section - Video Left */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl order-2 lg:order-1">
              <video
                src="/videos/inv01.mp4"
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm font-medium flex items-center gap-2">
                <Play className="w-4 h-4" /> Watch Installation Process
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Save Money With{' '}
                <span className="text-blue-600 dark:text-blue-400">Dependable Power</span>
              </h2>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-5">
                Our Way Of Doing Every Solar Project
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                We understand that making the switch to solar may seem intimidating, but we are here to make the process as easy and stress-free as possible. Our team will handle everything from design and installation to ongoing maintenance and support.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                We prioritize your satisfaction, making the process simple and convenient for you. Using top-quality solar components and equipment, our professionals guarantee quality standards that meet your unique needs. Let us help you power your home or business with clean, renewable energy while ensuring a seamless experience from start to finish.
              </p>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-all"
              >
                Request A Quote <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section with Location Labels */}
      <section className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Recent{' '}
              <span className="text-blue-600 dark:text-blue-400">Installations</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See how we've transformed homes across Kenya with clean solar energy
            </p>
            <div className="w-20 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="h-[500px] md:h-[550px] rounded-xl overflow-hidden shadow-lg">
            <CircularGallery
              items={formattedGalleryItems}
              bend={2.5}
              textColor="#009dff" 
              borderRadius={0.08}
              font="bold 16px Figtree, sans-serif"
              scrollSpeed={2.8}
              scrollEase={0.05}
            />
          </div>
          <p className="text-center text-base text-gray-500 dark:text-gray-400 mt-4">
            Hover or drag to explore - Click on any image for details
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Simple{' '}
              <span className="text-blue-600 dark:text-blue-400">4-Step Process</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From consultation to installation - we make going solar effortless
            </p>
            <div className="w-20 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Free Consultation', desc: 'We assess your energy needs and site conditions', icon: Home },
              { step: '02', title: 'Custom Design', desc: 'Tailored system design for maximum savings', icon: Sun },
              { step: '03', title: 'Professional Install', desc: 'Expert installation in 1-3 days', icon: Zap },
              { step: '04', title: 'Start Saving', desc: 'Enjoy reliable, clean solar power', icon: DollarSign },
            ].map((step, i) => (
              <div key={i} className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{step.step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-base text-gray-600 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to Switch to Solar?
            </h2>
            <p className="text-blue-100 text-lg mb-6">
              Get your free quote today and start saving on electricity bills
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold text-base transition-all shadow-md"
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

