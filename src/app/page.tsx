'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Smartphone, Brain, CheckCircle2,
  Users, Zap, Shield, TrendingUp, RefreshCw, Palette,
  Bot, Clock, Star, Award, Code2,
} from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import SpotlightCard from '@/components/SpotlightCard';
import MagneticButton from '@/components/MagneticButton';
import { BlurFade } from '@/components/BlurFade';
import { CircularGallery } from '@/components/ui/circular-gallery';
import {
  SiVercel, SiMongodb, SiGooglecloud, SiReact, SiNextdotjs,
  SiNodedotjs, SiDocker, SiFirebase, SiTensorflow, SiFigma, SiGithub,
} from 'react-icons/si';
import { FaAws, FaMicrosoft } from 'react-icons/fa';
import LogoLoop from '@/components/ui/LogoLoop';
import styles from './page.module.css';

const trustedCompanies = [
  { name: 'Vercel', Icon: SiVercel },
  { name: 'Microsoft', Icon: FaMicrosoft },
  { name: 'AWS', Icon: FaAws },
  { name: 'Google Cloud', Icon: SiGooglecloud },
  { name: 'MongoDB', Icon: SiMongodb },
];

const serviceHighlights = [
  {
    icon: Code2,
    title: 'Web Development',
    desc: 'Fast, secure, and scalable web applications built with modern technologies.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    desc: 'Native and cross-platform mobile apps that deliver exceptional user experiences.',
  },
  {
    icon: Brain,
    title: 'AI / ML Solutions',
    desc: 'Intelligent solutions that automate processes and unlock new opportunities.',
  },
];

const heroStats = [
  { icon: CheckCircle2, value: '10+', label: 'Projects Delivered', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
  { icon: Zap, value: '3+', label: 'Technologies Per Stack', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  { icon: Clock, value: '100%', label: 'On-Time Delivery', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  { icon: Shield, value: '24/7', label: 'Support Available', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
];

const TwoTonePython = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="1em" height="1em" {...props}>
    <linearGradient id="python-original-a" gradientUnits="userSpaceOnUse" x1="70.252" y1="1237.476" x2="170.659" y2="1151.089" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)"><stop offset="0" stopColor="#5A9FD4"/><stop offset="1" stopColor="#306998"/></linearGradient>
    <linearGradient id="python-original-b" gradientUnits="userSpaceOnUse" x1="209.474" y1="1098.811" x2="173.62" y2="1149.537" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)"><stop offset="0" stopColor="#FFD43B"/><stop offset="1" stopColor="#FFE873"/></linearGradient>
    <path fill="url(#python-original-a)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" transform="translate(0 10.26)"/>
    <path fill="url(#python-original-b)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" transform="translate(0 10.26)"/>
  </svg>
);

const techLogos = [
  { node: <SiReact color="#61DAFB" />, title: 'React' },
  { node: <SiNextdotjs />, title: 'Next.js' },
  { node: <TwoTonePython />, title: 'Python' },
  { node: <SiNodedotjs color="#339933" />, title: 'Node.js' },
  { node: <SiDocker color="#2496ED" />, title: 'Docker' },
  { node: <FaAws color="#FF9900" />, title: 'AWS' },
  { node: <SiFirebase color="#FFCA28" />, title: 'Firebase' },
  { node: <SiTensorflow color="#FF6F00" />, title: 'TensorFlow' },
  { node: <SiFigma color="#F24E1E" />, title: 'Figma' },
  { node: <SiVercel />, title: 'Vercel' },
  { node: <SiGithub />, title: 'GitHub' },
  { node: <SiMongodb color="#47A248" />, title: 'MongoDB' },
];

const featuredProjects = [
  {
    title: 'OptiPro: Retinal Disease Detection',
    category: 'AI/ML',
    desc: 'End-to-end AI-powered retinal disease detection platform for clinical support with Grad-CAM visualization.',
    tech: ['PyTorch', 'ResNet-101', 'Flask'],
    color: '#7c3aed',
    image: '/portfolio/optipro.png',
  },
  {
    title: 'AI Voice Chat Agent',
    category: 'AI/ML',
    desc: 'Real-time voice conversation platform with 104+ AI characters using OpenAI GPT, TTS, and WebRTC.',
    tech: ['FastAPI', 'WebSockets', 'OpenAI'],
    color: '#8b5cf6',
    image: '/portfolio/ai-voice-agent.png',
  },
  {
    title: 'Safe-Sawar: Women-First Carpooling',
    category: 'Mobile',
    desc: 'Pakistan\'s first NADRA-verified women-first carpooling platform with live ride tracking.',
    tech: ['React Native', 'TypeScript', 'Firebase'],
    color: '#22c55e',
    image: '/portfolio/safe-sawar.png',
  },
  {
    title: 'AI Student Stress Management',
    category: 'AI/ML',
    desc: 'AI-based platform that detects and helps reduce student stress using machine learning.',
    tech: ['Python', 'Machine Learning', 'React'],
    color: '#f59e0b',
    image: '/portfolio/stress-mgmt.png',
  },
  {
    title: 'Lung Cancer Image Classifier',
    category: 'AI/ML',
    desc: 'CNN-based histopathology classifier for lung tissue images.',
    tech: ['TensorFlow', 'Keras', 'CNN'],
    color: '#ef4444',
    image: '/portfolio/lung-cancer.png',
  },
  {
    title: 'Inventra: Smart Inventory Management',
    category: 'Web',
    desc: 'All-in-one inventory tracking, order management, and real-time profitability analytics platform.',
    tech: ['Next.js', 'TypeScript', 'Supabase'],
    color: '#3b82f6',
    image: '/portfolio/inventra.png',
  },
];

const advantages = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for performance with sub-second load times that keep users engaged.', color: '#f59e0b' },
  { icon: Shield, title: 'Secure by Design', desc: 'Enterprise-grade security built into every layer of your application.', color: '#22c55e' },
  { icon: TrendingUp, title: 'Scalable Architecture', desc: 'Solutions that grow with your business, from startup to enterprise.', color: '#3b82f6' },
  { icon: Palette, title: 'Pixel-Perfect Design', desc: 'Every interface crafted with precision, ensuring a premium user experience.', color: '#f472b6' },
  { icon: Bot, title: 'AI-Powered', desc: 'Leverage machine learning and automation to stay ahead of the curve.', color: '#7c3aed' },
  { icon: RefreshCw, title: 'Agile Process', desc: 'Transparent, iterative development with continuous delivery and feedback.', color: '#ef4444' },
];

