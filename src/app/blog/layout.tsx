import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | HydraBytes — Web Dev, AI & Digital Insights',
  description: 'Explore HydraBytes\' blog for the latest insights on web development, AI/ML, mobile apps, and digital innovation. Practical guides and industry trends.',
  openGraph: {
    title: 'HydraBytes Blog',
    description: 'Insights on web development, AI/ML, and digital innovation.',
    type: 'website',
    url: 'https://www.hydrabytes.it.com/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
