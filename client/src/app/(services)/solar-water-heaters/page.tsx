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
  Shield,
  TrendingDown,
  Phone,
  Calendar,
  Sparkles
} from 'lucide-react';
import SolarWaterHeatersClient from './SolarWaterHeatersClient';

export const metadata: Metadata = {
  title: 'Solar Water Heaters | Seven Stars Solar Water Heating Kenya | Plasma Water Africa',
  description: 'Save up to 85% on water heating with Seven Stars solar water heaters. Professional installation, 20+ year lifespan. Endless hot water for your home or business.',
  keywords: 'solar water heater Kenya, Seven Stars solar, solar hot water, solar heating system Nairobi',
  openGraph: {
    title: 'Solar Water Heaters | Seven Stars | Plasma Water Africa',
    description: 'Save up to 85% on water heating with premium solar water heaters',
    type: 'website',
    locale: 'en_KE',
  },
};

export default function SolarWaterHeatersPage() {
  return <SolarWaterHeatersClient />;
}