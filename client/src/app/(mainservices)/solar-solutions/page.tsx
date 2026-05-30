// app/(services)/solar-solutions/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { 
  Sun, 
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
  ChevronRight,
  Star,
  Users,
  Phone,
  Mail,
  Sparkles,
  Gauge,
  Thermometer,
  Activity
} from 'lucide-react';

// Dynamic import for CircularGallery
const CircularGallery = dynamic(
  () => import('@/components/CircularGallery').then(mod => mod.default),
  { ssr: false, loading: () => <div className="h-[500px] bg-gradient-to-r from-gray-100 to-cyan-100 dark:from-gray-800 dark:to-cyan-900/20 animate-pulse rounded-2xl" /> }
);

const galleryItems = [
  { image: '/images/solar-image1.jpg', text: 'Residential Solar' },
  { image: '/images/solar-image2.jpg', text: 'Commercial Solar' },
  { image: '/images/solar-image3.jpg', text: 'Solar Water Heater' },
  { image: '/images/solar-image4.jpg', text: 'Solar Water Pump' },
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
    image: '/images/solar-image1.jpg',
    color: 'from-[#0043b3] to-[#009dff]',
    savings: '70-90%',
  },
  {
    slug: 'solar-commercial-systems',
    title: 'Commercial Solar Solutions',
    description: 'Scalable solar installations for businesses, offices, and industries. Maximize ROI and energy independence.',
    icon: Building2,
    features: ['30kW+ Systems', 'Custom Design', 'Grid-Tied Options', 'Monitoring'],
    image: '/images/solar-image2.jpg',
    color: 'from-[#0043b3] to-[#009dff]',
    savings: '60-80%',
  },
  {
    slug: 'solar-water-heaters',
    title: 'Solar Water Heaters',
    description: 'Seven Stars solar water heaters. Save up to 85% on water heating costs with endless hot water.',
    icon: Droplets,
    features: ['70-90% Savings', '20-25 Year Lifespan', 'Low Maintenance', 'All-Weather'],
    image: '/images/solar-image3.jpg',
    color: 'from-[#0043b3] to-[#009dff]',
    savings: '85%',
  },
  {
    slug: 'solar-water-pumps',
    title: 'Solar Water Pumps',
    description: 'Efficient solar-powered pumping solutions for irrigation, livestock, and domestic water supply.',
    icon: Droplets,
    features: ['2.5kW+ Systems', 'No Fuel Costs', 'Easy Installation', 'Minimal Maintenance'],
    image: '/images/solar-image4.jpg',
    color: 'from-[#0043b3] to-[#009dff]',
    savings: '90%',
  },
  {
    slug: 'solar-backup-systems',
    title: 'Solar Backup Systems',
    description: 'Reliable backup power with solar batteries. Never experience power outages again.',
    icon: Battery,
    features: ['Automatic Switchover', 'Scalable Storage', 'Clean Energy', 'Peace of Mind'],
    image: '/images/solar.jpg',
    color: 'from-[#0043b3] to-[#009dff]',
    savings: '100%',
  },
  {
    slug: 'solar-hybrid-systems',
    title: 'Hybrid Solar Systems',
    description: 'Combine solar, battery, and grid power for maximum efficiency and reliability.',
    icon: Zap,
    features: ['Grid-Tied + Battery', 'Smart Management', 'Energy Independence', 'Highest ROI'],
    image: '/images/solar-4.jpg',
    color: 'from-[#0043b3] to-[#009dff]',
    savings: '75-95%',
  },
];

const benefits = [
  'Reduce electricity bills by 70-90%',
  'Energy independence from the grid',
  'Protection against rising energy costs',
  'Clean, renewable energy source',
  'Low maintenance requirements',
  'Increase property value',
  'Government incentives available',
  '20-25 year panel warranty',
];

const stats = [
  { value: '70-90%', label: 'Energy Savings', icon: TrendingDown },
  { value: '25+', label: 'Years Warranty', icon: Shield },
  { value: '2-5', label: 'Years Payback', icon: Clock },
  { value: '100%', label: 'Renewable', icon: Leaf },
  { value: '500+', label: 'Projects Completed', icon: CheckCircle },
  { value: '24/7', label: 'System Monitoring', icon: Activity },
];

