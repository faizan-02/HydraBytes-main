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
        <a
          href="https://wa.me/923395116983"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            border: '1.5px solid var(--border-color)',
            boxShadow: 'none',
            transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.backgroundColor = '#25D366';
            el.style.borderColor = '#25D366';
            el.style.boxShadow = '0 4px 16px rgba(37, 211, 102, 0.45)';
            el.style.transform = 'scale(1.1)';
            (el.querySelector('svg') as SVGElement).style.fill = '#ffffff';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.backgroundColor = 'transparent';
            el.style.borderColor = 'var(--border-color)';
            el.style.boxShadow = 'none';
            el.style.transform = 'scale(1)';
            (el.querySelector('svg') as SVGElement).style.fill = 'var(--text-secondary)';
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width="30"
            height="30"
            fill="var(--text-secondary)"
            style={{ transition: 'fill 0.3s ease' }}
            aria-hidden="true"
          >
            <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.469 2.027 7.774L0 32l8.43-2.01A15.938 15.938 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.77-1.853l-.485-.287-5.005 1.194 1.218-4.876-.317-.502A13.267 13.267 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.878c-.398-.2-2.355-1.162-2.72-1.294-.365-.133-.63-.2-.896.2-.265.398-1.029 1.294-1.261 1.56-.232.265-.465.298-.863.1-.398-.2-1.681-.62-3.203-1.977-1.183-1.056-1.982-2.36-2.214-2.758-.232-.398-.025-.613.175-.811.18-.178.398-.465.597-.698.2-.232.265-.398.398-.663.133-.265.066-.498-.033-.698-.1-.2-.896-2.16-1.228-2.958-.323-.777-.65-.672-.896-.684l-.763-.013c-.265 0-.697.1-.1063.498-.365.398-1.394 1.36-1.394 3.317 0 1.958 1.427 3.849 1.627 4.115.2.265 2.808 4.287 6.805 6.014.951.41 1.694.655 2.272.838.954.303 1.823.26 2.509.158.765-.114 2.355-.963 2.687-1.893.332-.93.332-1.727.232-1.893-.1-.166-.365-.265-.763-.465z" />
          </svg>
        </a>
      </PostHogProvider>
    </ThemeProvider>
    </SessionProvider>
  );
}
