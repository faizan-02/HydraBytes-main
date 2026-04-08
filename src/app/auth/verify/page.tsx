'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, RotateCcw } from 'lucide-react';
import MagneticButton from '@/components/MagneticButton';
import styles from '../signin/signin.module.css';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) router.push('/auth/register');
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    const next = [...otp];
    digits.split('').forEach((d, i) => { next[i] = d; });
    setOtp(next);
    const focusIndex = Math.min(digits.length, 5);
    inputRefs.current[focusIndex]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: code }),
    });
    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setError(data.error);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/auth/signin?verified=true'), 1500);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError(null);
    const res = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
    } else {
      setResendCooldown(60);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.backdrop}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
      </div>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <Link href="/" className={styles.logo}>
          <div style={{ width: '180px', height: '86px', overflow: 'hidden', position: 'relative', margin: '0 auto' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/transparent.png" alt="HydraBytes" style={{ position: 'absolute', width: '226px', top: '-55px', left: '50%', transform: 'translateX(-50%)' }} />
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: '0.5rem' }}>
          <Mail size={22} style={{ color: 'var(--accent-primary)' }} />
        </div>

        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.subtitle} style={{ marginBottom: '1.5rem' }}>
          We sent a 6-digit code to<br />
          <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }} onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  width: 48,
                  height: 56,
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${digit ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
              />
            ))}
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center', marginTop: '-4px' }}>{error}</p>
          )}
          {success && (
            <p style={{ color: '#22c55e', fontSize: '14px', textAlign: 'center', marginTop: '-4px' }}>Email verified! Redirecting...</p>
          )}

          <MagneticButton>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={isLoading || success}>
              {isLoading ? 'Verifying...' : <>Verify Email <ArrowRight size={16} /></>}
            </button>
          </MagneticButton>
        </form>

        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginTop: '1rem',
            fontSize: '0.85rem',
            color: resendCooldown > 0 ? 'var(--text-tertiary)' : 'var(--accent-primary)',
            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
            background: 'none',
            border: 'none',
            padding: 0,
          }}
        >
          <RotateCcw size={14} />
          {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
        </button>

        <p className={styles.switchText} style={{ marginTop: '1rem' }}>
          Wrong email?{' '}
          <Link href="/auth/register" className={styles.switchLink}>Go back</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
