import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Droplets, 
  Activity, 
  FileText, 
  Drill, 
  GitBranch, 
  Wrench, 
  Waves,
  ArrowRight,
  CheckCircle,
  Map,
  Gauge,
  Shield as ShieldIcon
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Borehole Services | Plasma Water Africa',
  description: 'Professional borehole drilling, hydro-geological surveys, pump installation, and rehabilitation services in Kenya.',
};

const boreholeServices = [
  {
    slug: 'hydro-geological-survey',
    title: 'Hydro-Geological Survey',
    description: 'Scientific groundwater exploration using advanced geophysical methods to identify optimal drilling locations.',
    icon: Map,
    features: ['V.E.S & H.E.P Methods', 'Site Reconnaissance', 'Depth Estimation', 'WRMA Permit Assistance'],
    image: '/images/borehole-drilling1.jpg',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    slug: 'environmental-impact-assessment',
    title: 'Environmental Impact Assessment',
    description: 'NEMA-compliant EIA reports and permitting for borehole drilling and construction projects.',
    icon: FileText,
    features: ['NEMA Licensing', 'Field Questionnaires', 'Impact Analysis', 'Mitigation Plans'],
    image: '/images/borehole-drilling2.jpg',
    color: 'from-green-500 to-emerald-500',
  },
  {
    slug: 'borehole-drilling',
    title: 'Borehole Drilling Services',
    description: 'Professional drilling with DTH machines capable of reaching depths up to 500 meters.',
    icon: Drill,
    features: ['Up to 500m Depth', 'DTH Technology', 'Casing Installation', 'Test Pumping'],
    image: '/images/borehole_drilling.jpeg',
    color: 'from-orange-500 to-red-500',
  },
  {
    slug: 'submersible-pumps',
    title: 'Submersible & Booster Pumps',
    description: 'High-quality pump installation for boreholes and water distribution systems.',
    icon: GitBranch,
    features: ['Sized to Your Needs', 'Control Panels', 'Sensor Cables', 'Plumbing Works'],
    image: '/images/borehole-drilling3.jpg',
    color: 'from-purple-500 to-pink-500',
  },
  {
    slug: 'borehole-rehabilitation',
    title: 'Borehole Rehabilitation',
    description: 'Restore and renew underperforming boreholes to their original capacity.',
    icon: Wrench,
    features: ['Pump Removal', 'Blowing/Reboring', 'Screen Cleaning', 'Yield Restoration'],
    image: '/images/borehole.jpg',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    slug: 'geo-membrane-ponds',
    title: 'Geo-Membrane Ponds',
    description: 'Professional liner installation for water storage ponds and reservoirs.',
    icon: Waves,
    features: ['Durable Liners', 'Leak Prevention', 'Custom Sizing', 'UV Resistant'],
    image: '/images/water_tower3.jpeg',
    color: 'from-cyan-500 to-blue-500',
  },
];

export default function BoreholeServicesPage() {
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
              <Droplets className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium">Premium Water Solutions</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Professional Borehole Services
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Complete groundwater solutions from survey to installation. 
              Reliable, sustainable, and professional borehole services across Kenya.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="#services" 
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Explore Services <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Request Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '500m', label: 'Max Depth', icon: Gauge },
              { value: '99%', label: 'Success Rate', icon: ShieldIcon },
              { value: '24/7', label: 'Support', icon: Activity },
              { value: '10+', label: 'Years Experience', icon: CheckCircle },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <stat.icon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
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
              Our Borehole Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              End-to-end groundwater solutions from exploration to maintenance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boreholeServices.map((service, index) => {
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

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Drilling Process</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Systematic approach ensuring successful water access
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Survey', desc: 'Hydro-geological assessment and site selection' },
              { step: '02', title: 'EIA', desc: 'Environmental impact assessment and permitting' },
              { step: '03', title: 'Drilling', desc: 'Professional drilling with DTH technology' },
              { step: '04', title: 'Completion', desc: 'Pump installation, testing, and handover' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm relative">
                <div className="text-5xl font-bold text-blue-400 mb-4">{item.step}</div>
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