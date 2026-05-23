import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, 
  Ruler, 
  HardHat, 
  Shield, 
  Droplets, 
  ArrowRight,
  CheckCircle,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Water Towers | Plasma Water Africa',
  description: 'Professional elevated water tank installation - steel and PVC water towers for reliable water storage and distribution.',
};

const towerServices = [
  {
    slug: 'elevated-steel-tanks',
    title: 'Elevated Steel Water Tanks',
    description: 'Durable, long-lasting steel water towers for commercial and residential applications.',
    icon: Building2,
    features: ['High Capacity', 'Corrosion Resistant', 'Custom Design', '20+ Year Lifespan'],
    image: '/images/water_tower1.jpeg',
    color: 'from-gray-500 to-slate-500',
    capacity: '5,000 - 100,000+ Liters',
  },
  {
    slug: 'elevated-pvc-tanks',
    title: 'Elevated PVC Water Tanks',
    description: 'Cost-effective plastic water tank installations with durable steel support structures.',
    icon: Droplets,
    features: ['Affordable', 'Lightweight', 'Easy Installation', 'UV Protected'],
    image: '/images/water_tower5.jpeg',
    color: 'from-cyan-500 to-blue-500',
    capacity: '1,000 - 20,000 Liters',
  },
];

const benefits = [
  'Consistent water pressure throughout your facility',
  'Emergency water reserve for outages',
  'Reduced pump cycling and energy costs',
  'Gravity-fed distribution system',
  'Increased property value',
  'Reliable water supply for fire protection',
];

export default function WaterTowersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-cyan-950/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 text-white py-20 lg:py-28">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Building2 className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium">Elevated Water Storage Solutions</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Professional Water Towers
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Custom-designed elevated water tanks for reliable storage and consistent pressure. 
              Steel and PVC options available.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="#solutions" 
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                View Solutions <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tower Options */}
      <section id="solutions" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Water Tower
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Steel or PVC - we have the perfect solution for your water storage needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {towerServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Link href={`/${service.slug}`} key={index}>
                  <div className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                    </div>
                    
                    <div className="p-8">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${service.color} mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {service.description}
                      </p>
                      <div className="mb-4">
                        <span className="text-sm font-semibold text-gray-500">Capacity:</span>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{service.capacity}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {service.features.map((feature, i) => (
                          <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                      <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-3 transition-all">
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

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Install an Elevated Water Tank?</h2>
              <p className="text-gray-300 mb-6">
                Elevated water towers provide natural pressure through gravity, eliminating the need for 
                booster pumps and reducing energy costs while ensuring consistent water supply.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-1" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all mt-8"
              >
                Request Design Consultation <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center">
                  <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">50%</div>
                  <div className="text-sm">Energy Savings</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center">
                  <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">100kL+</div>
                  <div className="text-sm">Max Capacity</div>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center">
                  <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">20+</div>
                  <div className="text-sm">Years Durability</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center">
                  <Clock className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm">Water Access</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}