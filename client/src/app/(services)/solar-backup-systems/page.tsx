// app/(services)/solar-backup-systems/page.tsx
import { Metadata } from 'next';
import SolarBackupSystemsClient from './SolarBackupSystemsClient';

export const metadata: Metadata = {
  title: 'Solar Backup Systems Kenya | Home Battery Backup | Plasma Water Africa',
  description: 'Reliable solar backup power systems with lithium batteries. Automatic switchover during outages. Keep your home powered 24/7. 10-year battery warranty.',
  keywords: 'solar backup Kenya, home battery backup, solar battery storage, backup power system Nairobi',
  openGraph: {
    title: 'Solar Backup Systems | Plasma Water Africa',
    description: 'Never experience power outages again with automatic solar battery backup',
    type: 'website',
    locale: 'en_KE',
  },
};

export default function SolarBackupSystemsPage() {
  return <SolarBackupSystemsClient />;
}