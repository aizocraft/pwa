import type { Metadata } from 'next';
import { makeSeo } from '../seo';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = makeSeo({
  title: 'Products & Equipment | Solar Panels, Inverters, Pumps | Plasma Water Africa',
  description:
    'Shop premium solar panels, inverters, pumps, and water equipment in Kenya. Compare specifications, check stock availability, and request a quote from Plasma Water Africa.',
  canonicalPath: '/products',
  keywords: [
    'solar panels Kenya',
    'inverters Kenya',
    'water pumps Kenya',
    'solar water pumps',
    'Plasma Water Africa',
    'water equipment Kenya',
    'solar equipment supplier Kenya',
  ],
  openGraph: {
    title: 'Products & Equipment | Plasma Water Africa',
    description:
      'Solar and water equipment including panels, inverters, pumps, and more. Browse products with verified specs and available stock.',
    images: [
      {
        url: 'https:/plasmashop.vercel.app/images/plasma-water-africa-logo.png',
        width: 1200,
        height: 630,
        alt: 'Plasma Water Africa',
      },
    ],
  },
  twitter: {
    title: 'Products & Equipment | Plasma Water Africa',
    description:
      'Browse solar panels, inverters, pumps, and water equipment in Kenya. Request a quote today.',
  },
});

export default function ProductsPage() {
  return <ProductsClient />;
}
