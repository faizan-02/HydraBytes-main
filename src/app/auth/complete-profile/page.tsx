'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CompleteProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/signin');
    // Admin users skip this page
    if (status === 'authenticated') {
      const u = session.user as { role?: string; profileComplete?: boolean };
      if (u.role === 'admin') { router.replace('/dashboard'); return; }
      if (u.profileComplete) { router.replace('/dashboard'); return; }
    }
  }, [status, session, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/user/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_profile', phone, company }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setDone(true);
      await update({ profileComplete: true });
      setTimeout(() => router.push('/dashboard'), 1200);
    } else {
      setError(data.error ?? 'Something went wrong.');
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px 12px 44px', borderRadius: '10px',
    border: '1.5px solid var(--border-color)', background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)', fontSize: '15px', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.15s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '40px 32px' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Building2 size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>One last step</h1>
          <p style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
            Help us reach you about your projects. This takes 10 seconds.
          </p>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={48} color="#4ade80" style={{ marginBottom: '12px' }} />
            <p style={{ color: '#4ade80', fontSize: '16px', fontWeight: 600 }}>Profile complete! Taking you to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Phone */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary, #9ca3af)', display: 'block', marginBottom: '8px' }}>
                Phone number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  required
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border-color)')}
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary, #9ca3af)', margin: '5px 0 0' }}>
                Include country code (e.g. +92 for Pakistan)
              </p>
            </div>

            {/* Company */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary, #9ca3af)', display: 'block', marginBottom: '8px' }}>
                Company / Organization <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Building2 size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Acme Corp, Freelancer, etc."
                  required
                  maxLength={100}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border-color)')}
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary, #9ca3af)', margin: '5px 0 0' }}>
                If you&apos;re an individual, write &ldquo;Freelancer&rdquo; or your name
              </p>
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: '#ef4444', margin: 0, padding: '10px 14px', background: 'rgba(239,68,68,0.06)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.15)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !phone.trim() || !company.trim()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 24px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: loading || !phone.trim() || !company.trim() ? 'not-allowed' : 'pointer', opacity: loading || !phone.trim() || !company.trim() ? 0.6 : 1, transition: 'opacity 0.2s' }}
            >
              {loading ? 'Saving…' : <><span>Continue to Dashboard</span> <ArrowRight size={16} /></>}
            </button>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary, #9ca3af)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
              Your contact details are only visible to the HydraBytes team and are never shared publicly.{' '}
              <Link href="/legal/privacy" style={{ color: '#6366f1', textDecoration: 'none' }}>Privacy Policy</Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
