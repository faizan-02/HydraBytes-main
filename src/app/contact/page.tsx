'use client';

import { useState } from 'react';
import AnimatedSection from '@/components/AnimatedSection';
import SpotlightCard from '@/components/SpotlightCard';
import MagneticButton from '@/components/MagneticButton';
import FloatingParticles from '@/components/FloatingParticles';
import styles from './contact.module.css';

const contactInfo = [
  { icon: '📧', label: 'Email', value: 'hydrabytes4@gmail.com', href: 'mailto:hydrabytes4@gmail.com' },
  { icon: '📱', label: 'Phone', value: '+92 323 9999 000', href: 'tel:+923239999000' },
  { icon: '📍', label: 'Office', value: 'Islamabad, Main Pwd Rd, Pakistan', href: '#' },
  { icon: '⏰', label: 'Hours', value: 'Mon-Sat, 8AM-8PM PST', href: '#' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    budget: '',
    message: '',
  });

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
                        <span className={styles.infoIcon}>{item.icon}</span>
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
                    <a href="https://www.facebook.com/people/Hydra-Bytes/61576555270817/" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                    </a>
                    <a href="https://github.com/HydraBytes-tech" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                    </a>
                    <a href="https://www.linkedin.com/company/hydrabytes4/" className={styles.socialLink} target="_blank" rel="noopener noreferrer">in</a>
                    <a href="https://www.instagram.com/thehydrabytes/" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
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
              </SpotlightCard>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
