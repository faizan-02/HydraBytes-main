import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | HydraBytes',
  description: 'Meet the HydraBytes team — engineers, designers, and AI innovators building tomorrow\'s technology. Based in Islamabad, serving clients globally.',
  alternates: { canonical: 'https://www.hydrabytes.tech/about' },
  openGraph: {
    title: 'About HydraBytes',
    description: 'Passionate engineers and designers building tomorrow\'s technology today.',
    type: 'website',
    url: 'https://www.hydrabytes.tech/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