export default function SolarSolutionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950/20">
      
      {/* Hero Section with Gallery */}
      <section className="relative overflow-hidden pt-20 lg:pt-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#000063] via-[#0043b3] to-[#009dff] opacity-90 dark:opacity-95" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container mx-auto px-4 relative z-10 py-16 lg:py-20">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sun className="h-5 w-5 text-[#009dff]" />
              <span className="text-sm font-medium text-white">Power Your Future with Solar</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Solar{' '}
              <span className="bg-gradient-to-r from-[#009dff] to-yellow-300 bg-clip-text text-transparent">
                Energy Solutions
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Harness the power of the sun with our premium solar solutions. 
              Reduce costs, achieve energy independence, and embrace sustainability.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="#services" 
                className="inline-flex items-center gap-2 bg-white text-[#0043b3] hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Explore Solutions <ChevronRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Get Free Quote <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          {/* Circular Gallery */}
          <div className="h-[450px] md:h-[500px] lg:h-[550px] rounded-2xl overflow-hidden shadow-2xl">
            <CircularGallery 
              items={galleryItems}
              bend={2.5}
              textColor="#ffffff"
              borderRadius={0.08}
              font="bold 20px Figtree, sans-serif"
              scrollSpeed={2.8}
              scrollEase={0.05}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-sm">
                  <Icon className="h-8 w-8 text-[#009dff] mx-auto mb-2" />
                  <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our{' '}
              <span className="text-[#0043b3] dark:text-[#009dff]">Solar Solutions</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive solar energy systems tailored to your specific needs
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#0043b3] to-[#009dff] mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solarServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Link href={`/${service.slug}`} key={index}>
                  <div className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-800">
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute top-4 right-4 bg-[#009dff] text-white text-xs font-bold px-3 py-1 rounded-full">
                        Save {service.savings}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-[#0043b3] to-[#009dff] mb-4 shadow-md">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#0043b3] dark:group-hover:text-[#009dff] transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {service.features.map((feature, i) => (
                          <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                      <div className="inline-flex items-center gap-2 text-[#0043b3] dark:text-[#009dff] font-semibold group-hover:gap-3 transition-all">
                        Learn More <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-cyan-50 dark:from-gray-900 dark:to-cyan-950/20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Why Go{' '}
                <span className="text-[#0043b3] dark:text-[#009dff]">Solar?</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                Solar energy is the smartest investment for your home or business. 
                With falling equipment costs and rising electricity prices, solar provides 
                immediate savings and long-term financial benefits.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {benefits.slice(0, 8).map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0043b3] to-[#009dff] hover:from-[#003399] hover:to-[#0088cc] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Request Free Assessment <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl text-center shadow-lg border border-gray-200 dark:border-gray-800">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">₿2.5k+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Annual Savings</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl text-center shadow-lg border border-gray-200 dark:border-gray-800">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-3">
                    <Leaf className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">5+ Tons</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">CO₂ Reduced/Year</div>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl text-center shadow-lg border border-gray-200 dark:border-gray-800">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">25+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Years Warranty</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl text-center shadow-lg border border-gray-200 dark:border-gray-800">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3">
                    <Award className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Renewable Energy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-r from-[#000063] to-[#0043b3] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Plasma Water Africa?</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              We deliver excellence in every solar installation
            </p>
            <div className="w-20 h-1 bg-[#009dff] mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Unmatched Quality', desc: 'Premium components with comprehensive warranties', icon: Shield },
              { title: 'Expert Team', desc: 'Qualified solar technicians and engineers', icon: Award },
              { title: 'Custom Design', desc: 'Tailored solutions for your specific needs', icon: CheckCircle },
              { title: '24/7 Support', desc: 'Round-the-clock monitoring and assistance', icon: Clock },
              { title: 'Best Value', desc: 'Competitive pricing with highest ROI', icon: TrendingDown },
              { title: 'Sustainable', desc: 'Eco-friendly energy solutions', icon: Leaf },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#009dff] to-cyan-400 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0043b3] to-[#009dff]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Sparkles className="h-12 w-12 text-white mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Switch to Solar?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Get a free consultation and quote from our solar experts today
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white text-[#0043b3] hover:bg-gray-100 px-8 py-3 rounded-xl font-semibold transition-all shadow-lg"
              >
                <Phone className="h-5 w-5" />
                Schedule Consultation
              </Link>
              <Link 
                href="mailto:info@plasmawater.co.ke" 
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all"
              >
                <Mail className="h-5 w-5" />
                Email Inquiry
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}