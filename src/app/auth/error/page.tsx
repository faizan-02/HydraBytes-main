'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const messages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration. Please try again.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The sign-in link is no longer valid. It may have been used already or expired.',
  Default: 'An error occurred during sign in. Please try again.',
};

function AuthErrorContent() {
  const params = useSearchParams();
  const error = params.get('error') ?? 'Default';
  const message = messages[error] ?? messages.Default;

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '440px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Sign In Error</h1>
        <p style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
          {message}
        </p>
        <Link href="/auth/signin" className="btn btn-primary" style={{ padding: '12px 28px', textDecoration: 'none' }}>
          Try Again
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
