// app/(services)/solar-commercial-systems/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, 
  Sun, 
  Battery, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  ArrowRight,
  Factory,
  Briefcase,
  PieChart,
  Clock,
  Shield
} from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';

export const metadata: Metadata = {
  title: 'Commercial Solar Systems | Business Solar Solutions Kenya | Plasma Water Africa',
  description: 'Cut business electricity costs with commercial solar installations. 30kW+ systems for offices, factories, and commercial properties. Maximize ROI today.',
};

const commercialImages = [
  { image: '/images/solar-image2.jpg', text: 'Commercial Solar Array' },
  { image: '/images/solar-image1.jpg', text: 'Office Building Installation' },
  { image: '/images/solar-image3.jpg', text: 'Factory Rooftop' },
  { image: '/images/solar-4.jpg', text: 'Industrial System' },
];

const benefits = [
  { value: '40-60%', label: 'ROI Increase', icon: TrendingUp },
  { value: '3-4', label: 'Years Payback', icon: Clock },
  { value: '30kW+', label: 'System Sizes', icon: Zap },
  { value: '25+', label: 'Years Savings', icon: DollarSign },
];

export default function SolarCommercialSystemsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-cyan-950/20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 text-white py-20 lg:py-28">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Building2 className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium">Commercial Solar Solutions</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Power Your Business with{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Solar Energy
              </span>
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Reduce operational costs, increase profits, and ensure business continuity 
              with our custom commercial solar installations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-semibold transition">
                Get Business Quote <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Maximize Your Business ROI
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Commercial solar systems are one of the smartest investments your business can make. 
                With electricity costs rising, solar provides predictable, lower energy costs for 25+ years.
              </p>
              <ul className="space-y-3">
                {[
                  'Reduce electricity bills by 40-60%',
                  'Protect against rising energy costs',
                  'Enhance your green credentials',
                  'Qualify for tax benefits',
                  'Energy independence from grid',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-8 text-white text-center">
              <PieChart className="h-16 w-16 mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">40-60%</div>
              <p className="text-lg">Average Reduction in Electricity Costs</p>
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="text-2xl font-bold">3-4 Years</div>
                <p>Typical Payback Period</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Commercial Installations</h2>
          <div className="h-96 rounded-2xl overflow-hidden">
            <CircularGallery items={commercialImages} bend={2} textColor="#ffffff" borderRadius={0.08} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Reduce Your Business Energy Costs?</h2>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition">
            Request Commercial Quote <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}