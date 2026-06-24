// app/(services)/hydro-geological-survey/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Map, 
  Activity, 
  ArrowRight, 
  CheckCircle, 
  Gauge, 
  FileText, 
  Target,
  Compass,
  Droplets,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hydro-Geological Survey Kenya | Groundwater Survey Services | Plasma Water Africa',
  description: 'Professional hydro-geological surveys using V.E.S and H.E.P methods. Identify optimal borehole drilling locations with 99% accuracy. WRMA permit assistance.',
  keywords: 'hydro-geological survey Kenya, groundwater survey, borehole siting, VES survey Kenya',
  openGraph: {
    title: 'Hydro-Geological Survey Services | Plasma Water Africa',
    description: 'Find the perfect location for your borehole with advanced geophysical survey methods',
    type: 'website',
    locale: 'en_KE',
  },
};

export default function HydroGeologicalSurveyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      {/* Hero Section - No Gradient */}
      <section className="pt-20 lg:pt-24 pb-16 lg:pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-6">
                <Map className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Scientific Groundwater Exploration</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Hydro-Geological{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  Survey Services
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Find the perfect location for your borehole with our advanced geophysical survey methods. 
                99% drilling success rate guaranteed.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-all">
                  Request Survey <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">99%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">V.E.S</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Survey Method</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">200m+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Depth Capacity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">WRMA</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Permit Assistance</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/hydro-geological_survey.webp"
                  alt="Hydro-geological survey in progress"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Conduct Survey Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Why Conduct a{' '}
                <span className="text-blue-600 dark:text-blue-400">Hydro-Geological Survey?</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Before drilling, it's crucial to identify the optimal location. Our surveys prevent dry wells 
                and maximize water yield, saving you time and money.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Vertical Electrical Sounding (V.E.S) method</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Horizontal Electrical Profiling (H.E.P) method</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Depth estimation and aquifer mapping</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">WRMA permit assistance included</span>
                </li>
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-5">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-800 shadow-md">
                  <Target className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">99%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Drilling Success Rate</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-800 shadow-md">
                  <Gauge className="h-10 w-10 text-green-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">200m+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Maximum Depth</div>
                </div>
              </div>
              <div className="space-y-5 mt-8">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-800 shadow-md">
                  <Droplets className="h-10 w-10 text-cyan-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Water Discovery</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-800 shadow-md">
                  <FileText className="h-10 w-10 text-purple-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">Included</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">WRMA Permit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Survey Process Section */}
      <section className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Survey{' '}
              <span className="text-blue-600 dark:text-blue-400">Process</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Systematic approach to ensure optimal borehole placement
            </p>
            <div className="w-20 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Site Reconnaissance', description: 'Initial site visit and geological assessment', icon: Compass },
              { step: '02', title: 'Geophysical Survey', description: 'V.E.S and H.E.P testing to identify aquifers', icon: Activity },
              { step: '03', title: 'Data Analysis', description: 'Scientific interpretation of survey results', icon: Target },
              { step: '04', title: 'Drill Point Selection', description: 'Optimal location with highest yield potential', icon: Map },
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

      {/* What Survey Includes Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white mb-6">
              What Our{' '}
              <span className="text-blue-600 dark:text-blue-400">Survey Includes</span>
            </h2>
            <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-10">
              Comprehensive groundwater exploration package
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Site reconnaissance and geological mapping',
                'Trial pit drilling for soil analysis',
                'Geophysical studies (V.E.S & H.E.P methods)',
                'Water consistency analysis',
                'Hydro-dynamic assessment',
                'Aquifer depth and yield estimation',
                'WRMA permit application assistance',
                'Detailed survey report with recommendations',
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
              Ensure Your Borehole Succeeds
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Don't drill blind. Let our experts find the optimal location for your borehole.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg"
              >
                Schedule a Survey <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    
    </div>
  );
}