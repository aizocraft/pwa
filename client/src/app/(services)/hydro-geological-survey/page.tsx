// app/(services)/hydro-geological-survey/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Map, Activity, ArrowRight, CheckCircle, Gauge, FileText, Target } from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';

export const metadata: Metadata = {
  title: 'Hydro-Geological Survey Kenya | Groundwater Survey Services | Plasma Water Africa',
  description: 'Professional hydro-geological surveys using V.E.S and H.E.P methods. Identify optimal borehole drilling locations with 99% accuracy. WRMA permit assistance.',
};

const surveyImages = [
  { image: '/images/borehole-drilling1.jpg', text: 'Site Survey' },
  { image: '/images/borehole_drilling.jpeg', text: 'Geophysical Testing' },
  { image: '/images/borehole.jpg', text: 'Water Discovery' },
];

export default function HydroGeologicalSurveyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
      <section className="relative bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4"><Map className="h-6 w-6 text-green-400" /><span className="text-sm uppercase tracking-wider">Scientific Groundwater Exploration</span></div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Hydro-Geological Survey Services</h1>
            <p className="text-xl mb-8">Find the perfect location for your borehole with our advanced geophysical survey methods. 99% drilling success rate guaranteed.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold transition">Request Survey <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Why Conduct a Hydro-Geological Survey?</h2>
              <p className="text-gray-600 mb-6">Before drilling, it's crucial to identify the optimal location. Our surveys prevent dry wells and maximize water yield.</p>
              <ul className="space-y-3">
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> Vertical Electrical Sounding (V.E.S)</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> Horizontal Electrical Profiling (H.E.P)</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> Depth estimation and aquifer mapping</li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> WRMA permit assistance</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Survey Includes:</h3>
              <ul className="space-y-2">
                <li>• Site reconnaissance and mapping</li>
                <li>• Trial pit drilling</li>
                <li>• Geophysical studies</li>
                <li>• Water consistency analysis</li>
                <li>• Hydro-dynamic assessment</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Survey Gallery</h2>
          <div className="h-96 rounded-2xl overflow-hidden"><CircularGallery items={surveyImages} bend={2} textColor="#ffffff" borderRadius={0.08} /></div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ensure Your Borehole Succeeds</h2>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-3 rounded-xl font-semibold">Schedule a Survey</Link>
        </div>
      </section>
    </div>
  );
}