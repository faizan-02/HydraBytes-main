'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type State = 'loading' | 'success' | 'error';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('No unsubscribe token provided.');
      return;
    }

    fetch(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setState('success');
        } else {
          setState('error');
          setMessage(data.error ?? 'Something went wrong.');
        }
      })
      .catch(() => {
        setState('error');
        setMessage('Network error. Please try again.');
      });
  }, [token]);

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '48px 40px',
        textAlign: 'center',
      }}>
        {state === 'loading' && (
          <>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '3px solid rgba(124,58,237,0.3)', borderTopColor: '#7c3aed',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 24px',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Processing your request…</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', fontSize: 24,
            }}>✓</div>
            <h1 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Unsubscribed
            </h1>
            <p style={{ margin: '0 0 32px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              You've been removed from the HydraBytes mailing list. You won't receive any more emails from us.
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block', padding: '12px 28px',
                background: 'linear-gradient(135deg, #7c3aed, #00e5ff)',
                color: '#fff', textDecoration: 'none', borderRadius: '999px',
                fontWeight: 600, fontSize: '14px',
              }}
            >
              Back to Home
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', fontSize: 24,
            }}>✕</div>
            <h1 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Something went wrong
            </h1>
            <p style={{ margin: '0 0 32px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {message || 'This unsubscribe link may be invalid or already used.'}
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block', padding: '12px 28px',
                border: '1px solid var(--border-color-hover)',
                color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: '999px',
                fontWeight: 500, fontSize: '14px',
              }}
            >
              Back to Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeContent />
    </Suspense>
  );
}
