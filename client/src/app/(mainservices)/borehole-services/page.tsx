import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FileText, 
  Drill, 
  GitBranch, 
  Wrench, 
  Waves,
  ArrowRight,
  Map,
  Shield as ShieldIcon,
  Compass,
  FileCheck,
  Target,
  Award
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Professional Borehole Drilling Services in Kenya | Plasma Water Africa',
  description: 'Expert borehole drilling, hydro-geological surveys, pump installation, and rehabilitation services. NEMA compliant with 99% success rate. Free consultation.',
  keywords: 'borehole drilling Kenya, water borehole services, hydro-geological survey, submersible pumps, borehole rehabilitation, EIA report Kenya',
  openGraph: {
    title: 'Professional Borehole Services | Plasma Water Africa',
    description: 'Complete groundwater solutions from survey to installation. Reliable and sustainable borehole services across Kenya.',
    type: 'website',
    locale: 'en_KE',
  },
};

const boreholeServices = [
  {
    slug: 'hydro-geological-survey',
    title: 'Hydro-Geological Survey',
    description: 'Scientific groundwater exploration using advanced geophysical methods to identify optimal drilling locations.',
    icon: Map,
    features: ['V.E.S & H.E.P Methods', 'Site Reconnaissance', 'Depth Estimation', 'WRMA Permit Assistance'],
    image: '/images/survey.png',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    slug: 'environmental-impact-assessment',
    title: 'Environmental Impact Assessment',
    description: 'NEMA-compliant EIA reports and permitting for borehole drilling and construction projects.',
    icon: FileText,
    features: ['NEMA Licensing', 'Field Questionnaires', 'Impact Analysis', 'Mitigation Plans'],
    image: '/images/eia.png',
    color: 'from-green-500 to-emerald-500',
  },
  {
    slug: 'borehole-drilling',
    title: 'Borehole Drilling Services',
    description: 'Professional drilling with DTH machines capable of reaching depths up to 500 meters.',
    icon: Drill,
    features: ['Up to 500m Depth', 'DTH Technology', 'Casing Installation', 'Test Pumping'],
    image: '/borehole.jpg',
    color: 'from-orange-500 to-red-500',
  },
  {
    slug: 'submersible-pumps',
    title: 'Submersible & Booster Pumps',
    description: 'High-quality pump installation for boreholes and water distribution systems.',
    icon: GitBranch,
    features: ['Sized to Your Needs', 'Control Panels', 'Sensor Cables', 'Plumbing Works'],
    image: '/images/sub-pump.png',
    color: 'from-purple-500 to-pink-500',
  },
  {
    slug: 'borehole-rehabilitation',
    title: 'Borehole Rehabilitation',
    description: 'Restore and renew underperforming boreholes to their original capacity.',
    icon: Wrench,
    features: ['Pump Removal', 'Blowing/Reboring', 'Screen Cleaning', 'Yield Restoration'],
    image: '/images/Borehole-rehabilitation.jpg',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    slug: 'water-towers',
    title: 'Water Storage Solutions',
    description: 'Durable water towers and storage tanks designed for optimal water preservation and distribution.',
    icon: Waves,
    features: [ 'Custom Designs', 'Corrosion Resistant', 'Easy Maintenance', 'Professional Installation'],
    image: '/images/watertower.jpg',
    color: 'from-cyan-500 to-blue-500',
  },
];

const processSteps = [
  {
    step: '01',
    title: 'Survey',
    description: 'Hydro-geological assessment and site selection using advanced geophysical methods.',
    icon: Compass,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    step: '02',
    title: 'Environmental Assessment',
    description: 'NEMA-compliant EIA studies and permit acquisition for legal compliance.',
    icon: FileCheck,
    color: 'from-green-500 to-emerald-500',
  },
  {
    step: '03',
    title: 'Drilling & Construction',
    description: 'Professional DTH drilling, casing installation, and borehole development.',
    icon: Target,
    color: 'from-orange-500 to-red-500',
  },
  {
    step: '04',
    title: 'Completion & Handover',
    description: 'Pump installation, yield testing, water quality analysis, and project documentation.',
    icon: Award,
    color: 'from-purple-500 to-pink-500',
  },
];

export default function BoreholeServicesPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] dark:bg-[hsl(var(--background))]">
      
      {/* Hero Section - Minimal with reduced height */}
      <section className="relative overflow-hidden pt-16 lg:pt-20 pb-10 lg:pb-14">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-white dark:hidden" />
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-gray-900 via-blue-950/20 to-gray-950" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">

            
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Professional{' '}
              <span className="text-blue-600 dark:text-blue-400">
                Borehole Services
              </span>
            </h1>
            
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Complete groundwater solutions from survey to installation. 
             
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Our Borehole Services
            </h2>

            <div className="w-16 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-3 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {boreholeServices.map((service, index) => {
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
                      <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    </div>
                    
                    <div className="p-5">
                      <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-r ${service.color} mb-3`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
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

      {/* Process Section - Improved with better UI */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Our Drilling Process
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Systematic approach ensuring successful water access
            </p>
            <div className="w-16 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-3 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="group relative">
                  {/* Connection line between steps (desktop only) */}
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/4 left-[75%] w-[calc(50%-1rem)] h-0.5 bg-gradient-to-r from-blue-300 to-cyan-300 dark:from-blue-700 dark:to-cyan-700 -translate-y-1/2 z-0" />
                  )}
                  
                  <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-800 group-hover:-translate-y-1">
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                        <span className="text-white text-xs font-bold">{step.step}</span>
                      </div>
                    </div>
                    
                    {/* Icon */}
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${step.color} mb-4 mt-2`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Mobile connection indicator */}
          <div className="lg:hidden flex justify-center mt-8">
            <div className="flex gap-2">
              {processSteps.map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-600" />
              ))}
            </div>
          </div>
        </div>
      </section>

        {/* CTA Section - Minimal */}
      <section className="py-12 bg-blue-600 dark:bg-blue-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              Ready to Access Clean Groundwater?
            </h2>
            <p className="text-blue-100 text-sm mb-4">
              Contact us today for a free consultation and quote
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-md"
            >
              Request Consultation <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}