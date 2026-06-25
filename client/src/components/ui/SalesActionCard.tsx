'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface SalesActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color?: 'cyan' | 'purple' | 'green' | 'orange';
}

const colorStyles: Record<NonNullable<SalesActionCardProps['color']>, { iconBg: string; iconText: string; hoverBg: string }> = {
  cyan: {
    iconBg: 'bg-cyan-50 dark:bg-cyan-900/20',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    hoverBg: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/30',
  },
  purple: {
    iconBg: 'bg-purple-50 dark:bg-purple-900/20',
    iconText: 'text-purple-600 dark:text-purple-400',
    hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
  },
  green: {
    iconBg: 'bg-green-50 dark:bg-green-900/20',
    iconText: 'text-green-600 dark:text-green-400',
    hoverBg: 'hover:bg-green-100 dark:hover:bg-green-900/30',
  },
  orange: {
    iconBg: 'bg-orange-50 dark:bg-orange-900/20',
    iconText: 'text-orange-600 dark:text-orange-400',
    hoverBg: 'hover:bg-orange-100 dark:hover:bg-orange-900/30',
  },
};

export default function SalesActionCard({ icon: Icon, title, description, href, color = 'cyan' }: SalesActionCardProps) {
  const styles = colorStyles[color];

  return (
    <Link
      href={href}
      className={`group block rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 transition-all duration-200 shadow-sm hover:shadow-lg ${styles.hoverBg}`}
    >
      <div className={`inline-flex items-center justify-center rounded-2xl p-3 ${styles.iconBg} mb-4`}>
        <Icon className={`w-5 h-5 ${styles.iconText}`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  );
}
