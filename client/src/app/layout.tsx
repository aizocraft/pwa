// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import ClientLayout from './ClientLayout'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Plasma Water Africa',
  description:
    'Premium water & energy solutions: solar power systems, borehole drilling, pumps, and elevated water towers across Kenya.',
}

export const viewport: Viewport = {
  themeColor: '#000000',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}