'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, Smartphone, Brain, Check, ArrowRight } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import SpotlightCard from '@/components/SpotlightCard';
import MagneticButton from '@/components/MagneticButton';
import styles from './services.module.css';

const services = [
  {
    id: 'web',
    icon: Globe,
    color: '#7c3aed',
    title: 'Web Development',
    subtitle: 'Custom websites that convert visitors into customers',
    desc: 'We build blazing-fast, SEO-optimized websites and web applications using the latest technologies. From marketing pages to complex SaaS platforms, we deliver solutions that drive real business results.',
    features: [
      'Next.js / React Applications',
      'Progressive Web Apps (PWA)',
      'E-Commerce Solutions',
      'CMS Integration',
      'API Development & Integration',
      'Performance Optimization',
    ],
    tech: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
  },
  {
    id: 'app',
    icon: Smartphone,
    color: '#00e5ff',
    title: 'App Development',
    subtitle: 'Mobile experiences that users love',
    desc: 'We create native and cross-platform mobile applications that deliver seamless, intuitive experiences. Our apps are built for performance, scalability, and user engagement.',
    features: [
      'iOS & Android Development',
      'Cross-Platform (React Native)',
      'UI/UX Design & Prototyping',
      'App Store Optimization',
      'Push Notifications & Analytics',
      'Backend & API Integration',
    ],
    tech: ['React Native', 'Swift', 'Kotlin', 'Firebase', 'GraphQL', 'Redis'],
  },
  {
    id: 'ai',
    icon: Brain,
    color: '#f472b6',
    title: 'AI & ML Solutions',
    subtitle: 'Intelligent systems that learn and adapt',
    desc: 'Harness the power of artificial intelligence and machine learning to automate processes, gain insights from data, and create intelligent products that evolve with your business.',
    features: [
      'Custom ML Model Development',
      'Natural Language Processing',
      'Computer Vision Solutions',
      'Predictive Analytics',
      'Chatbot & Virtual Assistants',
      'Data Pipeline Engineering',
    ],
    tech: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI', 'LangChain', 'Docker'],
  },
];

const process = [
  { step: '01', title: 'Discovery', desc: 'Deep-dive into your goals, audience, and technical requirements.' },
  { step: '02', title: 'Strategy', desc: 'Create a tailored roadmap with clear milestones and deliverables.' },
  { step: '03', title: 'Build', desc: 'Agile development with weekly demos and continuous feedback loops.' },
  { step: '04', title: 'Launch', desc: 'Rigorous testing, deployment, and post-launch optimization.' },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <AnimatedSection>
            <span className="section-label">Our Services</span>
            <h1 className={styles.heroTitle}>
              Solutions Engineered for <span className="gradient-text">Impact</span>
            </h1>
            <p className={styles.heroSubtitle}>
              From concept to deployment, we provide end-to-end digital services
              that help businesses innovate, scale, and succeed.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Services Detail */}
      {services.map((service, i) => (
        <section
          key={service.id}
          className={`section ${i % 2 === 0 ? '' : styles.altBg}`}
          id={service.id}
        >
          <div className="container">
            <div className={styles.serviceBlock}>
              <AnimatedSection direction={i % 2 === 0 ? 'left' : 'right'}>
                <div className={styles.serviceInfo}>
                  <div
                    className={styles.serviceIconLarge}
                    style={{ color: service.color, background: `${service.color}15` }}
                  >
                    <service.icon size={36} strokeWidth={1.5} />
                  </div>
                  <h2 className={styles.serviceTitle}>{service.title}</h2>
                  <p className={styles.serviceSubtitle}>{service.subtitle}</p>
                  <p className={styles.serviceDesc}>{service.desc}</p>
                  <MagneticButton>
                    <Link href="/contact" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                      Get a Quote <ArrowRight size={18} />
                    </Link>
                  </MagneticButton>
                </div>
              </AnimatedSection>

              <AnimatedSection direction={i % 2 === 0 ? 'right' : 'left'} delay={0.15}>
                <div className={styles.serviceDetails}>
                  <SpotlightCard spotlightColor={`${service.color}20`} className={styles.featuresCard}>
                    <div className={styles.featuresCardInner}>
                      <h4>Key Features</h4>
                      <ul className={styles.featureList}>
                        {service.features.map((f) => (
                          <li key={f}>
                            <span className={styles.featureCheck} style={{ color: service.color }}>
                              <Check size={16} strokeWidth={2.5} />
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </SpotlightCard>
                  <div className={styles.techStack}>
                    <h4>Tech Stack</h4>
                    <div className={styles.techTags}>
                      {service.tech.map((t) => (
                        <span key={t} className={styles.techTag}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      ))}

      {/* Process */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">Our Process</span>
              <h2 className="section-title">How We Work</h2>
              <p className="section-subtitle">
                A structured, transparent approach that ensures quality delivery every time.
              </p>
            </div>
          </AnimatedSection>

          <div className={styles.processGrid}>
            {process.map((p, i) => (
              <AnimatedSection key={p.step} delay={i * 0.1}>
                <SpotlightCard>
                  <motion.div
                    className={styles.processCard}
                    whileHover={{ y: -4 }}
                  >
                    <span className={styles.processStep}>{p.step}</span>
                    <h3 className={styles.processTitle}>{p.title}</h3>
                    <p className={styles.processDesc}>{p.desc}</p>
                  </motion.div>
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
            <h2 className="section-title">Have a Project in Mind?</h2>
            <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
              Let&apos;s discuss how we can bring your vision to life.
            </p>
            <MagneticButton>
              <Link href="/contact" className="btn btn-primary">
                Book a Free Consultation <ArrowRight size={18} />
              </Link>
            </MagneticButton>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