const clientCommitments = [
  {
    icon: Shield,
    color: '#7c3aed',
    title: 'NDA on Day One',
    detail: 'Every engagement starts with a signed NDA. Your ideas, business data, and IP are fully protected before any discussion begins.',
  },
  {
    icon: TrendingUp,
    color: '#3b82f6',
    title: 'Milestone Based Delivery',
    detail: 'Work is broken into clear milestones with agreed deliverables. You review and approve each phase before we proceed. No surprises, ever.',
  },
  {
    icon: RefreshCw,
    color: '#22c55e',
    title: 'Direct Developer Access',
    detail: 'You work directly with the lead developer on your project. No account managers, no middlemen. Just fast, clear communication throughout.',
  },
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
      <span className={styles.accentText}>{ctaWords[index]}</span>
    </motion.span>
  );
}

import { useTheme } from '@/lib/ThemeContext';

function HeroWorkspace() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={styles.heroImageWrap}>
      <motion.div
        className={styles.heroImage}
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <div className={styles.heroImgContainer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-workspace-dark.png"
            alt="Developer workspace showing VS Code with TypeScript code"
            className={`${styles.heroImg} ${styles.heroImgLayer}`}
            style={{ opacity: isDark ? 1 : 0 }}
            width={1024}
            height={1024}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-workspace-light.png"
            alt="Developer workspace showing VS Code with TypeScript code"
            className={`${styles.heroImg} ${styles.heroImgLayer} ${styles.heroImgLayerAbs}`}
            style={{ opacity: isDark ? 0 : 1 }}
            width={1024}
            height={1024}
          />
        </div>
      </motion.div>
      <div className={styles.heroPurpleGlow} />
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <AnimatedSection>
              <span className={styles.heroLabel}>NEXT-GEN DIGITAL SOLUTIONS</span>
            </AnimatedSection>

            <motion.h1
              className={styles.heroTitle}
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
            >
              {['We', 'Build', 'Digital'].map((word) => (
                <motion.span
                  key={word}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] } },
                  }}
                  style={{ display: 'inline-block', marginRight: '0.25em' }}
                >
                  {word}
                </motion.span>
              ))}
              <br />
              {['Experiences', 'That'].map((word, i) => (
                <motion.span
                  key={word}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] } },
                  }}
                  style={{ display: 'inline-block', marginRight: '0.25em' }}
                >
                  {i === 0 ? <span className={styles.accentText}>{word}</span> : word}
                </motion.span>
              ))}
              <br />
              {['Drive', 'Growth'].map((word) => (
                <motion.span
                  key={word}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] } },
                  }}
                  style={{ display: 'inline-block', marginRight: '0.25em' }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

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
                    Get Started
                    <ArrowRight size={18} />
                  </Link>
                </MagneticButton>
                <Link href="/portfolio" className="btn btn-secondary">
                  View Our Work
                  <ArrowRight size={16} />
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <div className={styles.trustedBy}>
                <span className={styles.trustedLabel}>Trusted by innovators</span>
                <div className={styles.trustedLogos}>
                  {trustedCompanies.map(({ name, Icon }) => (
                    <span key={name} className={styles.trustedLogo}>
                      <Icon size={16} />
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>

          <HeroWorkspace />
        </div>
      </section>

      {/* ===== SERVICES STRIP + STATS ===== */}
      <section className={styles.servicesStrip}>
        <div className="container">
          <BlurFade delay={0} duration={0.6} inView blur="6px">
            <div className={styles.servicesStripInner}>
              <div className={styles.serviceHighlights}>
                {serviceHighlights.map((service) => (
                  <div key={service.title} className={styles.serviceHighlight}>
                    <div className={styles.serviceHighlightIcon}>
                      <service.icon size={20} strokeWidth={1.8} />
                    </div>
                    <h3 className={styles.serviceHighlightTitle}>{service.title}</h3>
                    <p className={styles.serviceHighlightDesc}>{service.desc}</p>
                  </div>
                ))}
              </div>
              <div className={styles.heroStatsGrid}>
                {heroStats.map((stat) => (
                  <div key={stat.label} className={styles.heroStatItem}>
                    <div className={styles.heroStatIcon} style={{ background: stat.bg, color: stat.color }}>
                      <stat.icon size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <div className={styles.heroStatValue}>{stat.value}</div>
                      <div className={styles.heroStatLabel}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ===== TECH STACK MARQUEE ===== */}
      <section className={styles.techMarqueeSection}>
        <BlurFade delay={0} duration={0.8} inView blur="4px">
          <LogoLoop
            logos={techLogos}
            speed={80}
            direction="left"
            logoHeight={52}
            gap={80}
            hoverSpeed={20}
            scaleOnHover
            fadeOut={false}
            ariaLabel="Technology stack"
          />
        </BlurFade>
      </section>

      {/* ===== FEATURED PROJECTS ===== */}
      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <BlurFade delay={0} duration={0.6} inView blur="8px">
            <div className="section-header">
              <span className="section-label-badge">Featured Solutions</span>
              <h2 className="section-title">
                Production-ready solutions that{' '}
                <span className={styles.accentText}>deliver results.</span>
              </h2>
              <p className="section-subtitle">
                Explore our portfolio of web, mobile, and AI projects. Each solution is built
                with precision, optimized for performance, and designed to scale.
              </p>
            </div>
          </BlurFade>

          <CircularGallery items={featuredProjects} />

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <MagneticButton>
              <Link href="/portfolio" className="btn btn-secondary">
                View All Projects
                <ArrowRight size={16} />
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="section">
        <div className="container">
          <BlurFade delay={0} duration={0.6} inView blur="8px">
            <div className="section-header">
              <span className="section-label-badge">Why HydraBytes</span>
              <h2 className="section-title">The HydraBytes Advantage</h2>
              <p className="section-subtitle">
                We don&apos;t just write code. We engineer digital experiences that
                drive measurable business results.
              </p>
            </div>
          </BlurFade>

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
                    <h3 className={styles.advantageTitle}>{item.title}</h3>
                    <p className={styles.advantageDesc}>{item.desc}</p>
                  </motion.div>
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CLIENT COMMITMENTS ===== */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <BlurFade delay={0} duration={0.6} inView blur="8px">
            <div className="section-header">
              <span className="section-label-badge">Our Commitment</span>
              <h2 className="section-title">What We Guarantee</h2>
              <p className="section-subtitle">
                Every project comes with these non-negotiable commitments,
                built into our process from day one.
              </p>
            </div>
          </BlurFade>

          <div className={styles.testimonialsGrid}>
            {clientCommitments.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.1}>
                <SpotlightCard spotlightColor={`${item.color}20`}>
                  <motion.div
                    className={styles.testimonialCard}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', background: `${item.color}18`, color: item.color, marginBottom: '1rem' }}>
                      <item.icon size={24} strokeWidth={1.6} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>{item.title}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0, hyphens: 'none', flex: 1 }}>{item.detail}</p>
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

              <p className={styles.ctaTrust}>
                Free consultation &middot; No commitment &middot; Response within 24 hours
              </p>
              <p className={styles.ctaCallLink}>
                Prefer to talk directly?{' '}
                <Link href="/contact" className={styles.ctaCallLinkAnchor}>
                  Book a 30-min call
                  <ArrowRight size={12} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                </Link>
              </p>

              <div className={styles.ctaBadges}>
                {[
                  { icon: <Shield size={13} strokeWidth={1.8} />, label: 'NDA Protected' },
                  { icon: <Clock size={13} strokeWidth={1.8} />, label: '24h Response' },
                  { icon: <Star size={13} strokeWidth={1.8} />, label: '99% Satisfaction' },
                  { icon: <Award size={13} strokeWidth={1.8} />, label: '5+ Years Experience' },
                ].map((b) => (
                  <div key={b.label} className={styles.ctaBadge}>
                    <span style={{ display: 'flex' }}>{b.icon}</span>
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
