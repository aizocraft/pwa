// app/(services)/solar-hybrid-systems/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Zap, Battery, Sun, ArrowRight, CheckCircle, TrendingUp, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Solar Hybrid Systems Kenya | Grid-Tied Solar with Battery | Plasma Water Africa',
  description: 'Hybrid solar systems combining solar, battery, and grid power. Maximum savings with 24/7 reliability. Smart energy management.',
};

export default function SolarHybridSystemsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50">
      <section className="relative bg-gradient-to-br from-gray-900 via-red-900 to-orange-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Solar Hybrid Systems</h1>
            <p className="text-xl mb-8">The best of both worlds - solar, battery, and grid power combined. Maximum savings with 24/7 reliability.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 px-6 py-3 rounded-xl font-semibold transition">Get Quote <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { value: '100%', label: 'Energy Independence', icon: Sun },
              { value: '24/7', label: 'Power Availability', icon: Zap },
              { value: '3-5', label: 'Years Payback', icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 bg-white rounded-xl shadow-lg"><stat.icon className="h-10 w-10 text-red-500 mx-auto mb-2" /><div className="text-2xl font-bold">{stat.value}</div><div className="text-gray-600">{stat.label}</div></div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">How Hybrid Systems Work</h2>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2"><Sun className="h-6 w-6 text-red-500" /></div><p className="font-semibold">Solar Power</p><p className="text-sm text-gray-600">Daytime power generation</p></div>
              <div><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2"><Battery className="h-6 w-6 text-red-500" /></div><p className="font-semibold">Battery Storage</p><p className="text-sm text-gray-600">Store excess energy</p></div>
              <div><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2"><Zap className="h-6 w-6 text-red-500" /></div><p className="font-semibold">Grid Power</p><p className="text-sm text-gray-600">Seamless backup</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-red-600 to-orange-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Maximize Your Solar Investment</h2>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-3 rounded-xl font-semibold">Request Hybrid System Quote</Link>
        </div>
      </section>
    </div>
  );
}