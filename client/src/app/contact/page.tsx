import type { Metadata } from 'next';
import { makeSeo } from '../seo';
import ContactClient from './ContactClient';

export const metadata: Metadata = makeSeo({
  title: 'Contact Plasma Water Africa | Free Consultation in Kenya',
  description:
    'Send your inquiry to Plasma Water Africa. We respond fast with expert guidance on solar installations, borehole drilling, pump systems, water treatment, and elevated water towers across Kenya.',
  canonicalPath: '/contact',
  keywords: [
    'contact Plasma Water Africa',
    'free quote Kenya',
    'solar installation quote',
    'borehole drilling quote',
    'water pump installation Kenya',
    'water treatment Kenya',
    'elevated water towers Kenya',
    'plasmawaterafrica@gmail.com',
    'Nairobi water and solar solutions',
  ],
  openGraph: {
    title: 'Contact Plasma Water Africa | Free Consultation',
    description:
      'Get a free consultation and quote. Tell us about your project—solar, boreholes, pumps, water treatment, and water towers in Kenya.',
    url: 'https://plasmawater.co.ke/contact',
    images: [
      {
        url: 'https://plasmashop.vercel.app/images/plasma-water-africa-logo.png',
        width: 1200,
        height: 630,
        alt: 'Plasma Water Africa',
      },
    ],
  },
  twitter: {
    title: 'Contact Plasma Water Africa',
    description:
      'Send your inquiry for a free consultation and quote. Serving Kenya.',
    images: ['https:/plasmashop.vercel.app/images/plasma-water-africa-logo.png'],
  },
});

export default function ContactPage() {
  return <ContactClient />;
}

