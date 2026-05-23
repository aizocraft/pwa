// app/(services)/geo-membrane-ponds/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Waves, ArrowRight, CheckCircle, Shield, Sun } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Geo-Membrane Ponds Kenya | Water Reservoir Lining | Plasma Water Africa',
  description: 'Professional geo-membrane pond installation for water storage. Durable HDPE liners for reservoirs, dams, and ponds. Leak-proof and UV resistant.',
};

export default function GeoMembranePondsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50">
      <section className="relative bg-gradient-to-br from-gray-900 via-teal-900 to-emerald-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Geo-Membrane Pond Installation</h1>
            <p className="text-xl mb-8">Professional lining solutions for water storage ponds, reservoirs, and dams. Durable, leak-proof HDPE membranes.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 px-6 py-3 rounded-xl font-semibold transition">Request Quote <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Premium Lining Solutions</h2>
              <ul className="space-y-3">
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-teal-500" /> High-density polyethylene (HDPE) liners</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-teal-500" /> Leak-proof installation</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-teal-500" /> UV and chemical resistant</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-teal-500" /> Custom sizing for any pond</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-teal-500" /> 20+ year lifespan</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Applications</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Agricultural reservoirs</li>
                <li>• Fish farming ponds</li>
                <li>• Industrial water storage</li>
                <li>• Wastewater treatment</li>
                <li>• Irrigation dams</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Need Professional Pond Lining?</h2>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-teal-600 px-8 py-3 rounded-xl font-semibold">Contact Our Experts</Link>
        </div>
      </section>
    </div>
  );
}