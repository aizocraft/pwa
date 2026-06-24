// app/(services)/environmental-impact-assessment/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FileText, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  Award, 
  Clock,
  FileCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Environmental Impact Assessment Kenya | NEMA EIA Services | Plasma Water Africa',
  description: 'Professional EIA services for borehole drilling and construction projects. NEMA-compliant reports and permit assistance. Lead experts in environmental engineering.',
  keywords: 'EIA Kenya, NEMA environmental impact assessment, borehole EIA report, construction EIA Kenya',
  openGraph: {
    title: 'Environmental Impact Assessment | Plasma Water Africa',
    description: 'Professional NEMA-compliant EIA services for borehole and construction projects',
    type: 'website',
    locale: 'en_KE',
  },
};

export default function EIAPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      {/* Hero Section */}
      <section className="pt-20 lg:pt-24 pb-16 lg:pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-6">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">NEMA-Compliant Environmental Assessments</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Environmental{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  Impact Assessment
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                NEMA-compliant environmental assessments for borehole drilling and construction projects. 
                Professional reporting and permit assistance with 100% success rate.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-all">
                  Get EIA Quote <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">NEMA</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Compliant Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">7-14</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Days Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Permit Success</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/environmental_impact_assessment.webp"
                  alt="Environmental impact assessment"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why EIA Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Why Environmental{' '}
                <span className="text-blue-600 dark:text-blue-400">Impact Assessment?</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Environmental Impact Assessment is a legal requirement for borehole drilling and 
                construction projects in Kenya. Our expert team ensures full NEMA compliance.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Legal requirement for project approval</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Protects environment and communities</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Avoids legal penalties and project delays</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Demonstrates corporate responsibility</span>
                </li>
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-5">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-800 shadow-md">
                  <FileCheck className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">NEMA</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Licensed Experts</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-800 shadow-md">
                  <Shield className="h-10 w-10 text-green-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Compliance Rate</div>
                </div>
              </div>
              <div className="space-y-5 mt-8">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-800 shadow-md">
                  <Clock className="h-10 w-10 text-orange-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">7-14</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Days Turnaround</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-800 shadow-md">
                  <Award className="h-10 w-10 text-purple-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">500+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Projects Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

          {/* Services Included Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white mb-6">
              Our EIA Services{' '}
              <span className="text-blue-600 dark:text-blue-400">Include:</span>
            </h2>
            <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-10">
              Comprehensive environmental assessment and permitting package
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Field questionnaire completion',
                'Environmental impact analysis',
                'Mitigation and management planning',
                'Public participation facilitation',
                'NEMA report submission',
                'Permit application follow-up',
                'Compliance monitoring support',
                'Environmental management plan',
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
              Need NEMA Compliance for Your Project?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Get professional EIA services and permit assistance from our expert team.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg"
              >
                Contact Our EIA Experts <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

     
    </div>
  );
}