'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/lib/ThemeContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import PageTransition from '@/components/PageTransition';
import ScrollProgress from '@/components/ScrollProgress';
import ScrollToTop from '@/components/ScrollToTop';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SessionProvider>
    <ThemeProvider>
      <ScrollProgress />

      <LoadingScreen />
      <div className="bg-grid" />
      <div className="bg-glow-orb bg-glow-orb-1" />
      <div className="bg-glow-orb bg-glow-orb-2" />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1, paddingTop: '80px' }}>
        <Suspense>
          <PageTransition key={pathname}>
            {children}
          </PageTransition>
        </Suspense>
      </main>
      <Footer />
      <ScrollToTop />
    </ThemeProvider>
    </SessionProvider>
  );
}
