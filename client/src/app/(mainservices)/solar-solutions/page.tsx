import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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
  Award
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Solar Solutions | Plasma Water Africa',
  description: 'Complete solar energy solutions for homes and businesses in Kenya. Solar panels, water heaters, pumps, and backup systems.',
};

const solarServices = [
  {
    slug: 'solar-home-systems',
    title: 'Residential Solar Systems',
    description: 'Custom solar power systems for homes. Reduce or eliminate electricity bills with clean, reliable energy.',
    icon: Home,
    features: ['6kW Systems', '5kVA Inverters', 'Battery Storage', '24/7 Power'],
    image: '/images/solar-image1.jpg',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    slug: 'solar-commercial-systems',
    title: 'Commercial Solar Solutions',
    description: 'Scalable solar installations for businesses, offices, and industries. Maximize ROI and energy independence.',
    icon: Building2,
    features: ['30kW+ Systems', 'Custom Design', 'Grid-Tied Options', 'Monitoring'],
    image: '/images/solar-image2.jpg',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    slug: 'solar-water-heaters',
    title: 'Solar Water Heaters',
    description: 'Seven Stars solar water heaters. Save up to 85% on water heating costs with endless hot water.',
    icon: Droplets,
    features: ['70-90% Savings', '20-25 Year Lifespan', 'Low Maintenance', 'All-Weather'],
    image: '/images/solar-image3.jpg',
    color: 'from-cyan-500 to-teal-500',
  },
  {
    slug: 'solar-water-pumps',
    title: 'Solar Water Pumps',
    description: 'Efficient solar-powered pumping solutions for irrigation, livestock, and domestic water supply.',
    icon: Droplets,
    features: ['2.5kW+ Systems', 'No Fuel Costs', 'Easy Installation', 'Minimal Maintenance'],
    image: '/images/solar-image4.jpg',
    color: 'from-green-500 to-emerald-500',
  },
  {
    slug: 'solar-backup-systems',
    title: 'Solar Backup Systems',
    description: 'Reliable backup power with solar batteries. Never experience power outages again.',
    icon: Battery,
    features: ['Automatic Switchover', 'Scalable Storage', 'Clean Energy', 'Peace of Mind'],
    image: '/images/solar.jpg',
    color: 'from-purple-500 to-pink-500',
  },
  {
    slug: 'solar-hybrid-systems',
    title: 'Hybrid Solar Systems',
    description: 'Combine solar, battery, and grid power for maximum efficiency and reliability.',
    icon: Zap,
    features: ['Grid-Tied + Battery', 'Smart Management', 'Energy Independence', 'Highest ROI'],
    image: '/images/solar-4.jpg',
    color: 'from-red-500 to-orange-500',
  },
];

export default function SolarSolutionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-orange-50 dark:from-gray-950 dark:via-yellow-950/20 dark:to-orange-950/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-yellow-900 to-orange-900 text-white py-20 lg:py-28">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sun className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium">Power Your Future with Solar</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Solar Energy Solutions
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Harness the power of the sun with our premium solar solutions. 
              Reduce costs, achieve energy independence, and embrace sustainability.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="#services" 
                className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Explore Solutions <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Get Free Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '70-90%', label: 'Energy Savings', icon: TrendingDown },
              { value: '25+', label: 'Years Warranty', icon: Shield },
              { value: '2-5', label: 'Years Payback', icon: Clock },
              { value: '100%', label: 'Renewable', icon: Leaf },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <stat.icon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Solar Solutions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive solar energy systems tailored to your specific needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solarServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Link href={`/${service.slug}`} key={index}>
                  <div className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                    </div>
                    
                    <div className="p-6">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${service.color} mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {service.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {service.features.map((feature, i) => (
                          <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                      <div className="inline-flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-semibold group-hover:gap-3 transition-all">
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

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Plasma Water Africa?</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              We deliver excellence in every solar installation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Unmatched Quality', desc: 'Premium components with comprehensive warranties', icon: Shield },
              { title: 'Expert Team', desc: 'Qualified solar technicians and engineers', icon: Award },
              { title: 'Custom Design', desc: 'Tailored solutions for your specific needs', icon: CheckCircle },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm">
                <item.icon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}