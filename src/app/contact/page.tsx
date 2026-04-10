'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import SpotlightCard from '@/components/SpotlightCard';
import MagneticButton from '@/components/MagneticButton';
import FloatingParticles from '@/components/FloatingParticles';
import styles from './contact.module.css';

const contactInfo = [
  { icon: <Mail size={20} strokeWidth={1.5} />, label: 'Email', value: 'hydrabytes4@gmail.com', href: 'mailto:hydrabytes4@gmail.com' },
  { icon: <Phone size={20} strokeWidth={1.5} />, label: 'Phone', value: '+92 323 9999 000', href: 'tel:+923239999000' },
  { icon: <MapPin size={20} strokeWidth={1.5} />, label: 'Office', value: 'Islamabad, Main Pwd Rd, Pakistan', href: 'https://maps.google.com/?q=Main+PWD+Road+Islamabad+Pakistan' },
  { icon: <Clock size={20} strokeWidth={1.5} />, label: 'Hours', value: 'Mon-Sat, 8AM-8PM PST', href: null },
];

function ContactForm() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: session?.user?.name ?? '',
    email: session?.user?.email ?? '',
    service: searchParams.get('service') ?? '',
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
  const [submittedEmail, setSubmittedEmail] = useState('');
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
      setSubmittedEmail(formData.email);
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
                      {item.href ? (
                        <a href={item.href} className={styles.infoCard} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                          <span className={styles.infoIcon} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.12)', color: '#818cf8', flexShrink: 0 }}>{item.icon}</span>
                          <div>
                            <span className={styles.infoLabel}>{item.label}</span>
                            <span className={styles.infoValue}>{item.value}</span>
                          </div>
                        </a>
                      ) : (
                        <div className={styles.infoCard}>
                          <span className={styles.infoIcon} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.12)', color: '#818cf8', flexShrink: 0 }}>{item.icon}</span>
                          <div>
                            <span className={styles.infoLabel}>{item.label}</span>
                            <span className={styles.infoValue}>{item.value}</span>
                          </div>
                        </div>
                      )}
                    </SpotlightCard>
                  ))}
                </div>

                <div className={styles.socialSection}>
                  <h4>Follow Us</h4>
                  <div className={styles.socials}>
                    <a href="https://github.com/TheHydraBytes" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
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
                      <option value="">Select a plan</option>
                      <optgroup label="── Web Development">
                        <option value="starter-website">Starter Website ($399)</option>
                        <option value="business-website">Business Website ($999)</option>
                        <option value="premium-web-app">Premium Web App ($2,500+)</option>
                      </optgroup>
                      <optgroup label="── App Development">
                        <option value="mvp-app">MVP App ($2,000)</option>
                        <option value="growth-app">Growth App ($5,000)</option>
                        <option value="scale-product">Scale Product ($10,000+)</option>
                      </optgroup>
                      <optgroup label="── AI Solutions">
                        <option value="ai-chatbot">AI Chatbot ($300-$800)</option>
                        <option value="ai-automation">AI Automation ($1,000-$3,000)</option>
                        <option value="custom-ai-system">Custom AI System ($5,000+)</option>
                      </optgroup>
                      <option value="other">Other / Not Sure</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="budget">Budget Range</label>
                    <select id="budget" name="budget" value={formData.budget} onChange={handleChange}>
                      <option value="">Select budget</option>
                      <option value="under-500">Under $500</option>
                      <option value="500-1000">$500 – $1,000</option>
                      <option value="1000-3000">$1,000 – $3,000</option>
                      <option value="3000-8000">$3,000 – $8,000</option>
                      <option value="8000-15000">$8,000 – $15,000</option>
                      <option value="15000+">$15,000+</option>
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
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ color: '#22c55e', marginBottom: '16px', fontSize: '14px' }}>
                      Message sent! We&apos;ll get back to you within 24 hours.
                    </p>
                    {!session ? (
                      <div style={{
                        background: 'rgba(15,23,42,0.8)',
                        border: '1px solid rgba(124,58,237,0.3)',
                        borderRadius: '12px',
                        padding: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: 'linear-gradient(90deg, #7c3aed, #00e5ff)',
                        }} />
                        <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>
                          Track Your Inquiry
                        </h4>
                        <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#94a3b8' }}>
                          Create a free account to:
                        </p>
                        <ul style={{ margin: '0 0 20px', paddingLeft: '20px', fontSize: '13px', color: '#a0a0b8', lineHeight: '1.8', listStyle: 'none' }}>
                          <li style={{ paddingLeft: '0' }}>&#x2022; See when your inquiry is accepted</li>
                          <li style={{ paddingLeft: '0' }}>&#x2022; Track project progress in real-time</li>
                          <li style={{ paddingLeft: '0' }}>&#x2022; Receive and pay invoices</li>
                          <li style={{ paddingLeft: '0' }}>&#x2022; Chat directly with your developer</li>
                        </ul>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <a
                            href={`/auth/register?email=${encodeURIComponent(submittedEmail)}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '10px 20px',
                              background: 'linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%)',
                              color: '#ffffff',
                              textDecoration: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: 600,
                            }}
                          >
                            Create Free Account <span>&rarr;</span>
                          </a>
                          <a
                            href="/auth/signin"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '10px 20px',
                              background: 'rgba(124,58,237,0.1)',
                              border: '1px solid rgba(124,58,237,0.3)',
                              color: '#818cf8',
                              textDecoration: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: 600,
                            }}
                          >
                            Sign In
                          </a>
                        </div>
                      </div>
                    ) : (
                      <a
                        href="/dashboard"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, #7c3aed 0%, #00e5ff 100%)',
                          color: '#ffffff',
                          textDecoration: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                        }}
                      >
                        View Dashboard <span>&rarr;</span>
                      </a>
                    )}
                  </div>
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
              </SpotlightCard>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ContactPage() {
  return (
    <Suspense>
      <ContactForm />
    </Suspense>
  );
}
