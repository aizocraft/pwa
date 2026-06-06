// app/(services)/submersible-pumps/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  GitBranch, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Droplets, 
  Gauge,
  Phone,
  Calendar,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  Activity,
  Settings,
  Award
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Submersible & Booster Pumps Kenya | Borehole Pump Installation | Plasma Water Africa',
  description: 'Professional submersible pump installation for boreholes. Sizing based on depth and yield requirements. Complete pumping systems including control panels. 24/7 support.',
  keywords: 'submersible pumps Kenya, borehole pumps, booster pumps, pump installation Nairobi',
  openGraph: {
    title: 'Submersible & Booster Pumps | Plasma Water Africa',
    description: 'Professional pump installation tailored to your borehole\'s requirements',
    type: 'website',
    locale: 'en_KE',
  },
};

export default function SubmersiblePumpsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      {/* Hero Section */}
      <section className="pt-20 lg:pt-24 pb-16 lg:pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-6">
                <GitBranch className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Professional Pump Solutions</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Submersible &{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  Booster Pumps
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Professional pump installation tailored to your borehole's depth and water requirements. 
                Complete pumping systems with control panels and 24/7 support.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-all">
                  Get Pump Quote <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">500+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pumps Installed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Technical Support</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2-5</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Days Installation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">10+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Years Warranty</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/images/sub-pump1.png"
                  alt="Submersible pump installation"
                  fill
                  className="object-cover"

                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Pumping Systems Section - With Image instead of stats */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Complete{' '}
                <span className="text-blue-600 dark:text-blue-400">Pumping Systems</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                We provide end-to-end pumping solutions including all necessary components for reliable water supply.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Submersible pump & motor assembly</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Submersible cable (sized to depth)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Control panel with power supply</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Sensor cables and monitoring</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Complete plumbing works</span>
                </li>
              </ul>
            </div>
            
            {/* Image replacing the stats grid */}
            <div className="relative h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/sub-pump.png"
                alt="Submersible pump system by Plasma Water Africa"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"

              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Pump Sizing Process */}
      <section className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Pump Sizing{' '}
              <span className="text-blue-600 dark:text-blue-400">Process</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We calculate the optimal pump based on your specific requirements
            </p>
            <div className="w-20 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Borehole Depth', description: 'Measure total depth and water level', icon: Gauge },
              { step: '02', title: 'Flow Rate', description: 'Determine required water output', icon: Droplets },
              { step: '03', title: 'Head Pressure', description: 'Calculate dynamic head requirements', icon: TrendingUp },
              { step: '04', title: 'Pump Selection', description: 'Recommend optimal pump model', icon: Settings },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{step.step}</span>
                  </div>
                  <div className="flex justify-center mb-3">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Factors We Consider Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white mb-6">
              Factors We{' '}
              <span className="text-blue-600 dark:text-blue-400">Consider</span>
            </h2>
            <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-10">
              Precision sizing ensures optimal performance and longevity
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Borehole total depth measurement',
                'Static and dynamic water levels',
                'Required flow rate (m³/hour)',
                'Total dynamic head calculation',
                'Pumping lift requirements',
                'Pipe diameter and friction loss',
                'Power supply availability',
                'Pump efficiency and energy costs',
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
              Reliable Water Pumping Solutions
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Get the perfect pump for your borehole. Professional installation and ongoing support.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg"
              >
                Request Pump Installation <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}