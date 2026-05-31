// app/(services)/solar-commercial-systems/page.tsx
import { Metadata } from 'next';
import CommercialSystemsClient from './CommercialSystemsClient';

export const metadata: Metadata = {
  title: 'Commercial Solar Systems | Business Solar Solutions Kenya | Plasma Water Africa',
  description: 'Cut business electricity costs by 40-60% with commercial solar installations. 30kW+ systems for offices, factories, and commercial properties. Maximize ROI today.',
  keywords: 'commercial solar Kenya, business solar panels, solar for offices, factory solar installation',
  openGraph: {
    title: 'Commercial Solar Systems | Plasma Water Africa',
    description: 'Cut business electricity costs by 40-60% with commercial solar installations.',
    type: 'website',
    locale: 'en_KE',
  },
};

export default function Page() {
  return <CommercialSystemsClient />;
}