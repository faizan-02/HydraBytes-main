'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';

const messages: Record<string, string> = {
  Configuration: 'Connecting to sign-in service, retrying automatically…',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The sign-in link is no longer valid. It may have been used already or expired.',
  Default: 'An error occurred during sign in. Please try again.',
};

function AuthErrorContent() {
  const params = useSearchParams();
  const router = useRouter();
  const error = params.get('error') ?? 'Default';
  const message = messages[error] ?? messages.Default;
  const [countdown, setCountdown] = useState(error === 'Configuration' ? 3 : 0);

  useEffect(() => {
    if (error !== 'Configuration') return;
    if (countdown <= 0) { router.replace('/auth/signin'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [error, countdown, router]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '440px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Sign In Error</h1>
        <p style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
          {message}
          {error === 'Configuration' && countdown > 0 && (
            <span style={{ display: 'block', marginTop: '8px', fontSize: '13px' }}>
              Redirecting in {countdown}s…
            </span>
          )}
        </p>
        <Link href="/auth/signin" className="btn btn-primary" style={{ padding: '12px 28px', textDecoration: 'none' }}>
          Try Again Now
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
