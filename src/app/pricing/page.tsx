'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Globe, Smartphone, Brain, ChevronDown, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';
import MagneticButton from '@/components/MagneticButton';
import FloatingParticles from '@/components/FloatingParticles';
import styles from './pricing.module.css';

type CategoryId = 'web' | 'app' | 'ai';

const categories: { id: CategoryId; label: string; icon: typeof Globe }[] = [
  { id: 'web', label: 'Web Development', icon: Globe },
  { id: 'app', label: 'App Development', icon: Smartphone },
  { id: 'ai', label: 'AI Solutions', icon: Brain },
];

interface Plan {
  name: string;
  price: string;
  popular: boolean;
  desc: string;
  delivery?: string;
  features: string[];
  cta: string;
  serviceParam: string;
}

const plans: Record<CategoryId, Plan[]> = {
  web: [
    {
      name: 'Starter Website',
      price: '$399',
      popular: false,
      desc: 'Perfect for portfolios, freelancers, and small businesses that need a professional online presence fast.',
      delivery: '5–7 days',
      features: [
        '1–3 pages',
        'Responsive design',
        'Basic SEO setup',
        'Contact form',
        'Mobile optimized',
        '14-day post-launch support',
      ],
      cta: 'Get Started',
      serviceParam: 'starter-website',
    },
    {
      name: 'Business Website',
      price: '$999',
      popular: true,
      delivery: '2–4 weeks',
      desc: 'The complete package for growing businesses with custom UI/UX, CMS, and performance built in.',
      features: [
        '5–8 pages',
        'Custom UI/UX design',
        'CMS integration',
        'Performance optimization',
        'Advanced SEO & analytics',
        '3 rounds of revisions',
        '30-day support',
      ],
      cta: 'Get Started',
      serviceParam: 'business-website',
    },
    {
      name: 'Premium Web App',
      price: '$2,500+',
      popular: false,
      delivery: '4–10 weeks',
      desc: 'Full-stack web applications with authentication, dashboards, APIs, and scalable architecture.',
      features: [
        'Full-stack application',
        'Authentication system',
        'Custom dashboard & APIs',
        'Database architecture',
        'Cloud deployment',
        'Security audit',
        '60-day support',
      ],
      cta: 'Book Free Call',
      serviceParam: 'premium-web-app',
    },
  ],
  app: [
    {
      name: 'MVP App',
      price: '$2,000',
      popular: false,
      desc: 'Validate your idea with a lean cross-platform app, built to ship in weeks.',
      delivery: '4–8 weeks',
      features: [
        'iOS & Android (React Native)',
        'Core feature set',
        'Basic UI/UX design',
        'API integration',
        'App store submission',
        '30-day support',
      ],
      cta: 'Get Started',
      serviceParam: 'mvp-app',
    },
    {
      name: 'Growth App',
      price: '$5,000',
      popular: true,
      desc: 'A full-featured product with backend, push notifications, and analytics, built for real users.',
      delivery: '8–14 weeks',
      features: [
        'iOS & Android',
        'Full custom UI/UX',
        'Backend API & database',
        'Push notifications',
        'Analytics dashboard',
        'App store optimization',
        '60-day support',
      ],
      cta: 'Get Started',
      serviceParam: 'growth-app',
    },
    {
      name: 'Scale Product',
      price: '$10,000+',
      popular: false,
      delivery: '14+ weeks',
      desc: 'Enterprise-grade mobile product with dedicated team, custom architecture, and SLA guarantees.',
      features: [
        'Custom architecture',
        'Dedicated dev team',
        'Advanced security',
        'Real-time features',
        'CI/CD pipeline',
        'SLA guarantee',
        'Priority support',
      ],
      cta: 'Book Free Call',
      serviceParam: 'scale-product',
    },
  ],
  ai: [
    {
      name: 'AI Chatbot',
      price: '$300 – $800',
      popular: false,
      desc: 'A custom AI assistant trained on your business data, embedded on your website in under 2 weeks.',
      delivery: '1–2 weeks',
      features: [
        'GPT-4 powered',
        'Custom knowledge base',
        'Website embed widget',
        'Conversation history',
        'Basic analytics',
        '14-day support',
      ],
      cta: 'Get Started',
      serviceParam: 'ai-chatbot',
    },
    {
      name: 'AI Automation',
      price: '$1,000 – $3,000',
      popular: true,
      desc: 'Automate repetitive workflows, data extraction, and business processes using AI pipelines.',
      delivery: '2–4 weeks',
      features: [
        'Workflow automation',
        'API & tool integrations',
        'Document processing',
        'Email & CRM automation',
        'Custom triggers & actions',
        'Reporting dashboard',
        '30-day support',
      ],
      cta: 'Get Started',
      serviceParam: 'ai-automation',
    },
    {
      name: 'Custom AI System',
      price: '$5,000+',
      popular: false,
      delivery: '6–12 weeks',
      desc: 'Purpose-built AI with custom model training, data pipelines, deployment, and monitoring.',
      features: [
        'Custom ML model training',
        'Data pipeline engineering',
        'Model deployment & hosting',
        'Performance monitoring',
        'Retraining workflows',
        'Full documentation',
        '60-day support',
      ],
      cta: 'Book Free Call',
      serviceParam: 'custom-ai-system',
    },
  ],
};

