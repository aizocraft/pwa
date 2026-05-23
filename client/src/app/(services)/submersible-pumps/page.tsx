// app/(services)/submersible-pumps/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { GitBranch, Zap, ArrowRight, CheckCircle, Droplets, Gauge } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Submersible & Booster Pumps Kenya | Borehole Pump Installation | Plasma Water Africa',
  description: 'Professional submersible pump installation for boreholes. Sizing based on depth and yield requirements. Complete pumping systems including control panels.',
};

export default function SubmersiblePumpsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      <section className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Submersible & Booster Pumps</h1>
            <p className="text-xl mb-8">Professional pump installation tailored to your borehole's depth and water requirements. Complete pumping systems with control panels.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-xl font-semibold transition">Get Pump Quote <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Complete Pumping Systems</h2>
              <ul className="space-y-3">
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-purple-500" /> Submersible pump & motor</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-purple-500" /> Submersible cable</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-purple-500" /> Control panel - power supply</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-purple-500" /> Sensor cables</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-purple-500" /> Plumbing works</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Sizing Your Pump</h3>
              <p className="text-gray-600 mb-4">We calculate the optimal pump based on:</p>
              <ul className="space-y-2 text-gray-600">
                <li>• Borehole depth</li>
                <li>• Required water flow rate</li>
                <li>• Static water level</li>
                <li>• Dynamic head pressure</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Reliable Water Pumping Solutions</h2>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold">Request Pump Installation</Link>
        </div>
      </section>
    </div>
  );
}