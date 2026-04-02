import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: 'HydraBytes | Web Development, App Development & AI/ML Solutions',
  description:
    'HydraBytes is a cutting-edge IT startup delivering premium web development, mobile app development, and AI/ML solutions. Transform your business with next-gen technology.',
  keywords: 'web development, app development, AI, machine learning, IT startup, software development',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/transparent.png',
  },
  openGraph: {
    title: 'HydraBytes | Next-Gen Digital Solutions',
    description: 'Transform your business with cutting-edge web, mobile, and AI solutions.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
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
