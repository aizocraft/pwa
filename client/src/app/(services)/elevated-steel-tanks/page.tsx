// app/(services)/elevated-steel-tanks/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, Shield, ArrowRight, CheckCircle, Gauge, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Elevated Steel Water Tanks Kenya | Steel Water Towers | Plasma Water Africa',
  description: 'Professional elevated steel water tank installation. Durable, long-lasting structures with capacities from 5,000 to 100,000+ liters. Custom design and fabrication.',
};

const steelImages = [
  { image: '/images/water_tower1.jpeg', text: 'Steel Tower Design' },
  { image: '/images/water_tower2.jpeg', text: 'Tank Installation' },
  { image: '/images/water_tower7.jpeg', text: 'Support Structure' },
  { image: '/images/water_tower8.jpeg', text: 'Completed Tower' },
];

export default function ElevatedSteelTanksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      <section className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Elevated Steel Water Tanks</h1>
            <p className="text-xl mb-8">Durable, long-lasting steel water towers for reliable water storage and consistent pressure. Custom designed for your needs.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-slate-500 hover:bg-slate-600 px-6 py-3 rounded-xl font-semibold transition">Request Quote <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Premium Steel Tank Features</h2>
              <ul className="space-y-3">
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> Capacities from 5,000 to 100,000+ liters</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> Corrosion-resistant materials</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> Professional engineering design</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> 20+ year lifespan</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> Pressure optimization systems</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Benefits</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Consistent water pressure</li>
                <li>• Emergency water reserve</li>
                <li>• Reduced pump cycling</li>
                <li>• Gravity-fed distribution</li>
                <li>• Increased property value</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-slate-600 to-gray-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Invest in Reliable Water Storage</h2>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-slate-600 px-8 py-3 rounded-xl font-semibold">Get Steel Tank Quote</Link>
        </div>
      </section>
    </div>
  );
}