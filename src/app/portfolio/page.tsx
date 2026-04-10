'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Code, Monitor, Smartphone, Server, Cloud, Cpu,
} from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import SpotlightCard from '@/components/SpotlightCard';
import FloatingParticles from '@/components/FloatingParticles';
import styles from './portfolio.module.css';

const techCategories = [
  {
    name: 'Frontend',
    icon: Monitor,
    color: '#7c3aed',
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

const categories = ['All', 'Mobile', 'AI/ML'];

const projects = [
  {
    title: 'OptiPro — Retinal Disease Detection',
    category: 'AI/ML',
    desc: 'End-to-end AI-powered retinal disease detection platform for clinical support. Classifies retinal scans into CNV, DME, Drusen, and Normal using ResNet-101 with Grad-CAM heatmap visualization for explainable AI output. Includes a full doctor panel, patient portal, appointment workflows, and AI-generated PDF medical reports.',
    tech: ['PyTorch', 'ResNet-101', 'Flask', 'React', 'Supabase', 'PostgreSQL', 'Grad-CAM', 'Gemini API'],
    color: '#00e5ff',
    metric: '4 disease classes detected',
    image: '/portfolio/optipro.png',
    year: 'Aug 2025',
  },
  {
    title: 'AI Student Stress Management',
    category: 'AI/ML',
    desc: 'AI-based platform that detects and helps reduce student stress, anxiety, and depression using machine learning. Analyzes questionnaire data for early mental health detection, delivers personalized recommendations like breathing exercises and relaxation techniques, and includes an AI chatbot for real-time emotional support.',
    tech: ['Python', 'Machine Learning', 'React', 'PostgreSQL', 'AI Chatbot', 'REST API'],
    color: '#f472b6',
    metric: 'Early stress detection',
    image: '/portfolio/stress-mgmt.png',
    year: 'Feb 2025',
  },
  {
    title: 'Safe-Sawar — Women-First Carpooling',
    category: 'Mobile',
    desc: 'Pakistan\'s first NADRA-verified women-first carpooling platform built to tackle rising fuel costs. Features biometric identity verification, institution-based trust circles, live ride tracking, and an offline-capable Emergency SOS system via Bluetooth mesh networking. Male section added to enhance the wider userbase. Currently in beta.',
    tech: ['React Native', 'TypeScript', 'Firebase', 'Expo', 'Mesh Network', 'NADRA API', 'OpenStreetMap'],
    color: '#22c55e',
    metric: 'Beta — launching soon',
    image: '/portfolio/safe-sawar.png',
    year: 'Mar 2026',
  },
];

export default function PortfolioPage() {
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
                  <SpotlightCard spotlightColor={`${project.color}20`}>
                    <div className={styles.projectCard}>
                      <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${project.color}40, transparent)` }} />
                      </div>
                      <div className={styles.projectHeader} style={{ borderLeftColor: project.color }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={styles.projectCategory}>{project.category}</span>
                          {'year' in project && <span style={{ fontSize: '11px', color: '#6c6c85', marginLeft: 'auto' }}>{(project as { year: string }).year}</span>}
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
                    </div>
                  </SpotlightCard>
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
