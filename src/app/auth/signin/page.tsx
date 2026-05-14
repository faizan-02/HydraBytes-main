'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import styles from './signin.module.css';

function SignInForm() {
  const router = useRouter();
  const { status } = useSession();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);
  const registered = searchParams.get('registered');
  const reset = searchParams.get('reset');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.backdrop}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />
      </div>

      <div className={styles.glowSpot1} />
      <div className={styles.glowSpot2} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={styles.cardPerspective}
      >
        <div className={styles.cardWrapper}>
          <div className={styles.card}>
            {/* Traveling light beams */}
            <div className={styles.beamContainer}>
              <motion.div
                className={styles.beamTop}
                animate={{ left: ['-50%', '100%'] }}
                transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
              />
              <motion.div
                className={styles.beamRight}
                animate={{ top: ['-50%', '100%'] }}
                transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 0.6 }}
              />
              <motion.div
                className={styles.beamBottom}
                animate={{ right: ['-50%', '100%'] }}
                transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 1.2 }}
              />
              <motion.div
                className={styles.beamLeft}
                animate={{ bottom: ['-50%', '100%'] }}
                transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 1.8 }}
              />
            </div>

            {/* Logo */}
            <Link href="/" className={styles.logo}>
              <div style={{ width: '180px', height: '86px', overflow: 'hidden', position: 'relative', margin: '0 auto' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/transparent.png" alt="HydraBytes" style={{ position: 'absolute', width: '226px', top: '-55px', left: '50%', transform: 'translateX(-50%)' }} />
              </div>
            </Link>

            {registered && (
              <p className={styles.successMsg}>
                Account created successfully. Sign in below.
              </p>
            )}
            {reset && (
              <p className={styles.successMsg}>
                Password reset successfully. Sign in below.
              </p>
            )}

            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Sign in to your HydraBytes account</p>

            <form className={styles.form} onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              setError(null);
              const result = await signIn('credentials', { email, password, redirect: false });
              setIsLoading(false);
              if (result?.error) {
                setError('Invalid email or password.');
              } else {
                router.push('/dashboard');
              }
            }}>
              <div className={styles.inputGroup}>
                <div className={`${styles.inputWrap} ${focusedInput === 'email' ? styles.inputFocused : ''}`}>
                  <Mail size={16} className={styles.inputIcon} />
                  <input
                    type="email"
                    placeholder="Email address"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className={`${styles.inputWrap} ${focusedInput === 'password' ? styles.inputFocused : ''}`}>
                  <Lock size={16} className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    required
                    minLength={8}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password"
                  >
                    {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                </div>
              </div>

              <div className={styles.optionsRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className={styles.checkbox}
                  />
                  <span>Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>

              {error && <p className={styles.errorMsg}>{error}</p>}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className={styles.submitBtn}
                disabled={isLoading}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className={styles.spinner} />
                    </motion.div>
                  ) : (
                    <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.submitBtnText}>
                      Sign In
                      <ArrowRight size={14} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <div className={styles.divider}><span>or</span></div>

              <div className={styles.socials}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className={styles.socialBtn}
                  onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Sign in with Google
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className={styles.socialBtn}
                  onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  Sign in with GitHub
                </motion.button>
              </div>

              <p className={styles.switchText}>
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className={styles.switchLink}>Sign up</Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
