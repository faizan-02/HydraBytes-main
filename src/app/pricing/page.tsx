'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Globe, Smartphone, Brain, Check, ArrowRight, ChevronDown, MessageSquare, FileText, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';
import SpotlightCard from '@/components/SpotlightCard';
import MagneticButton from '@/components/MagneticButton';
import FloatingParticles from '@/components/FloatingParticles';
import styles from './pricing.module.css';

const services = [
  {
    icon: Globe,
    color: '#7c3aed',
    title: 'Web Development',
    subtitle: 'Websites & Web Applications',
    startingFrom: '$800',
    range: '$800 – $8,000+',
    timeline: '2 – 8 weeks',
    note: 'Price depends on complexity, number of pages, and custom functionality required.',
    features: [
      'Custom design & development',
      'Mobile-responsive layout',
      'SEO-ready structure',
      'CMS or admin panel (if needed)',
      'Performance optimized',
      '3 rounds of revisions',
      '30-day post-launch support',
    ],
  },
  {
    icon: Smartphone,
    color: '#00e5ff',
    title: 'App Development',
    subtitle: 'iOS, Android & Cross-Platform',
    startingFrom: '$3,000',
    range: '$3,000 – $15,000+',
    timeline: '6 – 16 weeks',
    note: 'Scope, platforms (iOS/Android/both), and backend complexity are the main cost drivers.',
    features: [
      'UI/UX design & prototyping',
      'iOS & Android support',
      'Backend API development',
      'Push notifications',
      'App store submission',
      'Testing & QA',
      '60-day post-launch support',
    ],
  },
  {
    icon: Brain,
    color: '#f472b6',
    title: 'AI & ML Solutions',
    subtitle: 'Custom Models & Integrations',
    startingFrom: '$2,000',
    range: '$2,000 – Custom',
    timeline: '4 – 12 weeks',
    note: 'Simple AI integrations (e.g. ChatGPT API) start lower. Custom model training is scoped per project.',
    features: [
      'Requirement analysis & scoping',
      'Model selection or custom training',
      'API development & integration',
      'Data pipeline setup',
      'Testing & validation',
      'Deployment & documentation',
      '30-day post-launch support',
    ],
  },
];

const included = [
  { icon: '📋', label: 'Free discovery call before any commitment' },
  { icon: '💬', label: 'Dedicated communication channel (WhatsApp / Slack)' },
  { icon: '🔒', label: 'NDA available on request' },
  { icon: '📦', label: 'Full source code ownership — yours after delivery' },
  { icon: '📊', label: 'Progress updates every week' },
  { icon: '🛠', label: 'Bug fixes covered for 30–60 days post-launch' },
];

const howItWorks = [
  {
    icon: MessageSquare,
    step: '01',
    title: 'Free Discovery Call',
    desc: 'Tell us about your project. We\'ll ask the right questions to understand your goals, timeline, and budget — no obligation.',
  },
  {
    icon: FileText,
    step: '02',
    title: 'Custom Proposal',
    desc: 'Within 48 hours we send a detailed proposal: scope, deliverables, timeline, and a fixed price. No surprises.',
  },
  {
    icon: Rocket,
    step: '03',
    title: 'We Build & Deliver',
    desc: 'Once you approve, we start. Weekly updates, regular demos, and clear milestones until your product ships.',
  },
];

