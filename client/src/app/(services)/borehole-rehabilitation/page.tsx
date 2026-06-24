// app/(services)/borehole-rehabilitation/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Wrench, 
  ArrowRight, 
  CheckCircle, 
  Droplets, 
  Clock,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  Activity,
  Gauge
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Borehole Rehabilitation Services Kenya | Well Restoration | Plasma Water Africa',
  description: 'Restore underperforming boreholes to original capacity. Pump removal, fishing, re-boring, screen cleaning, and yield restoration services. 99% success rate.',
  keywords: 'borehole rehabilitation Kenya, well restoration, borehole cleaning, borehole repair Nairobi',
  openGraph: {
    title: 'Borehole Rehabilitation Services | Plasma Water Africa',
    description: 'Restore your underperforming borehole to its original capacity',
    type: 'website',
    locale: 'en_KE',
  },
};

export default function BoreholeRehabilitationPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      {/* Hero Section */}
      <section className="pt-20 lg:pt-24 pb-16 lg:pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-6">
                <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Well Restoration Experts</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Borehole{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  Rehabilitation
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Restore your underperforming borehole to its original capacity. Professional cleaning, 
                repair, and renewal services with 99% success rate.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-all">
                  Request Rehabilitation <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">99%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">500+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Wells Restored</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3-7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Days Completion</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">50%+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Yield Increase</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/rehabilitation_bh.webp"
                  alt="Borehole rehabilitation"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signs Your Borehole Needs Rehabilitation */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Signs Your Borehole{' '}
              <span className="text-blue-600 dark:text-blue-400">Needs Rehabilitation</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Don't ignore these warning signs - restore your borehole's performance
            </p>
            <div className="w-20 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Droplets, title: 'Reduced Water Yield', description: 'Noticeably less water than before' },
              { icon: AlertCircle, title: 'Sandy or Murky Water', description: 'Water contains sediment or appears dirty' },
              { icon: Activity, title: 'Pump Cycling Issues', description: 'Pump turns on and off frequently' },
              { icon: Clock, title: 'Slow Recovery Rate', description: 'Takes longer to refill after pumping' },
              { icon: TrendingUp, title: 'Increased Energy Costs', description: 'Pump works harder, higher electricity bills' },
              { icon: AlertCircle, title: 'Age of Borehole', description: '10+ years since last maintenance' },
            ].map((sign, i) => {
              const Icon = sign.icon;
              return (
                <div key={i} className="flex items-start gap-4 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{sign.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{sign.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rehabilitation Process */}
      <section className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Rehabilitation{' '}
              <span className="text-blue-600 dark:text-blue-400">Process</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Systematic approach to restore your borehole to peak performance
            </p>
            <div className="w-20 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Assessment', description: 'Comprehensive borehole inspection and testing', icon: Gauge },
              { step: '02', title: 'Pump Removal', description: 'Safe extraction of existing pump system', icon: Wrench },
              { step: '03', title: 'Cleaning & Re-boring', description: 'Screen cleaning, blowing, and re-boring', icon: RotateCcw },
              { step: '04', title: 'Restoration', description: 'Pump re-installation and yield testing', icon: Activity },
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

      {/* Services Included Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white mb-6">
              Complete Rehabilitation{' '}
              <span className="text-blue-600 dark:text-blue-400">Includes:</span>
            </h2>
            <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-10">
              End-to-end borehole restoration services
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Pump removal and extraction',
                'Fishing operations (stuck pump retrieval)',
                'Blowing / Re-boring services',
                'Screen cleaning and development',
                'Pump testing and performance analysis',
                'Re-casting / Apron repair',
                'Casing inspection and repair',
                'New or existing pump re-installation',
                'Yield restoration and improvement',
                'Water quality testing',
                'Detailed rehabilitation report',
                'Maintenance recommendations',
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
              Is Your Borehole Underperforming?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Don't wait until it's too late. Restore your borehole to peak performance today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg"
              >
                Schedule an Assessment <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    
    </div>
  );
}