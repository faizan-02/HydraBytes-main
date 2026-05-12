'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{
          fontSize: '64px', fontWeight: 800, lineHeight: 1,
          background: 'var(--accent-gradient, linear-gradient(135deg, #1a6b7a, #00b4d8))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
        }}>
          Oops
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px', color: 'var(--text-primary)' }}>
          Something went wrong
        </h1>
        <p style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: '15px', lineHeight: 1.6, margin: '0 0 32px' }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            display: 'inline-block', padding: '12px 28px',
            background: 'var(--accent-gradient, linear-gradient(135deg, #1a6b7a, #00b4d8))',
            color: '#fff', border: 'none', borderRadius: '10px',
            fontWeight: 600, fontSize: '15px', cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
