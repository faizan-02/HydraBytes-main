'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import SpotlightCard from '@/components/SpotlightCard';
import MagneticButton from '@/components/MagneticButton';
import FloatingParticles from '@/components/FloatingParticles';
import styles from './contact.module.css';

const contactInfo = [
  { icon: <Mail size={20} strokeWidth={1.5} />, label: 'Email', value: 'hydrabytes4@gmail.com', href: 'mailto:hydrabytes4@gmail.com' },
  { icon: <Phone size={20} strokeWidth={1.5} />, label: 'Phone', value: '+92 323 9999 000', href: 'tel:+923239999000' },
  { icon: <MapPin size={20} strokeWidth={1.5} />, label: 'Office', value: 'Islamabad, Main Pwd Rd, Pakistan', href: '#' },
  { icon: <Clock size={20} strokeWidth={1.5} />, label: 'Hours', value: 'Mon-Sat, 8AM-8PM PST', href: '#' },
];

export default function ContactPage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    name: session?.user?.name ?? '',
    email: session?.user?.email ?? '',
    service: '',
    budget: '',
    message: '',
  });

  // Pre-fill name/email once session loads
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || session.user?.name || '',
        email: prev.email || session.user?.email || '',
      }));
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setIsSubmitted(true);
      setFormData({ name: '', email: '', service: '', budget: '', message: '' });
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className={styles.hero} style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingParticles />
        <div className="container">
          <AnimatedSection>
            <span className="section-label">Contact Us</span>
            <h1 className={styles.heroTitle}>
              Let&apos;s Build Something <span className="gradient-text">Amazing</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Ready to start your project? Get in touch and we&apos;ll respond within 24 hours.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.contactGrid}>
            <AnimatedSection direction="left">
              <div className={styles.contactInfo}>
                <h2 className={styles.infoTitle}>Get in Touch</h2>
                <p className={styles.infoDesc}>
                  Whether you have a project idea, need a consultation, or want to explore
                  partnership opportunities, we&apos;d love to hear from you.
                </p>

                <div className={styles.infoCards}>
                  {contactInfo.map((item) => (
                    <SpotlightCard key={item.label}>
                      <a href={item.href} className={styles.infoCard}>
                        <span className={styles.infoIcon} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.12)', color: '#818cf8', flexShrink: 0 }}>{item.icon}</span>
                        <div>
                          <span className={styles.infoLabel}>{item.label}</span>
                          <span className={styles.infoValue}>{item.value}</span>
                        </div>
                      </a>
                    </SpotlightCard>
                  ))}
                </div>

                <div className={styles.socialSection}>
                  <h4>Follow Us</h4>
                  <div className={styles.socials}>
                    <a href="https://github.com/HydraBytes-tech" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                    </a>
                    <a href="https://www.linkedin.com/company/hydrabytes4/" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.15}>
              <SpotlightCard>
                {status !== 'loading' && !session ? (
                  <div className={styles.contactForm} style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                    <h3 className={styles.formTitle} style={{ marginBottom: '12px' }}>Sign In to Contact Us</h3>
                    <p style={{ color: '#94a3b8', marginBottom: '28px', lineHeight: '1.6', fontSize: '15px' }}>
                      You need an account to submit a project inquiry. This lets us track your project and keep you updated.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Link href={`/auth/signin?callbackUrl=/contact`} className="btn btn-primary" style={{ padding: '12px 28px', textDecoration: 'none' }}>
                        Sign In
                      </Link>
                      <Link href="/auth/register" className="btn btn-secondary" style={{ padding: '12px 28px', textDecoration: 'none' }}>
                        Create Account
                      </Link>
                    </div>
                  </div>
                ) : (
                <form className={styles.contactForm} onSubmit={handleSubmit}>
                <h3 className={styles.formTitle}>Send Us a Message</h3>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="service">Service Interested In</label>
                    <select id="service" name="service" value={formData.service} onChange={handleChange} required>
                      <option value="">Select a service</option>
                      <option value="web">Web Development</option>
                      <option value="app">App Development</option>
                      <option value="ai">AI & ML Solutions</option>
                      <option value="design">UI/UX Design</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="budget">Budget Range</label>
                    <select id="budget" name="budget" value={formData.budget} onChange={handleChange}>
                      <option value="">Select budget</option>
                      <option value="5k-10k">$5,000 - $10,000</option>
                      <option value="10k-25k">$10,000 - $25,000</option>
                      <option value="25k-50k">$25,000 - $50,000</option>
                      <option value="50k+">$50,000+</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Project Details</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your project, goals, and timeline..."
                    rows={5}
                    required
                  />
                </div>

                {isSubmitted && (
                  <p style={{ color: '#22c55e', marginBottom: '12px', fontSize: '14px' }}>
                    ✓ Message sent! We&apos;ll get back to you within 24 hours.
                  </p>
                )}
                {error && (
                  <p style={{ color: '#ef4444', marginBottom: '12px', fontSize: '14px' }}>
                    {error}
                  </p>
                )}
                <MagneticButton>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : <>Send Message <span>→</span></>}
                  </button>
                </MagneticButton>
              </form>
                )}
              </SpotlightCard>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
