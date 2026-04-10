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
    title: 'AI Voice Chat Agent',
    category: 'AI/ML',
    desc: 'Real-time voice conversation platform with 104+ AI characters using OpenAI GPT, TTS, and browser-based mic/speaker support. Features mood detection, session replay, WebRTC-based real-time API, interactive games, story adventures, and support for multiple providers including Claude, xAI, and local Ollama models. Deployable via Docker or Railway.',
    tech: ['FastAPI', 'WebSockets', 'OpenAI', 'WebRTC', 'Python', 'Docker', 'Railway', 'ElevenLabs'],
    color: '#7c3aed',
    metric: '104+ AI characters',
    image: '/portfolio/ai-voice-agent.png',
    year: 'Nov 2025',
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

          <AnimatedSection>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <p style={{ color: '#a0a0b8', marginBottom: '1rem', fontSize: '1rem' }}>
                Want to explore the code behind these projects?
              </p>
              <a
                href="https://github.com/TheHydraBytes"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #7c3aed, #00e5ff)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '999px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  transition: 'opacity 0.2s',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                View Our GitHub
              </a>
            </div>
          </AnimatedSection>
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
