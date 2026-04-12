'use client';

import { useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEY = 'hydrabytes-last-activity';

export function useInactivityLogout() {
  const { data: session } = useSession();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!session) return;

    const checkAndLogout = () => {
      const last = localStorage.getItem(STORAGE_KEY);
      if (last && Date.now() - parseInt(last) > INACTIVITY_TIMEOUT) {
        signOut({ callbackUrl: '/auth/signin' });
        return true;
      }
      return false;
    };

    // Check immediately on mount (handles tab reopen after long gap)
    if (checkAndLogout()) return;

    const recordActivity = () => {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        signOut({ callbackUrl: '/auth/signin' });
      }, INACTIVITY_TIMEOUT);
    };

    // Check when tab becomes visible again (handles reopen/switch back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndLogout();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((e) => window.addEventListener(e, recordActivity, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibilityChange);
    recordActivity();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, recordActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session]);
}
