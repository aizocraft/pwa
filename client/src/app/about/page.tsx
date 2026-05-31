import type { Metadata } from 'next'
import About from './About'
import { makeSeo } from '../seo'

export const metadata: Metadata = makeSeo({
  title: 'About Plasma Water Africa | Water & Solar Experts in Kenya',
  description:
    'Learn about Plasma Water Africa—your trusted provider of solar energy solutions, borehole drilling services, pump installations, water treatment, and elevated water towers across Kenya. Built for reliability, sustainability, and long-term performance.',
  canonicalPath: '/about',
  keywords: [
    'Plasma Water Africa',
    'about Plasma Water Africa',
    'solar installation Kenya',
    'borehole drilling Kenya',
    'water pump installation',
    'water tower construction',
    'water treatment Kenya',
    'renewable energy Kenya',
  ],
  openGraph: {
    title: 'About Plasma Water Africa | Water & Solar Experts',
    description:
      'We deliver clean water and reliable renewable energy solutions across Kenya—from project survey to installation and support.',
    url: 'https://plasmawater.co.ke/about',
    images: [{ url: '/images/plasma-water-africa-logo.png', width: 1200, height: 630, alt: 'Plasma Water Africa' }],
  },
  twitter: {
    title: 'About Plasma Water Africa',
    description:
      'Solar, boreholes, pumps, and elevated water towers in Kenya—trusted solutions from Plasma Water Africa.',
    images: ['/images/plasma-water-africa-logo.png'],
  },
})

export default function AboutPage() {
  return <About />;
}


