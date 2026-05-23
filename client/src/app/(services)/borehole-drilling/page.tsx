import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Drill, 
  CheckCircle, 
  ArrowRight, 
  Gauge, 
  Shield, 
  Clock,
  FileCheck,
  HardHat,
  Droplets
} from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';

export const metadata: Metadata = {
  title: 'Borehole Drilling Services | Plasma Water Africa',
  description: 'Professional borehole drilling in Kenya up to 500m depth. DTH technology, casing installation, and test pumping. Get clean water for your property.',
};

const drillingImages = [
  { image: '/images/borehole_drilling.jpeg', text: 'Drilling in Progress' },
  { image: '/images/borehole-drilling1.jpg', text: 'Site Preparation' },
  { image: '/images/borehole-drilling2.jpg', text: 'Advanced Rig' },
  { image: '/images/borehole-drilling3.jpg', text: 'Casing Installation' },
  { image: '/images/borehole-drilling4.jpg', text: 'Water Striking' },
  { image: '/images/borehole-drilling5.jpg', text: 'Test Pumping' },
  { image: '/images/borehole.jpg', text: 'Clean Water' },
];

const drillingProcess = [
  {
    step: '1',
    title: 'Site Preparation',
    description: '11" drilling on loose top soil formation',
    details: 'Temporary 9" casing installed for stability',
  },
  {
    step: '2',
    title: 'Main Drilling',
    description: '8" drilling to recommended depth',
    details: 'DTH technology for efficient penetration',
  },
  {
    step: '3',
    title: 'Casing Installation',
    description: '6" steel casing pipes installed',
    details: '7:3 ratio of plain to screened casings',
  },
  {
    step: '4',
    title: 'Gravel Pack',
    description: '2-4mm natural gravel between casings',
    details: 'Prevents sand infiltration and stabilizes borehole',
  },
  {
    step: '5',
    title: 'Well Head Construction',
    description: '1x1x1m concrete slab installation',
    details: 'Protects from surface contamination',
  },
  {
    step: '6',
    title: 'Test Pumping',
    description: '24-hour continuous pumping test',
    details: 'Measures exact yield and recharge potential',
  },
];

export default function BoreholeDrillingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-gray-900 via-blue-900 to-cyan-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-blue-300 mb-4">
              <Drill className="h-6 w-6" />
              <span className="text-sm uppercase tracking-wider">Professional Service</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Professional Borehole Drilling in Kenya
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Access clean, reliable groundwater with our state-of-the-art drilling technology. 
              Up to 500 meters depth with 99% success rate.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition"
              >
                Request Quote <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="#process" 
                className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 px-6 py-3 rounded-lg font-semibold transition"
              >
                View Process
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-gray-900 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '500m', label: 'Maximum Depth', icon: Gauge },
              { value: '99%', label: 'Success Rate', icon: Shield },
              { value: '24h', label: 'Test Pumping', icon: Clock },
              { value: '100%', label: 'NEMA Compliant', icon: FileCheck },
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

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Our Drilling Services?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                At Plasma Water Africa, we combine advanced DTH (Down-The-Hole) drilling technology 
                with years of expertise to deliver reliable water access. Our comprehensive service 
                ensures you get clean, sustainable water for your home, farm, or business.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Pre-Drilling Survey</h3>
                    <p className="text-gray-600 dark:text-gray-400">Hydro-geological assessment to identify optimal drilling location</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Full Casing Installation</h3>
                    <p className="text-gray-600 dark:text-gray-400">6" steel casings with proper screening ratios</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Water Quality Testing</h3>
                    <p className="text-gray-600 dark:text-gray-400">Chemical and bacteriological analysis for safety</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">WRMA Documentation</h3>
                    <p className="text-gray-600 dark:text-gray-400">Completion report (Form 009A) and permit assistance</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/borehole_drilling.jpeg"
                alt="Borehole drilling in progress"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Drilling Process */}
          <div id="process" className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
              Our Drilling Process
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              Systematic approach ensuring successful water access
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drillingProcess.map((step) => (
                <div key={step.step} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 font-semibold mb-2">{step.description}</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">{step.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
              Project Gallery
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              See our borehole drilling projects in action
            </p>
            <div className="h-96 w-full rounded-2xl overflow-hidden shadow-xl">
              <CircularGallery
                items={drillingImages}
                bend={2}
                textColor="#ffffff"
                borderRadius={0.08}
                font="bold 24px Figtree"
                scrollSpeed={3}
                scrollEase={0.08}
              />
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">Drag or scroll to explore gallery</p>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Access Clean Water?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Contact us today for a free consultation and quote. Our experts are ready to help.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/contact" 
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Get a Quote
              </Link>
              <Link 
                href="tel:+254759493610" 
                className="border border-white/50 hover:bg-white/10 px-6 py-3 rounded-lg font-semibold transition"
              >
                Call: 0759 493 610
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}