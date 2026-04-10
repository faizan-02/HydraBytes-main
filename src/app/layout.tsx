import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Poppins } from 'next/font/google';
import JsonLd from '@/components/JsonLd';
import './globals.css';
import ClientLayout from './ClientLayout';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.hydrabytes.tech'),
  title: 'HydraBytes | Web Development, App Development & AI/ML Solutions',
  description:
    'HydraBytes is a cutting-edge IT startup delivering premium web development, mobile app development, and AI/ML solutions. Transform your business with next-gen technology.',
  keywords: 'web development, app development, AI, machine learning, IT startup, software development, Next.js, Pakistan',
  alternates: {
    canonical: 'https://www.hydrabytes.tech',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'HydraBytes | Next-Gen Digital Solutions',
    description: 'Transform your business with cutting-edge web, mobile, and AI solutions.',
    siteName: 'HydraBytes',
    type: 'website',
    url: 'https://www.hydrabytes.tech',
    images: [
      {
        url: '/Hydrabytes_logo.png',
        width: 2048,
        height: 2048,
        alt: 'HydraBytes Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'HydraBytes | Next-Gen Digital Solutions',
    description: 'Transform your business with cutting-edge web, mobile, and AI solutions.',
    images: ['/Hydrabytes_logo.png'],
  },
  verification: {
    google: 'MMvuUpAmS35boJ1mt8CuNyvFp2AcsbBRESHDRD3qto8',
    other: {
      'msvalidate.01': 'B48E839D6613D75AD82AF61EC702C4C8',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'HydraBytes',
          url: 'https://www.hydrabytes.tech',
        }} />
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'HydraBytes',
          url: 'https://www.hydrabytes.tech',
          logo: 'https://www.hydrabytes.tech/Hydrabytes_logo.png',
          description:
            'HydraBytes is a cutting-edge IT startup delivering premium web development, mobile app development, and AI/ML solutions.',
          sameAs: [
            'https://github.com/TheHydraBytes',
            'https://www.linkedin.com/company/hydrabytes4/',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            url: 'https://www.hydrabytes.tech/contact',
          },
        }} />
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0a' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(124,58,237,0.3)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        }>
          <ClientLayout>{children}</ClientLayout>
        </Suspense>
      </body>
    </html>
  );
}
