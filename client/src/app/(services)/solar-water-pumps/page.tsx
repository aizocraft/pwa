// app/(services)/solar-water-pumps/page.tsx
import { Metadata } from 'next';
import SolarWaterPumpsClient from './SolarWaterPumpsClient';

export const metadata: Metadata = {
  title: 'Solar Water Pumps Kenya | Solar Powered Pumping Systems | Plasma Water Africa',
  description: 'Efficient solar water pumping systems for irrigation, livestock, and domestic use. No fuel costs, minimal maintenance, easy installation. 2.5kW+ systems available.',
  keywords: 'solar water pump Kenya, solar borehole pump, irrigation solar pump, livestock watering solar pump',
  openGraph: {
    title: 'Solar Water Pumps | Plasma Water Africa',
    description: 'Efficient solar-powered pumping for irrigation, livestock, and domestic use',
    type: 'website',
    locale: 'en_KE',
  },
};

export default function SolarWaterPumpsPage() {
  return <SolarWaterPumpsClient />;
}