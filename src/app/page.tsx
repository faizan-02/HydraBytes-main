'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Globe, Smartphone, Brain, Zap, Shield, TrendingUp,
  Palette, Bot, RefreshCw, ArrowRight,
} from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import SpotlightCard from '@/components/SpotlightCard';
import AnimatedCounter from '@/components/AnimatedCounter';
import GradientText from '@/components/GradientText';
import FloatingParticles from '@/components/FloatingParticles';
import MagneticButton from '@/components/MagneticButton';
import styles from './page.module.css';

const techChips = [
  { label: 'Next.js',    color: '#e2e8f0', style: { top: '15%', left: '8%' },   dur: 5.2, delay: 0 },
  { label: 'React',      color: '#61dafb', style: { top: '22%', right: '10%' }, dur: 4.8, delay: 0.5 },
  { label: 'TypeScript', color: '#3178c6', style: { top: '65%', left: '6%' },   dur: 6.1, delay: 1.2 },
  { label: 'Node.js',    color: '#68a063', style: { bottom: '20%', right: '8%' }, dur: 5.5, delay: 0.8 },
  { label: 'AI / ML',    color: '#f472b6', style: { top: '40%', right: '5%' },  dur: 4.4, delay: 1.8 },
];

const services = [
  {
    icon: Globe,
    title: 'Web Development',
    desc: 'High-performance websites and web apps built with cutting-edge frameworks, optimized for speed, SEO, and scalability.',
    color: '#7c3aed',
  },
  {
    icon: Smartphone,
    title: 'App Development',
    desc: 'Native and cross-platform mobile applications that deliver seamless experiences across iOS and Android.',
    color: '#00e5ff',
  },
  {
    icon: Brain,
    title: 'AI & ML Solutions',
    desc: 'Intelligent automation, predictive analytics, and custom AI models that transform your data into actionable insights.',
    color: '#f472b6',
  },
];

const stats = [
  { value: '150+', label: 'Projects Delivered' },
  { value: '50+', label: 'Happy Clients' },
  { value: '99%', label: 'Client Satisfaction' },
  { value: '24/7', label: 'Support Available' },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CEO, TechNova',
    quote: 'HydraBytes transformed our vision into a stunning platform. Their technical expertise and design sense are unmatched.',
    avatar: 'SC',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CTO, FinScale',
    quote: 'The AI solution they built increased our efficiency by 40%. Professional, innovative, and incredibly responsive team.',
    avatar: 'MR',
  },
  {
    name: 'Aisha Patel',
    role: 'Founder, GreenLeaf',
    quote: 'From concept to launch, HydraBytes delivered beyond expectations. Our app has received phenomenal user feedback.',
    avatar: 'AP',
  },
];

const trustedBy = ['TechNova', 'FinScale', 'GreenLeaf', 'DataPulse', 'CloudSync', 'NexGen'];

const advantages = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for performance — sub-second load times that keep users engaged.', color: '#f59e0b' },
  { icon: Shield, title: 'Secure by Design', desc: 'Enterprise-grade security built into every layer of your application.', color: '#22c55e' },
  { icon: TrendingUp, title: 'Scalable Architecture', desc: 'Solutions that grow with your business, from startup to enterprise.', color: '#00e5ff' },
  { icon: Palette, title: 'Pixel-Perfect Design', desc: 'Every interface crafted with precision, ensuring a premium user experience.', color: '#f472b6' },
  { icon: Bot, title: 'AI-Powered', desc: 'Leverage machine learning and automation to stay ahead of the curve.', color: '#7c3aed' },
  { icon: RefreshCw, title: 'Agile Process', desc: 'Transparent, iterative development with continuous delivery and feedback.', color: '#ef4444' },
];

