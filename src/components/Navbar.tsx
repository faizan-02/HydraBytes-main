'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/lib/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, LayoutDashboard, LogOut, ChevronDown, ShieldCheck, Settings } from 'lucide-react';
import styles from './Navbar.module.css';
import LogoNetworkAnimation from './LogoNetworkAnimation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const [cursorPos, setCursorPos] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleMenuKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
      hamburgerRef.current?.focus();
      return;
    }
    if (e.key !== 'Tab') return;
    const menu = mobileMenuRef.current;
    if (!menu) return;
    const focusable = menu.querySelectorAll<HTMLElement>('a, button');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleMenuKeyDown);
    }
    return () => document.removeEventListener('keydown', handleMenuKeyDown);
  }, [isOpen, handleMenuKeyDown]);

  useEffect(() => {
    const container = navLinksRef.current;
    if (!container) return;
    const activeLink = container.querySelector(`.${styles.active}`) as HTMLElement | null;
    if (activeLink) {
      setCursorPos({
        left: activeLink.offsetLeft,
        width: activeLink.getBoundingClientRect().width,
        opacity: 1,
      });
    } else {
      setCursorPos(prev => ({ ...prev, opacity: 0 }));
    }
  }, [pathname]);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo} onClick={handleLogoClick} style={{ position: 'relative' }}>
          <LogoNetworkAnimation />
          <div style={{ width: '180px', height: '86px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/transparent.png" alt="HydraBytes" width={226} height={196} style={{ position: 'absolute', width: '226px', top: '-55px', left: '-22px' }} />
          </div>
        </Link>

        <div
          className={styles.navLinks}
          ref={navLinksRef}
          onMouseLeave={() => {
            const activeLink = navLinksRef.current?.querySelector(`.${styles.active}`) as HTMLElement | null;
            if (activeLink) {
              setCursorPos({
                left: activeLink.offsetLeft,
                width: activeLink.getBoundingClientRect().width,
                opacity: 1,
              });
            } else {
              setCursorPos(prev => ({ ...prev, opacity: 0 }));
            }
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${
                pathname === link.href ? styles.active : ''
              }`}
              onMouseEnter={(e) => {
                const { width } = e.currentTarget.getBoundingClientRect();
                setCursorPos({
                  width,
                  opacity: 1,
                  left: e.currentTarget.offsetLeft,
                });
              }}
            >
              {link.label}
            </Link>
          ))}
          <motion.div
            animate={cursorPos}
            className={styles.navCursor}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        </div>

        <div className={styles.navActions}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <motion.span
              key={theme}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
            </motion.span>
          </button>

          {status === 'authenticated' ? (
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="User menu"
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '999px', padding: '6px 14px 6px 8px', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                  {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{session.user?.name?.split(' ')[0]}</span>
                <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: isDark ? '#1a1a2e' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, borderRadius: '12px', padding: '8px', minWidth: '180px', zIndex: 100, boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.1)' }}
                  >
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none', color: 'var(--text-primary)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link href="/dashboard/settings" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none', color: 'var(--text-primary)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <Settings size={15} /> Settings
                    </Link>
                    {(session.user as { role?: string })?.role === 'admin' && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none', color: '#818cf8' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <ShieldCheck size={15} /> Admin Panel
                      </Link>
                    )}
                    <button onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link href="/auth/signin" className={styles.signInBtn}>Sign In</Link>
              <Link href="/contact" className={`btn btn-primary ${styles.ctaBtn}`}>Get Started</Link>
            </>
          )}

          <button
            ref={hamburgerRef}
            className={`${styles.hamburger} ${isOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={mobileMenuRef}
            className={styles.mobileMenu}
            role="dialog"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={link.href}
                  className={`${styles.mobileLink} ${
                    pathname === link.href ? styles.active : ''
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <Link href="/contact" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Get Started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
