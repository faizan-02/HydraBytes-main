'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Globe, Smartphone, Brain, Check, ArrowRight } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import SpotlightCard from '@/components/SpotlightCard';
import MagneticButton from '@/components/MagneticButton';
import { IconCloud } from '@/components/ui/interactive-icon-cloud';
import {
  siTypescript, siJavascript, siReact, siNextdotjs, siNodedotjs, siExpress, siPython,
  siTensorflow, siPytorch, siFastapi, siFlask, siPostgresql, siMongodb, siSupabase,
  siFirebase, siPrisma, siDocker, siKubernetes, siVercel, siGooglecloud, siTailwindcss,
  siFigma, siGit, siGithub, siFlutter, siKotlin, siSwift, siLangchain, siRedis,
  siGraphql, siStripe, siOpencv, siScikitlearn,
} from 'simple-icons';
import { GlassIcon, type GlassIconColor } from '@/components/ui/GlassIcons';
import styles from './services.module.css';

const services: Array<{
  id: string;
  icon: typeof Globe;
  color: string;
  glassColor: GlassIconColor;
  image: string;
  title: string;
  subtitle: string;
  desc: string;
  features: string[];
  tech: string[];
}> = [
  {
    id: 'ai',
    icon: Brain,
    color: '#f472b6',
    glassColor: 'pink',
    image: '/services/service-ai.jpg',
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
  {
    id: 'web',
    icon: Globe,
    color: '#0891b2',
    glassColor: 'purple',
    image: '/services/service-web.jpg',
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
    glassColor: 'blue',
    image: '/services/service-app.jpg',
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
];

// The stack we actually build with, shown in the hero's icon cloud
const stackIcons = [
  siTypescript, siJavascript, siReact, siNextdotjs, siNodedotjs, siExpress, siPython,
  siTensorflow, siPytorch, siFastapi, siFlask, siPostgresql, siMongodb, siSupabase,
  siFirebase, siPrisma, siDocker, siKubernetes, siVercel, siGooglecloud, siTailwindcss,
  siFigma, siGit, siGithub, siFlutter, siKotlin, siSwift, siLangchain, siRedis,
  siGraphql, siStripe, siOpencv, siScikitlearn,
];

const facts = [
  { value: '10+', label: 'Projects delivered' },
  { value: 'Full-stack', label: 'End-to-end solutions' },
  { value: '24/7', label: 'Support available' },
  { value: 'NDA', label: 'Protected process' },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: services.map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Service',
                name: s.title,
                description: s.desc,
                provider: { '@type': 'Organization', name: 'HydraBytes' },
              },
            })),
          }),
        }}
      />
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

          <div className={styles.stackSection}>
            <motion.ul
              className={styles.factsCol}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {facts.slice(0, 2).map((fact) => (
                <li key={fact.label} className={styles.fact}>
                  <span className={styles.factValue}>{fact.value}</span>
                  <span className={styles.factLabel}>{fact.label}</span>
                </li>
              ))}
            </motion.ul>

            <div className={styles.cloudWrap}>
              <IconCloud icons={stackIcons} id="services-stack-cloud" />
            </div>

            <motion.ul
              className={`${styles.factsCol} ${styles.factsRight}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              {facts.slice(2).map((fact) => (
                <li key={fact.label} className={styles.fact}>
                  <span className={styles.factValue}>{fact.value}</span>
                  <span className={styles.factLabel}>{fact.label}</span>
                </li>
              ))}
            </motion.ul>
          </div>
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
                  <div className={styles.serviceIconLarge}>
                    <GlassIcon icon={<service.icon size={32} strokeWidth={1.5} />} color={service.glassColor} size={64} />
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
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 7', borderRadius: '1rem', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                    <Image
                      src={service.image}
                      alt={`${service.title} illustration`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 640px"
                    />
                  </div>
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
              <AnimatedSection key={p.step} delay={i * 0.1} style={{ height: '100%' }}>
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
