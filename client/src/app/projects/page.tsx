// 📁 app/projects/page.tsx
import ProjectsPageContent from './ProjectsPageContent';
import { makeSeo } from '../seo';

export const metadata = makeSeo({
  title: 'Our Projects | Plasma Water Africa',
  description:
    'Explore Plasma Water Africa projects across Kenya, including solar installations, borehole drilling, water towers, and integrated energy-water solutions.',
  canonicalPath: '/projects',
  keywords: [
    'Plasma Water Africa projects',
    'solar installation Kenya projects',
    'borehole drilling Kenya',
    'water tower construction Kenya',
    'renewable energy projects Kenya',
    'water and solar solutions Kenya',
  ],
  openGraph: {
    title: 'Plasma Water Africa Projects',
    description:
      'View our completed and ongoing solar, borehole, and water infrastructure projects across Kenya.',
    url: 'https://plasmawater.co.ke/projects',
    images: [{ 
      url: '/images/plasma-water-africa-logo.png', 
      width: 1200, 
      height: 630, 
      alt: 'Plasma Water Africa Projects' 
    }],
  },
  twitter: {
    title: 'Plasma Water Africa Projects',
    description:
      'See our solar, water, and infrastructure projects across Kenya delivered by Plasma Water Africa.',
    images: ['/images/plasma-water-africa-logo.png'],
  },
});

export default function ProjectsPage() {
  return <ProjectsPageContent />;
}