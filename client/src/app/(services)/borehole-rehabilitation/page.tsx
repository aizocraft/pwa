// app/(services)/borehole-rehabilitation/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Wrench, ArrowRight, CheckCircle, Droplets, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Borehole Rehabilitation Services Kenya | Well Restoration | Plasma Water Africa',
  description: 'Restore underperforming boreholes to original capacity. Pump removal, fishing, re-boring, screen cleaning, and yield restoration services.',
};

export default function BoreholeRehabilitationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50">
      <section className="relative bg-gradient-to-br from-gray-900 via-orange-900 to-amber-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Borehole Rehabilitation</h1>
            <p className="text-xl mb-8">Restore your underperforming borehole to its original capacity. Professional cleaning, repair, and renewal services.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-xl font-semibold transition">Request Rehabilitation <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Complete Rehabilitation Includes:</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {['Pump removal', 'Fishing operations', 'Blowing / Re-boring', 'Pump testing', 'Re-casting / Apron repair', 'Re-installation (new or old pump)'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow"><CheckCircle className="h-5 w-5 text-green-500" /><span>{item}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Is Your Borehole Underperforming?</h2>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-3 rounded-xl font-semibold">Schedule an Assessment</Link>
        </div>
      </section>
    </div>
  );
}