const faqs = [
  {
    q: 'Do you charge hourly or fixed price?',
    a: 'We prefer fixed-price projects — you know exactly what you\'re paying before we start. For ongoing work or maintenance, we offer flexible hourly or retainer arrangements.',
  },
  {
    q: 'How long does a typical project take?',
    a: 'A basic website takes 2–4 weeks. A full web app or mobile app typically runs 6–12 weeks. AI integrations vary from 2 weeks (API-based) to 3+ months (custom model training). We give you a firm timeline in the proposal.',
  },
  {
    q: 'What if my budget is below your starting price?',
    a: 'Talk to us anyway. We can often scope a smaller MVP within a tighter budget, or suggest a phased approach — build the core first, expand later.',
  },
  {
    q: 'Do you offer maintenance after launch?',
    a: 'Yes. All projects include a free support window (30–60 days). After that, we offer monthly maintenance packages for updates, security patches, and new features.',
  },
  {
    q: 'Who owns the code when the project is done?',
    a: 'You do. Full source code is handed over on final payment. No lock-in, no licensing — it\'s your product.',
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <section className={styles.hero} style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingParticles />
        <div className="container">
          <AnimatedSection>
            <span className="section-label">Pricing</span>
            <h1 className={styles.heroTitle}>
              Project-Based Pricing,<br /><span className="gradient-text">No Subscriptions</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Every project gets a custom quote. The ranges below give you a realistic starting point — book a free call and we&apos;ll scope yours exactly.
            </p>
            <MagneticButton>
              <Link href="/contact" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                Get a Free Quote <ArrowRight size={18} />
              </Link>
            </MagneticButton>
          </AnimatedSection>
        </div>
      </section>

      {/* Service Pricing */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.pricingGrid}>
            {services.map((service, i) => (
              <AnimatedSection key={service.title} delay={i * 0.1}>
                <SpotlightCard spotlightColor={`${service.color}20`}>
                  <div className={styles.pricingCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', background: `${service.color}18`, color: service.color, flexShrink: 0 }}>
                        <service.icon size={24} strokeWidth={1.6} />
                      </div>
                      <div>
                        <h3 className={styles.planName}>{service.title}</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', margin: 0 }}>{service.subtitle}</p>
                      </div>
                    </div>

                    <div style={{ marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Starting from</span>
                    </div>
                    <div className={styles.planPrice} style={{ marginBottom: '0.5rem' }}>
                      <span className={styles.price}>{service.startingFrom}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Range: <strong style={{ color: 'var(--text-primary)' }}>{service.range}</strong></span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Timeline: <strong style={{ color: 'var(--text-primary)' }}>{service.timeline}</strong></span>
                    </div>

                    <p style={{ fontSize: '0.83rem', color: 'var(--text-tertiary)', lineHeight: '1.6', marginBottom: '1.25rem', padding: '10px 12px', background: `${service.color}0d`, borderRadius: '8px', borderLeft: `3px solid ${service.color}40` }}>
                      {service.note}
                    </p>

                    <ul className={styles.featureList}>
                      {service.features.map((f) => (
                        <li key={f}>
                          <Check size={14} strokeWidth={2.5} style={{ color: service.color, flexShrink: 0 }} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <MagneticButton>
                      <Link href={`/contact?service=${service.title === 'Web Development' ? 'web' : service.title === 'App Development' ? 'app' : 'ai'}`} className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }}>
                        Get a Quote
                      </Link>
                    </MagneticButton>
                  </div>
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* What's always included */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">Every Project</span>
              <h2 className="section-title">What&apos;s Always Included</h2>
              <p className="section-subtitle">Regardless of budget or scope, these come standard.</p>
            </div>
          </AnimatedSection>
          <div className={styles.includedGrid}>
            {included.map((item, i) => (
              <AnimatedSection key={item.label} delay={i * 0.07}>
                <SpotlightCard>
                  <div className={styles.includedItem}>
                    <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item.label}</span>
                  </div>
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">The Process</span>
              <h2 className="section-title">How It Works</h2>
            </div>
          </AnimatedSection>
          <div className={styles.howGrid}>
            {howItWorks.map((step, i) => (
              <AnimatedSection key={step.step} delay={i * 0.1}>
                <SpotlightCard>
                  <div className={styles.howCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                      <span className={styles.processStep}>{step.step}</span>
                      <step.icon size={20} strokeWidth={1.6} style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />
                    </div>
                    <h3 className={styles.processTitle}>{step.title}</h3>
                    <p className={styles.processDesc}>{step.desc}</p>
                  </div>
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">FAQ</span>
              <h2 className="section-title">Common Questions</h2>
            </div>
          </AnimatedSection>
          <div className={styles.faqList}>
            {faqs.map((faq, i) => (
              <AnimatedSection key={i} delay={i * 0.07}>
                <SpotlightCard>
                  <div className={styles.faqItem}>
                    <button
                      className={styles.faqQ}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      aria-expanded={openFaq === i}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', textAlign: 'left' }}
                    >
                      {faq.q}
                      <motion.span
                        animate={{ rotate: openFaq === i ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'inline-block', marginLeft: '12px', flexShrink: 0, opacity: 0.6 }}
                      >
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <p className={styles.faqA} style={{ marginTop: '0.75rem' }}>{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <AnimatedSection>
            <h2 className="section-title">Not Sure What You Need?</h2>
            <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
              Book a free 30-minute call. We&apos;ll scope your project and send a no-obligation quote within 48 hours.
            </p>
            <MagneticButton>
              <Link href="/contact" className="btn btn-primary">
                Book a Free Call <ArrowRight size={18} />
              </Link>
            </MagneticButton>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
