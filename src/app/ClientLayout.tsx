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
import PostHogProvider from '@/components/PostHogProvider';
import CookieBanner from '@/components/CookieBanner';
import { useInactivityLogout } from '@/lib/useInactivityLogout';

function InactivityGuard() {
  useInactivityLogout();
  return null;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SessionProvider>
    <ThemeProvider>
      <InactivityGuard />
      <PostHogProvider>
        <ScrollProgress />
        <LoadingScreen />
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
        <CookieBanner />
      </PostHogProvider>
    </ThemeProvider>
    </SessionProvider>
  );
}
