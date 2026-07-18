'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Code, Monitor, Smartphone, Server, Cloud, Cpu, ArrowRight, Star,
} from 'lucide-react';
import { SiUpwork } from 'react-icons/si';
import AnimatedSection from '@/components/AnimatedSection';
import SpotlightCard from '@/components/SpotlightCard';
import { TextScramble } from '@/components/ui/text-scramble';
import FloatingParticles from '@/components/FloatingParticles';
import { PerspectiveMarquee } from '@/components/ui/perspective-marquee';
import { useTheme } from '@/lib/ThemeContext';
import { projects, type Project } from './projects';
import styles from './portfolio.module.css';

const techCategories = [
  {
    name: 'Frontend',
    icon: Monitor,
    color: '#0891b2',
    items: ['React', 'Next.js', 'TypeScript', 'Vue.js', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    name: 'Mobile',
    icon: Smartphone,
    color: '#22c55e',
    items: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
  },
  {
    name: 'Backend',
    icon: Server,
    color: '#00e5ff',
    items: ['Node.js', 'Python', 'FastAPI', 'GraphQL', 'PostgreSQL', 'Redis'],
  },
  {
    name: 'Cloud & DevOps',
    icon: Cloud,
    color: '#f59e0b',
    items: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
  },
  {
    name: 'AI/ML',
    icon: Cpu,
    color: '#f472b6',
    items: ['TensorFlow', 'PyTorch', 'LangChain', 'OpenAI'],
  },
];

const categories = ['All', 'Web', 'Mobile', 'AI/ML'];

const marqueeItems = [
  'React', 'Next.js', 'TypeScript', 'Python', 'Node.js', 'Docker',
  'AWS', 'TensorFlow', 'Flutter', 'FastAPI', 'PostgreSQL', 'Figma',
];

function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className={styles.projectLink}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <SpotlightCard spotlightColor={`${project.color}20`} disableTilt>
        <div className={styles.projectCard}>
          <div
            style={{
              position: 'relative', width: '100%',
              height: project.imageFit === 'contain' ? 'auto' : '180px',
              aspectRatio: project.imageFit === 'contain' ? project.imageAspect : undefined,
              overflow: 'hidden', borderRadius: '0.5rem', marginBottom: '1.25rem',
              background: 'var(--bg-tertiary)',
            }}
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              style={{ objectFit: 'cover', objectPosition: project.objectPosition || 'center' }}
              sizes="(max-width: 768px) 100vw, 400px"
            />
            {project.testimonial && (
              <span
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '4px 9px', borderRadius: '999px',
                  background: 'rgba(10,10,18,0.72)', backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: '11px', fontWeight: 700, color: '#fff', lineHeight: 1,
                }}
              >
                <Star size={11} fill="#fbbf24" color="#fbbf24" />
                {project.testimonial.rating.toFixed(1)}
                {project.testimonial.source && (
                  <span style={{ fontWeight: 500, opacity: 0.85 }}>· {project.testimonial.source}</span>
                )}
              </span>
            )}
          </div>
          <div className={styles.projectHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={styles.projectCategory}>{project.category}</span>
              <span style={{ fontSize: '11px', color: '#6c6c85', marginLeft: 'auto' }}>{project.year}</span>
            </div>
            <h3 className={styles.projectTitle}>{project.title}</h3>
          </div>
          <p className={styles.projectDesc}>{project.desc}</p>
          <div className={styles.projectMetric}>
            <span className={styles.metricValue}>{project.metric}</span>
          </div>
          <div className={styles.projectTech}>
            {project.tech.map(t => (
              <span key={t} className={styles.techTag}>{t}</span>
            ))}
          </div>
          <span
            className={styles.viewDetails}
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.9)',
              transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <TextScramble text="VIEW DETAILS" trigger={hovered} speed={25} />
            <ArrowRight size={14} style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(-6px)', transition: 'opacity 0.3s ease 0.1s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s' }} />
          </span>
        </div>
      </SpotlightCard>
    </Link>
  );
}

