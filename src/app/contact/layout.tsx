import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | HydraBytes',
  description: 'Get in touch with HydraBytes. Submit your project inquiry, book a free consultation, or reach us at hydrabytes4@gmail.com. We respond within 24 hours.',
  alternates: { canonical: 'https://www.hydrabytes.it.com/contact' },
  openGraph: {
    title: 'Contact HydraBytes',
    description: 'Submit your project inquiry and get a response within 24 hours.',
    type: 'website',
    url: 'https://www.hydrabytes.it.com/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
