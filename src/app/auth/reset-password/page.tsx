'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import styles from '../signin/signin.module.css';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <p style={{ color: '#ef4444', fontSize: '15px', marginBottom: '16px' }}>
          Invalid or missing reset token. Please request a new password reset link.
        </p>
        <Link href="/auth/forgot-password" style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '14px' }}>
          Request new link &rarr;
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    setIsLoading(false);

    if (res.ok) {
      router.push('/auth/signin?reset=true');
    } else {
      const data = await res.json();
      setError(data.error ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label}>New Password</label>
        <div className={styles.inputWrap}>
          <Lock size={16} className={styles.inputIcon} />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            className={styles.input}
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Confirm Password</label>
        <div className={styles.inputWrap}>
          <Lock size={16} className={styles.inputIcon} />
          <input
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat your password"
            className={styles.input}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowConfirm(!showConfirm)}
            aria-label="Toggle confirm password visibility"
          >
            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '-8px' }}>{error}</p>
      )}

      <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={isLoading}>
        {isLoading ? 'Resetting...' : <>Reset Password <ArrowRight size={16} /></>}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
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

        <h1 className={styles.title}>Reset Password</h1>
        <p className={styles.subtitle}>Enter your new password below.</p>

        <Suspense fallback={<div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
