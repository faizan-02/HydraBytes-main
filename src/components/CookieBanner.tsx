'use client';

import { useState, useEffect } from 'react';
import { initPostHog } from './PostHogProvider';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('cookie_consent')) {
      // Small delay so it doesn't flash immediately on load
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    localStorage.setItem('cookie_consent', 'true');
    initPostHog();
    setVisible(false);
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'false');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'min(560px, calc(100vw - 32px))',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color-hover)',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-lg), 0 0 0 1px var(--accent-glow)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
      }}
      role="dialog"
      aria-label="Cookie consent"
    >
      <div style={{ flex: 1, minWidth: '200px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          We use cookies
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          We use analytics cookies to understand how you use our site and improve your experience.{' '}
          <a
            href="/legal/privacy"
            style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}
          >
            Privacy Policy
          </a>
        </p>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            padding: '8px 18px',
            borderRadius: '999px',
            border: '1px solid var(--border-color-hover)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{
            padding: '8px 18px',
            borderRadius: '999px',
            border: 'none',
            background: 'linear-gradient(135deg, #1a6b7a, #00b4d8)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
