// app/(services)/solar-backup-systems/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Battery, Zap, ArrowRight, CheckCircle, Shield, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Solar Backup Systems Kenya | Home Battery Backup | Plasma Water Africa',
  description: 'Reliable solar backup power systems with lithium batteries. Automatic switchover during outages. Keep your home powered 24/7.',
};

export default function SolarBackupSystemsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      <section className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Solar Backup Power Systems</h1>
            <p className="text-xl mb-8">Never experience power outages again. Automatic solar battery backup for your home or business.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-xl font-semibold transition">Get Quote <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Key Features</h2>
              <ul className="space-y-3">
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-purple-500" /> Automatic switchover during outages</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-purple-500" /> Lithium battery technology</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-purple-500" /> Scalable storage capacity</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-purple-500" /> Smart monitoring via mobile app</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-purple-500" /> 10-year battery warranty</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Perfect for:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Homes in areas with frequent outages</li>
                <li>• Small businesses and shops</li>
                <li>• Medical equipment backup</li>
                <li>• Home offices</li>
                <li>• Security systems</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Never Be in the Dark Again</h2>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold">Request Backup System Quote</Link>
        </div>
      </section>
    </div>
  );
}