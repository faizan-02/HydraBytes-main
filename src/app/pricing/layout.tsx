import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | HydraBytes — Transparent Project Pricing',
  description: 'Explore HydraBytes\' transparent pricing for web development, mobile apps, and AI/ML solutions. Flexible plans for startups, SMBs, and enterprises.',
  openGraph: {
    title: 'HydraBytes Pricing',
    description: 'Transparent pricing for web, mobile, and AI development projects.',
    type: 'website',
    url: 'https://www.hydrabytes.it.com/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