const trust = [
  'Free consultation on every project',
  'No hidden fees, fixed price quotes',
  'Custom quotes for complex projects',
  'Full source code ownership',
];

const faqs = [
  {
    q: 'Do you charge hourly or fixed price?',
    a: "We prefer fixed-price projects. You know exactly what you're paying before we start. For ongoing work or maintenance, we offer flexible hourly or retainer arrangements.",
  },
  {
    q: 'What if my budget is below the listed price?',
    a: "Talk to us anyway. We can often scope a smaller MVP within a tighter budget, or suggest a phased approach: build the core first, expand later.",
  },
  {
    q: 'How long does a typical project take?',
    a: "A Starter Website ships in 5–7 days. Business sites take 2–4 weeks. Apps run 4–14 weeks depending on complexity. AI integrations can go live in as little as 1 week.",
  },
  {
    q: 'Who owns the code after delivery?',
    a: "You do. Full source code is handed over on final payment. No lock-in, no licensing. It's your product.",
  },
  {
    q: 'Do you offer ongoing maintenance?',
    a: "Yes. All plans include a free support window post-launch. After that, we offer monthly maintenance packages for updates, security patches, and new features.",
  },
];

export default function PricingPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('web');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const activePlans = plans[activeCategory];

  return (
    <>
      {/* Hero */}
      <section className={styles.hero} style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingParticles />
        <div className="container">
          <AnimatedSection>
            <span className="section-label">Pricing</span>
            <h1 className={styles.heroTitle}>
              Simple, Transparent <span className="gradient-text">Pricing</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Choose the perfect plan for your business. Every project includes a free consultation with no commitment required.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Plans */}
      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">

          {/* Category Tabs */}
          <AnimatedSection>
            <div className={styles.tabs}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.tab} ${activeCategory === cat.id ? styles.tabActive : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <cat.icon size={15} strokeWidth={1.8} />
                  {cat.label}
                </button>
              ))}
            </div>
          </AnimatedSection>

          {/* Plan Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              className={styles.plansGrid}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22 }}
            >
              {activePlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`${styles.planCard} ${plan.popular ? styles.popularCard : ''}`}
                >
                  {plan.popular && <span className={styles.popularBadge}>Most Popular</span>}

                  <div className={styles.planHeader}>
                    <h3 className={styles.planName}>{plan.name}</h3>
                    {plan.delivery && (
                      <span className={styles.deliveryTag}>
                        <Clock size={11} strokeWidth={2} />
                        {plan.delivery}
                      </span>
                    )}
                  </div>

                  <div className={styles.planPrice}>{plan.price}</div>
                  <p className={styles.planDesc}>{plan.desc}</p>

                  <div className={styles.divider} />

                  <ul className={styles.featureList}>
                    {plan.features.map((f) => (
                      <li key={f} className={styles.featureItem}>
                        <span className={`${styles.checkCircle} ${plan.popular ? styles.checkPopular : ''}`}>
                          <Check size={11} strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className={styles.ctaGroup}>
                    <MagneticButton>
                      <Link
                        href={`/contact?service=${plan.serviceParam}`}
                        className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {plan.cta} <ArrowRight size={15} />
                      </Link>
                    </MagneticButton>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Trust Bar */}
          <AnimatedSection>
            <div className={styles.trustBar}>
              {trust.map((item) => (
                <div key={item} className={styles.trustItem}>
                  <span className={styles.trustCheck}>
                    <Check size={11} strokeWidth={3} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <p className={styles.note}>
              All prices in USD. Final pricing is scoped per project requirements.{' '}
              <Link href="/contact" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                Contact us
              </Link>{' '}
              for a custom quote.
            </p>
          </AnimatedSection>
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
              <AnimatedSection key={i} delay={i * 0.06}>
                <div
                  className={styles.faqItem}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <button
                    className={styles.faqQ}
                    aria-expanded={openFaq === i}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', textAlign: 'left' }}
                  >
                    {faq.q}
                    <motion.span
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'inline-flex', marginLeft: '12px', flexShrink: 0, opacity: 0.55 }}
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
                        transition={{ duration: 0.22 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p className={styles.faqA} style={{ marginTop: '0.75rem' }}>{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <AnimatedSection>
            <h2 className="section-title">Not Sure Which Plan Fits?</h2>
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