export default function PortfolioPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [active, setActive] = useState('All');
  // Surface verified Upwork client work first; stable sort keeps the rest in source order.
  const ordered = [...projects].sort(
    (a, b) => (a.clientType === 'upwork' ? 0 : 1) - (b.clientType === 'upwork' ? 0 : 1),
  );
  const filtered = active === 'All' ? ordered : ordered.filter(p => p.category === active);

  return (
    <>
      <section className={styles.hero} style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingParticles />
        <div className="container">
          <AnimatedSection>
            <span className="section-label">Our Work</span>
            <h1 className={styles.heroTitle}>
              Projects That <span className="gradient-text">Deliver Results</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Explore our portfolio of successful projects across web, mobile, and AI.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AnimatedSection>
            <div className={styles.filters}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`${styles.filterBtn} ${active === cat ? styles.filterActive : ''}`}
                  onClick={() => setActive(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </AnimatedSection>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className={styles.projectsGrid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {filtered.map((project, i) => (
                <AnimatedSection key={project.title} delay={i * 0.08}>
                  <ProjectCard project={project} />
                </AnimatedSection>
              ))}
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* ===== OUR TECH STACK ===== */}
      <section className={`section ${styles.techStackSection}`}>
        <div className="container">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">Technologies</span>
              <h2 className="section-title">Our Tech Stack</h2>
              <p className="section-subtitle">
                We leverage the best tools and frameworks to build robust, scalable solutions.
              </p>
            </div>
          </AnimatedSection>

          <div className={styles.marqueeWrap}>
            <PerspectiveMarquee
              items={marqueeItems}
              fontSize={72}
              pixelsPerSecond={50}
              rotateY={-25}
              rotateX={6}
              perspective={1200}
              fontWeight={800}
              background={isDark ? 'var(--bg-secondary)' : 'var(--bg-secondary)'}
              fadeColor={isDark ? '#12121e' : '#ffffff'}
              color={isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)'}
            />
          </div>

          <div className={styles.techCategoriesGrid}>
            {techCategories.map((category, catIndex) => (
              <AnimatedSection key={category.name} delay={catIndex * 0.1}>
                <SpotlightCard spotlightColor={`${category.color}20`}>
                  <div className={styles.techCategoryCard}>
                    <div className={styles.techCategoryHeader}>
                      <div
                        className={styles.techCategoryIcon}
                        style={{ color: category.color, background: `${category.color}15` }}
                      >
                        <category.icon size={22} strokeWidth={1.8} />
                      </div>
                      <h3 className={styles.techCategoryName}>{category.name}</h3>
                    </div>
                    <div className={styles.techBadgesGrid}>
                      {category.items.map((tech, techIndex) => (
                        <AnimatedSection key={tech} delay={catIndex * 0.1 + techIndex * 0.03}>
                          <motion.span
                            className={styles.techBadge}
                            whileHover={{ scale: 1.08, y: -2 }}
                            style={{ '--badge-accent': category.color } as React.CSSProperties}
                          >
                            <Code size={14} strokeWidth={2} />
                            {tech}
                          </motion.span>
                        </AnimatedSection>
                      ))}
                    </div>
                  </div>
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== UPWORK PROOF ===== */}
      <section className="section">
        <div className="container">
          <AnimatedSection>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: 0 }}>
                Our client work and reviews are verified on Upwork. See the ratings for yourself.
              </p>
              <motion.a
                href="https://www.upwork.com/freelancers/~016f18e36f0f1c378e?mp_source=share"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5, boxShadow: '0 14px 28px rgba(20,168,0,0.35)' }}
                whileTap={{ y: -1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.7rem 1.4rem', borderRadius: '999px',
                  background: '#14a800', color: '#fff', fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 6px 16px rgba(20,168,0,0.22)',
                }}
              >
                <SiUpwork size={20} />
                View our verified Upwork profile
              </motion.a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
