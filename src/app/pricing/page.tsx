'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';
import SpotlightCard from '@/components/SpotlightCard';
import MagneticButton from '@/components/MagneticButton';
import FloatingParticles from '@/components/FloatingParticles';
import styles from './pricing.module.css';

const plans = [
  {
    name: 'Starter',
    price: '$2,999',
    period: 'per project',
    desc: 'Perfect for small businesses and MVPs that need a professional online presence.',
    features: [
      'Up to 5 pages',
      'Responsive design',
      'Basic SEO setup',
      'Contact form',
      '2 revision rounds',
      '30-day support',
    ],
    highlighted: false,
    cta: 'Get Started',
  },
  {
    name: 'Professional',
    price: '$7,999',
    period: 'per project',
    desc: 'Full-featured solution for growing companies that need a competitive edge.',
    features: [
      'Up to 15 pages',
      'Custom animations',
      'Advanced SEO & analytics',
      'CMS integration',
      'API integrations',
      '5 revision rounds',
      '90-day support',
      'Performance optimization',
    ],
    highlighted: true,
    cta: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'tailored to you',
    desc: 'Bespoke solutions for large-scale projects with complex requirements.',
    features: [
      'Unlimited pages',
      'Custom architecture',
      'AI/ML integration',
      'Dedicated team',
      'Priority support',
      'SLA guarantee',
      'Security audit',
      'Ongoing maintenance',
    ],
    highlighted: false,
    cta: 'Contact Sales',
  },
];

const faqs = [
  { q: 'How long does a typical project take?', a: 'Timelines vary by scope, but most projects range from 4-12 weeks. We provide detailed timelines during the discovery phase.' },
  { q: 'Do you offer ongoing maintenance?', a: 'Yes! All plans include post-launch support, and we offer monthly maintenance packages for ongoing updates and optimization.' },
  { q: 'Can I upgrade my plan later?', a: 'Absolutely. Our solutions are built to scale. You can always upgrade or add features as your business grows.' },
  { q: 'What technologies do you use?', a: 'We use modern tech stacks including React, Next.js, Node.js, Python, React Native, and cloud services like AWS and GCP.' },
];

export default function PricingPage() {
  return (
    <>
      <section className={styles.hero} style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingParticles />
        <div className="container">
          <AnimatedSection>
            <span className="section-label">Pricing</span>
            <h1 className={styles.heroTitle}>
              Simple, Transparent <span className="gradient-text">Pricing</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Choose the plan that fits your needs. No hidden fees, no surprises.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.pricingGrid}>
            {plans.map((plan, i) => (
              <AnimatedSection key={plan.name} delay={i * 0.12}>
                <SpotlightCard spotlightColor={plan.highlighted ? 'rgba(124, 58, 237, 0.2)' : undefined}>
                  <div
                    className={`${styles.pricingCard} ${plan.highlighted ? styles.highlighted : ''}`}
                  >
                    {plan.highlighted && <span className={styles.badge}>Most Popular</span>}
                    <h3 className={styles.planName}>{plan.name}</h3>
                    <div className={styles.planPrice}>
                      <span className={styles.price}>{plan.price}</span>
                      <span className={styles.period}>{plan.period}</span>
                    </div>
                    <p className={styles.planDesc}>{plan.desc}</p>
                    <ul className={styles.featureList}>
                      {plan.features.map((f) => (
                        <li key={f}>
                          <span className={styles.check}>✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    {plan.highlighted ? (
                      <MagneticButton>
                        <Link
                          href="/contact"
                          className="btn btn-primary"
                          style={{ width: '100%' }}
                        >
                          {plan.cta}
                        </Link>
                      </MagneticButton>
                    ) : (
                      <Link
                        href="/contact"
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                      >
                        {plan.cta}
                      </Link>
                    )}
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
              <h2 className="section-title">Frequently Asked Questions</h2>
            </div>
          </AnimatedSection>
          <div className={styles.faqList}>
            {faqs.map((faq, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <SpotlightCard>
                  <div className={styles.faqItem}>
                    <h4 className={styles.faqQ}>{faq.q}</h4>
                    <p className={styles.faqA}>{faq.a}</p>
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
            <h2 className="section-title">Need a Custom Solution?</h2>
            <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
              Let&apos;s create a tailored package that perfectly fits your requirements.
            </p>
            <MagneticButton>
              <Link href="/contact" className="btn btn-primary">
                Contact Our Team <span>→</span>
              </Link>
            </MagneticButton>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
