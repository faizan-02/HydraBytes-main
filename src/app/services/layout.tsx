import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services | HydraBytes — Web, App & AI Development',
  description: 'HydraBytes delivers end-to-end web development, mobile app development, and AI/ML solutions. From Next.js apps to custom ML models — we engineer for impact.',
  alternates: { canonical: 'https://www.hydrabytes.it.com/services' },
  openGraph: {
    title: 'HydraBytes Services',
    description: 'Web development, app development, and AI/ML solutions engineered for impact.',
    type: 'website',
    url: 'https://www.hydrabytes.it.com/services',
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
