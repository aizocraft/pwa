// app/(services)/solar-water-pumps/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Droplets, Sun, ArrowRight, CheckCircle, Zap, Leaf } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Solar Water Pumps Kenya | Solar Powered Pumping Systems | Plasma Water Africa',
  description: 'Efficient solar water pumping systems for irrigation, livestock, and domestic use. No fuel costs, minimal maintenance, easy installation.',
};

export default function SolarWaterPumpsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
      <section className="relative bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Solar Water Pumps</h1>
            <p className="text-xl mb-8">Efficient, cost-effective solar-powered pumping for irrigation, livestock, and domestic water supply. Zero fuel costs.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold transition">Get Quote <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { value: '2.5kW+', label: 'System Sizes', icon: Zap },
              { value: '0', label: 'Fuel Costs', icon: Leaf },
              { value: '25+', label: 'Years Lifespan', icon: Sun },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 bg-white rounded-xl shadow-lg"><stat.icon className="h-10 w-10 text-green-500 mx-auto mb-2" /><div className="text-2xl font-bold">{stat.value}</div><div className="text-gray-600">{stat.label}</div></div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Benefits of Solar Water Pumps</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2"><li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> No electricity bills</li><li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> No fuel costs</li><li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Minimal maintenance</li></ul>
              <ul className="space-y-2"><li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Easy installation</li><li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Environmentally friendly</li><li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Reliable water supply</li></ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Pump Water with Free Solar Energy</h2>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-3 rounded-xl font-semibold">Request Pump Sizing</Link>
        </div>
      </section>
    </div>
  );
}