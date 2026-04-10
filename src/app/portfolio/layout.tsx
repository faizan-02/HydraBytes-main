import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio | HydraBytes — Projects That Deliver Results',
  description: 'Explore HydraBytes\' portfolio of web, mobile, and AI/ML projects — from analytics dashboards to computer vision systems for enterprise clients.',
  alternates: { canonical: 'https://www.hydrabytes.tech/portfolio' },
  openGraph: {
    title: 'HydraBytes Portfolio',
    description: 'Successful web, mobile, and AI/ML projects delivering measurable results.',
    type: 'website',
    url: 'https://www.hydrabytes.tech/portfolio',
  },
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