const ctaWords = ['Extraordinary?', 'Innovative?', 'Scalable?', 'Remarkable?', 'Powerful?'];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % ctaWords.length);
        setVisible(true);
      }, 350);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.span
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -12 }}
      transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
      style={{ display: 'inline-block' }}
    >
      <GradientText>{ctaWords[index]}</GradientText>
    </motion.span>
  );
}

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const blob1Y = useTransform(heroScroll, [0, 1], [0, -120]);
  const blob2Y = useTransform(heroScroll, [0, 1], [0, -70]);
  const blob3Y = useTransform(heroScroll, [0, 1], [0, -180]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!heroRef.current || !spotlightRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      spotlightRef.current.style.background =
        `radial-gradient(500px circle at ${x}% ${y}%, rgba(124, 58, 237, 0.07), transparent 60%)`;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.heroBackdrop}>
          {/* Floating tech chips */}
          {techChips.map((chip) => (
            <motion.div
              key={chip.label}
              style={{
                position: 'absolute',
                ...chip.style,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: `1px solid ${chip.color}30`,
                background: `${chip.color}12`,
                color: chip.color,
                backdropFilter: 'blur(8px)',
                zIndex: 2,
                pointerEvents: 'none',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -10, 0],
              }}
              transition={{
                opacity: { duration: 0.5, delay: chip.delay },
                scale: { duration: 0.5, delay: chip.delay },
                y: { duration: chip.dur, repeat: Infinity, ease: 'easeInOut', delay: chip.delay },
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: chip.color }} />
              {chip.label}
            </motion.div>
          ))}
          {/* Floating particles */}
          <FloatingParticles />
          {/* Aurora blobs — with scroll parallax */}
          <motion.div className={`${styles.auroraBlob} ${styles.auroraBlob1}`} style={{ y: blob1Y }} />
          <motion.div className={`${styles.auroraBlob} ${styles.auroraBlob2}`} style={{ y: blob2Y }} />
          <motion.div className={`${styles.auroraBlob} ${styles.auroraBlob3}`} style={{ y: blob3Y }} />
          {/* Pulse rings */}
          <div className={styles.heroRings}>
            <div className={styles.ring} />
            <div className={styles.ring} />
            <div className={styles.ring} />
          </div>
          {/* Floating geometric shapes */}
          <svg className={`${styles.geoShape} ${styles.geoShape1}`} viewBox="0 0 60 60" fill="none">
            <polygon points="30,2 57,17 57,47 30,58 3,47 3,17" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <svg className={`${styles.geoShape} ${styles.geoShape2}`} viewBox="0 0 40 40" fill="none">
            <rect x="4" y="4" width="32" height="32" stroke="currentColor" strokeWidth="1.5" transform="rotate(15 20 20)" />
          </svg>
          <svg className={`${styles.geoShape} ${styles.geoShape3}`} viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="22" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4" />
          </svg>
          <svg className={`${styles.geoShape} ${styles.geoShape4}`} viewBox="0 0 44 44" fill="none">
            <polygon points="22,2 42,16 35,39 9,39 2,16" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <svg className={`${styles.geoShape} ${styles.geoShape5}`} viewBox="0 0 36 36" fill="none">
            <rect x="3" y="3" width="30" height="30" stroke="currentColor" strokeWidth="1.5" transform="rotate(45 18 18)" />
          </svg>
        </div>
        {/* Mouse-tracking spotlight */}
        <div ref={spotlightRef} className={styles.heroSpotlight} />
        {/* Floating live stats widget */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: '12%',
            right: '3%',
            zIndex: 3,
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '1rem',
              border: '1px solid var(--border-color-hover)',
              background: 'var(--bg-card)',
              backdropFilter: 'blur(16px)',
              minWidth: 160,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 6px #22c55e',
                display: 'inline-block',
                animation: 'badgePulse 2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#22c55e' }}>Live</span>
            </div>
            {[
              { label: 'Projects Live', value: '150+' },
              { label: 'Uptime', value: '99.9%' },
              { label: 'Response', value: '0.8s' },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{item.label}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{item.value}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
        <div className={`container ${styles.heroContainer}`}>
          <AnimatedSection>
            <div className={styles.heroBadge}>
              <span className={styles.badgeDot} />
              Next-Gen Digital Solutions
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h1 className={styles.heroTitle}>
              We Build Digital
              <br />
              <GradientText>Experiences</GradientText> That
              <br />
              Drive Growth
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <p className={styles.heroSubtitle}>
              HydraBytes is a cutting-edge IT startup specializing in web development,
              mobile apps, and AI-driven solutions. We turn complex challenges into
              elegant, scalable products.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <div className={styles.heroCtas}>
              <MagneticButton>
                <Link href="/contact" className="btn btn-primary">
                  Book a Consultation
                  <ArrowRight size={18} />
                </Link>
              </MagneticButton>
              <Link href="/portfolio" className="btn btn-secondary">
                View Our Work
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <div className={styles.trustedBy}>
              <span className={styles.trustedLabel}>Trusted by innovative companies</span>
              <div className={styles.trustedLogos}>
                {trustedBy.map((name) => (
                  <span key={name} className={styles.trustedLogo}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== SERVICES SECTION ===== */}
      <section className="section" id="services">
        <div className="container">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">What We Do</span>
              <h2 className="section-title">Services Built for the Future</h2>
              <p className="section-subtitle">
                We combine technical mastery with creative innovation to deliver
                solutions that set you apart from the competition.
              </p>
            </div>
          </AnimatedSection>

          <div className={styles.servicesGrid}>
            {services.map((service, i) => (
              <AnimatedSection key={service.title} delay={i * 0.1} direction="up">
                <SpotlightCard spotlightColor={`${service.color}25`}>
                  <motion.div
                    className={styles.serviceCard}
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={styles.serviceIcon}
                      style={{ color: service.color, background: `${service.color}15` }}
                    >
                      <service.icon size={28} strokeWidth={1.8} />
                    </div>
                    <h3 className={styles.serviceTitle}>{service.title}</h3>
                    <p className={styles.serviceDesc}>{service.desc}</p>
                    <Link href="/services" className={styles.serviceLink}>
                      Learn More <ArrowRight size={16} />
                    </Link>
                  </motion.div>
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 0.1}>
                <div className={styles.statItem}>
                  <AnimatedCounter target={stat.value} className={styles.statValue} />
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="section">
        <div className="container">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">Why HydraBytes</span>
              <h2 className="section-title">The HydraBytes Advantage</h2>
              <p className="section-subtitle">
                We don&apos;t just write code — we engineer digital experiences that
                drive measurable business results.
              </p>
            </div>
          </AnimatedSection>

          <div className={styles.advantagesGrid}>
            {advantages.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.08}>
                <SpotlightCard spotlightColor={`${item.color}20`}>
                  <motion.div
                    className={styles.advantageCard}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.advantageIcon} style={{ color: item.color, background: `${item.color}15` }}>
                      <item.icon size={22} strokeWidth={1.8} />
                    </div>
                    <h4 className={styles.advantageTitle}>{item.title}</h4>
                    <p className={styles.advantageDesc}>{item.desc}</p>
                  </motion.div>
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">Client Stories</span>
              <h2 className="section-title">What Our Clients Say</h2>
              <p className="section-subtitle">
                Don&apos;t just take our word for it — hear from the companies
                we&apos;ve helped transform.
              </p>
            </div>
          </AnimatedSection>

          <div className={styles.testimonialsGrid}>
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 0.1}>
                <SpotlightCard>
                  <motion.div
                    className={styles.testimonialCard}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                    <div className={styles.testimonialAuthor}>
                      <div className={styles.testimonialAvatar}>{t.avatar}</div>
                      <div>
                        <p className={styles.testimonialName}>{t.name}</p>
                        <p className={styles.testimonialRole}>{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className={styles.ctaSection}>
        <div className="container">
          <AnimatedSection>
            <div className={styles.ctaCard}>
              <h2 className={styles.ctaTitle}>
                Ready to Build Something <RotatingWord />
              </h2>
              <p className={styles.ctaDesc}>
                Let&apos;s discuss your project and explore how HydraBytes can
                bring your vision to life with cutting-edge technology.
              </p>
              <div className={styles.ctaButtons}>
                <MagneticButton>
                  <Link href="/contact" className="btn btn-primary">
                    Start Your Project
                    <ArrowRight size={18} />
                  </Link>
                </MagneticButton>
                <Link href="/services" className="btn btn-secondary">
                  Explore Services
                </Link>
              </div>

              {/* Trust line */}
              <p className={styles.ctaTrust}>
                Free consultation &middot; No commitment &middot; Response within 24 hours
              </p>
              <p className={styles.ctaCallLink}>
                Prefer to talk directly?{' '}
                <Link href="/contact" className={styles.ctaCallLinkAnchor}>
                  Book a 30-min call →
                </Link>
              </p>

              {/* Trust badges */}
              <div className={styles.ctaBadges}>
                {[
                  { icon: '🛡', label: 'NDA Protected' },
                  { icon: '⏱', label: '24h Response' },
                  { icon: '⭐', label: '99% Satisfaction' },
                  { icon: '🏆', label: '8+ Years Experience' },
                ].map((b) => (
                  <div key={b.label} className={styles.ctaBadge}>
                    <span>{b.icon}</span>
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
