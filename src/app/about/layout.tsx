import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | HydraBytes',
  description: 'Meet the HydraBytes team — passionate engineers, designers, and AI innovators building tomorrow\'s technology today. Based in Islamabad, serving clients globally.',
  openGraph: {
    title: 'About HydraBytes',
    description: 'Passionate engineers and designers building tomorrow\'s technology today.',
    type: 'website',
    url: 'https://www.hydrabytes.it.com/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
