// app/(services)/elevated-pvc-tanks/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Droplets, ArrowRight, CheckCircle, DollarSign, Sun } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Elevated PVC Water Tanks Kenya | Plastic Water Towers | Plasma Water Africa',
  description: 'Cost-effective elevated PVC water tank installations. Durable steel support structures with UV-protected plastic tanks. Capacities from 1,000 to 20,000 liters.',
};

const pvcImages = [
  { image: '/images/water_tower5.jpeg', text: 'PVC Tank Installation' },
  { image: '/images/water_tower6.jpeg', text: 'Rural Water Tower' },
  { image: '/images/water_tower3.jpeg', text: 'High Capacity' },
];

export default function ElevatedPVCTanksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-blue-50">
      <section className="relative bg-gradient-to-br from-gray-900 via-cyan-900 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Elevated PVC Water Tanks</h1>
            <p className="text-xl mb-8">Cost-effective water storage solutions with durable steel support structures. Affordable, lightweight, and easy to install.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl font-semibold transition">Get Quote <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">PVC Tank Advantages</h2>
              <ul className="space-y-3">
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-cyan-500" /> Affordable solution</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-cyan-500" /> Lightweight design</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-cyan-500" /> Easy installation</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-cyan-500" /> UV-protected material</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-cyan-500" /> Capacities 1,000 - 20,000 liters</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Perfect For:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Residential properties</li>
                <li>• Small businesses</li>
                <li>• Schools and institutions</li>
                <li>• Farms and agriculture</li>
                <li>• Rural water supply</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Affordable Water Storage Solutions</h2>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-cyan-600 px-8 py-3 rounded-xl font-semibold">Request PVC Tank Quote</Link>
        </div>
      </section>
    </div>
  );
}
