// app/(mainservices)/water-towers/page.tsx
import WaterTowersClient from './client';

export const metadata = {
  title: 'Water Towers | Elevated Water Storage Solutions | Plasma Water Africa',
  description: 'Professional elevated water tank installations - steel and PVC water towers for reliable water storage, consistent pressure, and emergency reserve across Africa.',
};

export default function WaterTowersPage() {
  return <WaterTowersClient />;
}