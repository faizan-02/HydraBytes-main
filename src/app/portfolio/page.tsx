'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Code, Monitor, Smartphone, Server, Cloud, Cpu, ArrowRight,
} from 'lucide-react';
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
          <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
            <Image
              src={project.image}
              alt={project.title}
              fill
              style={{ objectFit: 'cover', objectPosition: project.objectPosition || 'center' }}
              sizes="(max-width: 768px) 100vw, 400px"
            />
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
  const filtered = active === 'All' ? projects : projects.filter(p => p.category === active);

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
    </>
  );
}
