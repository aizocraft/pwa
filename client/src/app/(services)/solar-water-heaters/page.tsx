// app/(services)/solar-water-heaters/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Droplets, 
  Sun, 
  Thermometer, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Home,
  Building2,
  Award,
  Clock,
  Shield
} from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';

export const metadata: Metadata = {
  title: 'Solar Water Heaters | Seven Stars Solar Water Heating Kenya | Plasma Water Africa',
  description: 'Save up to 85% on water heating with Seven Stars solar water heaters. Professional installation, 20+ year lifespan. Endless hot water for your home or business.',
};

const waterHeaterImages = [
  { image: '/images/solar-image3.jpg', text: 'Solar Water Heater Installation' },
  { image: '/images/solar-image1.jpg', text: 'Rooftop Installation' },
  { image: '/images/solar-4.jpg', text: 'Complete System' },
];

const benefits = [
  { value: '70-85%', label: 'Energy Savings', icon: Zap },
  { value: '20-25', label: 'Years Lifespan', icon: Award },
  { value: '2-5', label: 'Years Payback', icon: Clock },
  { value: '100%', label: 'Free Energy', icon: Sun },
];

export default function SolarWaterHeatersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-teal-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-cyan-900 to-teal-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Solar Water Heaters
            </h1>
            <p className="text-xl mb-8">
              Save up to 85% on water heating costs with Kenya's premier Seven Stars solar water heaters. 
              Endless hot water, zero electricity bills for heating.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl font-semibold transition">
              Get Quote <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Why Solar Water Heating?</h2>
              <p className="text-gray-600 mb-6">
                Water heating accounts for 30-40% of your electricity bill. Solar water heaters 
                eliminate this cost completely, providing free hot water for 20+ years.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> <span>Instant hot water anytime</span></li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> <span>Works on cloudy days</span></li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> <span>Minimal maintenance required</span></li>
                <li className="flex gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> <span>Increases property value</span></li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {benefits.map((b, i) => (
                <div key={i} className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <b.icon className="h-10 w-10 text-cyan-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{b.value}</div>
                  <div className="text-sm text-gray-600">{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Installation Gallery</h2>
          <div className="h-96 rounded-2xl overflow-hidden">
            <CircularGallery items={waterHeaterImages} bend={2} textColor="#ffffff" borderRadius={0.08} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Start Saving on Water Heating Today</h2>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-cyan-600 px-8 py-3 rounded-xl font-semibold">
            Request Installation Quote
          </Link>
        </div>
      </section>
    </div>
  );
}