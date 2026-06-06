// app/(services)/borehole-drilling/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Drill, 
  CheckCircle, 
  ArrowRight,  
  Shield, 
  Droplets,
  Award,
  Target
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Borehole Drilling Services Kenya | Professional Water Well Drilling | Plasma Water Africa',
  description: 'Professional borehole drilling in Kenya up to 500m depth. DTH technology, casing installation, and test pumping. 99% success rate. Get clean water for your property.',
  keywords: 'borehole drilling Kenya, water well drilling, borehole services Nairobi, professional drilling',
  openGraph: {
    title: 'Professional Borehole Drilling Services | Plasma Water Africa',
    description: 'Access clean, reliable groundwater with state-of-the-art drilling technology',
    type: 'website',
    locale: 'en_KE',
  },
};

const drillingProcess = [
  {
    step: '01',
    title: 'Site Preparation',
    description: '11" drilling on loose top soil formation',
    details: 'Temporary 9" casing installed for stability',
  },
  {
    step: '02',
    title: 'Main Drilling',
    description: '8" drilling to recommended depth',
    details: 'DTH technology for efficient penetration',
  },
  {
    step: '03',
    title: 'Casing Installation',
    description: '6" steel casing pipes installed',
    details: '7:3 ratio of plain to screened casings',
  },
  {
    step: '04',
    title: 'Gravel Pack',
    description: '2-4mm natural gravel between casings',
    details: 'Prevents sand infiltration and stabilizes borehole',
  },
  {
    step: '05',
    title: 'Well Head Construction',
    description: '1x1x1m concrete slab installation',
    details: 'Protects from surface contamination',
  },
  {
    step: '06',
    title: 'Test Pumping',
    description: '24-hour continuous pumping test',
    details: 'Measures exact yield and recharge potential',
  },
];

export default function BoreholeDrillingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] dark:bg-[hsl(var(--background))]">
      
      {/* Hero Section */}
      <section className="pt-20 lg:pt-24 pb-16 lg:pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-6">
                <Drill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Professional Drilling Services</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Professional{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  Borehole Drilling
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Access clean, reliable groundwater with our state-of-the-art DTH drilling technology. 
                Up to 500 meters depth with 99% success rate.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-all">
                  Request Quote <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="#process" className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold text-base transition-all">
                  View Process
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">500m</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Maximum Depth</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">99%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24h</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Test Pumping</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">NEMA Compliant</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/borehole.jpg"
                  alt="Borehole drilling in progress"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose{' '}
                <span className="text-blue-600 dark:text-blue-400">Our Drilling Services?</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                At Plasma Water Africa, we combine advanced DTH (Down-The-Hole) drilling technology 
                with years of expertise to deliver reliable water access. Our comprehensive service 
                ensures you get clean, sustainable water for your home, farm, or business.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Pre-Drilling Survey</h3>
                    <p className="text-gray-600 dark:text-gray-400">Hydro-geological assessment to identify optimal drilling location</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Full Casing Installation</h3>
                    <p className="text-gray-600 dark:text-gray-400">6" steel casings with proper screening ratios</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Water Quality Testing</h3>
                    <p className="text-gray-600 dark:text-gray-400">Chemical and bacteriological analysis for safety</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">WRMA Documentation</h3>
                    <p className="text-gray-600 dark:text-gray-400">Completion report (Form 009A) and permit assistance</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-5">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-800 shadow-md">
                  <Target className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">500m+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Drilling Capacity</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-800 shadow-md">
                  <Award className="h-10 w-10 text-green-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">10+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
                </div>
              </div>
              <div className="space-y-5 mt-8">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-800 shadow-md">
                  <Droplets className="h-10 w-10 text-cyan-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">50m³/h+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Max Yield</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-800 shadow-md">
                  <Shield className="h-10 w-10 text-purple-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">NEMA Compliant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Drilling Process Section */}
      <section id="process" className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our{' '}
              <span className="text-blue-600 dark:text-blue-400">Drilling Process</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Systematic approach ensuring successful water access
            </p>
            <div className="w-20 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {drillingProcess.map((step) => (
              <div key={step.step} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-2xl font-bold mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 font-semibold mb-2">{step.description}</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">{step.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white mb-6">
              Key{' '}
              <span className="text-blue-600 dark:text-blue-400">Benefits</span>
            </h2>
            <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-10">
              Why invest in a professional borehole
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Access to clean, natural groundwater',
                'Reduce or eliminate water bills',
                'Reliable water supply year-round',
                'Increase property value significantly',
                'Independence from municipal water',
                'Sustainable water source',
                'Control over water quality',
                'Emergency water backup',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-blue-600 dark:bg-blue-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Access Clean Water?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Contact us today for a free consultation and quote. Our experts are ready to help.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg"
              >
                Get a Quote <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    
    </div>
  );
}