import type { Metadata } from 'next';
import { makeSeo } from './seo';
import HomeClient from './HomeClient';

export const metadata: Metadata = makeSeo({
  title: 'Plasma Water Africa | Water & Solar Solutions in Kenya',
  description:
    'Premium water and energy solutions across Kenya—solar power systems, borehole drilling, pump installation, and elevated water towers. Free consultations and fast quotes.',
  canonicalPath: '/',
  keywords: [
    'Plasma Water Africa',
    'solar panels Kenya',
    'borehole drilling Kenya',
    'water pumps',
    'water towers',
    'sustainable water solutions',
    'renewable energy Kenya',
  ],
  openGraph: {
    title: 'Water & Solar Solutions in Kenya | Plasma Water Africa',
    description:
      'Solar, borehole drilling, pumps, and elevated water towers—reliable services and trusted equipment across Kenya.',
    url: 'https://plasmawater.co.ke/',
    images: [
      {
        url: 'https://plasmawater.vercel.app/images/plasma-water-africa-logo.png',
        width: 1200,
        height: 630,
        alt: 'Plasma Water Africa',
      },
    ],
  },
  twitter: {
    title: 'Water & Solar Solutions in Kenya',
    description:
      'Solar, borehole drilling, pumps, and elevated water towers—get a free consultation from Plasma Water Africa.',
    images: ['https:/plasmashop.vercel.app/images/plasma-water-africa-logo.png'],
  },
});

export default function HomePage() {
  return <HomeClient />;
}

