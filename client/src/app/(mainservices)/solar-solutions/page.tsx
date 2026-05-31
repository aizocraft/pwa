// app/(services)/solar-solutions/page.tsx
import { Metadata } from 'next';
import SolarSolutionsClient from './SolarSolutionsClient';

export const metadata: Metadata = {
  title: 'Solar Energy Solutions Kenya | Solar Panels Installation | Plasma Water Africa',
  description: 'Professional solar panel installation for homes and businesses. Reduce electricity bills by 70-90% with our premium solar systems. Free consultation and quotes.',
  keywords: 'solar panels Kenya, solar energy solutions, solar water heaters, solar pumps, commercial solar, residential solar, hybrid solar systems',
  authors: [{ name: 'Plasma Water Africa' }],
  openGraph: {
    title: 'Solar Energy Solutions | Plasma Water Africa',
    description: 'Professional solar panel installation for homes and businesses. Save up to 90% on electricity bills.',
    type: 'website',
    locale: 'en_KE',
    url: 'https://plasmawater.co.ke/solar-solutions',
    siteName: 'Plasma Water Africa',
    images: [
      {
        url: '/images/solar-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Solar Energy Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Energy Solutions Kenya',
    description: 'Professional solar panel installation for homes and businesses.',
    images: ['/images/solar-og.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://plasmawater.co.ke/solar-solutions',
  },
};

export default function SolarSolutionsPage() {
  return <SolarSolutionsClient />;
}