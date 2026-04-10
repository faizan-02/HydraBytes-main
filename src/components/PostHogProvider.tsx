'use client';

import posthog from 'posthog-js';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

export function initPostHog() {
  if (!POSTHOG_KEY || posthog.__loaded) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // we handle this manually below
    capture_pageleave: true,
    persistence: 'localStorage',
  });
}

/**
 * Safe event capture — no-op if PostHog hasn't been initialised yet
 * (e.g. user hasn't accepted cookies). Call from any client component.
 */
export function capturePostHogEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!posthog.__loaded) return;
  posthog.capture(event, properties);
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('cookie_consent') === 'true') {
      initPostHog();
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (posthog.__loaded) {
      posthog.capture('$pageview', { $current_url: window.location.href });
    }
  }, [pathname]);

  return <>{children}</>;
}
