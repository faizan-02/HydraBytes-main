'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import styles from '../signin/signin.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    setIsLoading(false);
    setSubmitted(true);
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
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div style={{ width: '180px', height: '86px', overflow: 'hidden', position: 'relative', margin: '0 auto' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/transparent.png" alt="HydraBytes" style={{ position: 'absolute', width: '226px', top: '-55px', left: '50%', transform: 'translateX(-50%)' }} />
          </div>
        </Link>

        <h1 className={styles.title}>Forgot Password</h1>
        <p className={styles.subtitle}>
          {submitted
            ? 'Check your email for a reset link.'
            : "Enter your email and we'll send you a reset link."}
        </p>

        {submitted ? (
          <div style={{ width: '100%' }}>
            <div style={{ padding: '16px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', textAlign: 'center', color: '#22c55e', fontSize: '15px', marginBottom: '20px' }}>
              ✓ Check your email for a reset link.
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '20px' }}>
              If an account exists for that email, you will receive a password reset link shortly. Check your spam folder if you don&apos;t see it.
            </p>
            <Link
              href="/auth/signin"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px', color: 'var(--accent-primary)', fontWeight: 600 }}
            >
              <ArrowLeft size={15} /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>Email address</label>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={styles.input}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={isLoading}>
              {isLoading ? 'Sending...' : <>Send Reset Link <ArrowRight size={16} /></>}
            </button>

            <Link
              href="/auth/signin"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '-8px' }}
            >
              <ArrowLeft size={15} /> Back to Sign In
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
}
