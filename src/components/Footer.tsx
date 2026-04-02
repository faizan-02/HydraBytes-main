'use client';

import { useState } from 'react';
import Link from 'next/link';

import styles from './Footer.module.css';

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const footerLinks = {
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/blog', label: 'Blog' },
    { href: '/pricing', label: 'Pricing' },
  ],
  services: [
    { href: '/services', label: 'Web Development' },
    { href: '/services', label: 'App Development' },
    { href: '/services', label: 'AI & ML Solutions' },
    { href: '/services', label: 'UI/UX Design' },
  ],
  support: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/contact', label: 'Get a Quote' },
    { href: '/blog', label: 'Resources' },
    { href: '/contact', label: 'Support' },
  ],
};

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');
  const [newsletterError, setNewsletterError] = useState('');

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNewsletterStatus('loading');
    setNewsletterError('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      if (res.ok) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
      } else if (res.status === 409) {
        setNewsletterStatus('duplicate');
        setNewsletterError('This email is already subscribed.');
      } else {
        setNewsletterStatus('error');
        setNewsletterError('Invalid email address. Please try again.');
      }
    } catch {
      setNewsletterStatus('error');
      setNewsletterError('Something went wrong. Please try again.');
    }
  }

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.logo}>
              <div style={{ width: '158px', height: '75px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/transparent.png" alt="HydraBytes" style={{ position: 'absolute', width: '198px', top: '-48px', left: '-19px' }} />
              </div>
            </Link>
            <p className={styles.brandDesc}>
              Transforming ideas into powerful digital experiences through innovative
              web development, mobile apps, and AI-driven solutions.
            </p>
            <div className={styles.socials}>
              <a href="https://github.com/HydraBytes-tech" aria-label="GitHub" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                <GithubIcon />
              </a>
              <a href="https://www.linkedin.com/company/hydrabytes4/" aria-label="LinkedIn" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                <LinkedinIcon />
              </a>
            </div>
          </div>

          <div className={styles.footerLinksGroup}>
            <div className={styles.footerCol}>
              <h4 className={styles.colTitle}>Company</h4>
              {footerLinks.company.map((link, i) => (
                <Link key={i} href={link.href} className={styles.footerLink}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className={styles.footerCol}>
              <h4 className={styles.colTitle}>Services</h4>
              {footerLinks.services.map((link, i) => (
                <Link key={i} href={link.href} className={styles.footerLink}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className={styles.footerCol}>
              <h4 className={styles.colTitle}>Support</h4>
              {footerLinks.support.map((link, i) => (
                <Link key={i} href={link.href} className={styles.footerLink}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div style={{
          borderTop: '1px solid rgba(124, 58, 237, 0.15)',
          borderBottom: '1px solid rgba(124, 58, 237, 0.15)',
          padding: '32px 0',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div>
            <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Stay in the loop
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '360px' }}>
              Get the latest news on web development, AI solutions, and HydraBytes updates.
            </p>
          </div>

          {newsletterStatus === 'success' ? (
            <div style={{
              padding: '12px 20px',
              background: 'rgba(74, 222, 128, 0.08)',
              border: '1px solid rgba(74, 222, 128, 0.2)',
              borderRadius: '10px',
              color: '#4ade80',
              fontSize: '14px',
              fontWeight: 500,
            }}>
              ✓ Thanks for subscribing! Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                required
                disabled={newsletterStatus === 'loading'}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid rgba(124, 58, 237, 0.35)',
                  background: 'rgba(26, 26, 46, 0.6)',
                  color: 'var(--text-primary, #f0f0f5)',
                  fontSize: '14px',
                  outline: 'none',
                  minWidth: '240px',
                }}
              />
              <button
                type="submit"
                disabled={newsletterStatus === 'loading'}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: newsletterStatus === 'loading' ? 'not-allowed' : 'pointer',
                  opacity: newsletterStatus === 'loading' ? 0.7 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
              {(newsletterStatus === 'error' || newsletterStatus === 'duplicate') && (
                <p style={{ width: '100%', margin: '4px 0 0', fontSize: '13px', color: '#ef4444' }}>
                  {newsletterError}
                </p>
              )}
            </form>
          )}
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} HydraBytes. All rights reserved.</p>
          <div className={styles.footerBottomLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
      <div className={styles.watermark}>HYDRABYTES</div>
    </footer>
  );
}
