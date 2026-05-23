// app/(services)/environmental-impact-assessment/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Shield, ArrowRight, CheckCircle, Award, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Environmental Impact Assessment Kenya | NEMA EIA Services | Plasma Water Africa',
  description: 'Professional EIA services for borehole drilling and construction projects. NEMA-compliant reports and permit assistance. Lead experts in environmental engineering.',
};

export default function EIAPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-green-50">
      <section className="relative bg-gradient-to-br from-gray-900 via-emerald-900 to-green-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Environmental Impact Assessment (EIA)</h1>
            <p className="text-xl mb-8">NEMA-compliant environmental assessments for borehole drilling and construction projects. Professional reporting and permit assistance.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-xl font-semibold transition">Get EIA Quote <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { value: 'NEMA', label: 'Compliant Reports', icon: Shield },
              { value: '7-14', label: 'Days Processing', icon: Clock },
              { value: '100%', label: 'Permit Success', icon: Award },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 bg-white rounded-xl shadow-lg"><stat.icon className="h-10 w-10 text-emerald-500 mx-auto mb-2" /><div className="text-2xl font-bold">{stat.value}</div><div className="text-gray-600">{stat.label}</div></div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Our EIA Services Include:</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2">
                <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-emerald-500" /> Field questionnaire completion</li>
                <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-emerald-500" /> Environmental impact analysis</li>
                <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-emerald-500" /> Mitigation planning</li>
              </ul>
              <ul className="space-y-2">
                <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-emerald-500" /> NEMA report submission</li>
                <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-emerald-500" /> Permit follow-up</li>
                <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-emerald-500" /> Compliance monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Need NEMA Compliance for Your Project?</h2>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-3 rounded-xl font-semibold">Contact Our EIA Experts</Link>
        </div>
      </section>
    </div>
  );
}