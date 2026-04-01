'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const categories = ['All', 'Web', 'Mobile', 'AI/ML'];

const projects = [
  {
    title: 'FinScale Dashboard',
    category: 'Web',
    desc: 'Real-time financial analytics dashboard with AI-powered insights and automated reporting for enterprise clients.',
    tech: ['React', 'Node.js', 'D3.js', 'PostgreSQL', 'TypeScript', 'Redis', 'Chart.js', 'Stripe'],
    color: '#7c3aed',
    metric: '40% faster decisions',
  },
  {
    title: 'GreenLeaf Mobile App',
    category: 'Mobile',
    desc: 'Eco-conscious lifestyle app with carbon footprint tracking, sustainable product marketplace, and community features.',
    tech: ['React Native', 'Firebase', 'GraphQL', 'TypeScript', 'Redux', 'Mapbox', 'Stripe'],
    color: '#22c55e',
    metric: '100K+ downloads',
  },
  {
    title: 'DataPulse AI Engine',
    category: 'AI/ML',
    desc: 'Custom ML pipeline for predictive maintenance in manufacturing, reducing equipment downtime by 60%.',
    tech: ['Python', 'TensorFlow', 'AWS SageMaker', 'scikit-learn', 'FastAPI', 'Docker', 'PostgreSQL'],
    color: '#f472b6',
    metric: '60% less downtime',
  },
  {
    title: 'CloudSync Platform',
    category: 'Web',
    desc: 'Enterprise cloud management platform with multi-provider support, automated scaling, and cost optimization.',
    tech: ['Next.js', 'TypeScript', 'Docker', 'K8s', 'AWS', 'Terraform', 'Redis', 'PostgreSQL'],
    color: '#00e5ff',
    metric: '35% cost savings',
  },
  {
    title: 'NexGen Health App',
    category: 'Mobile',
    desc: 'Telemedicine platform with video consultations, prescription management, and health monitoring integration.',
    tech: ['Flutter', 'Node.js', 'WebRTC', 'Firebase', 'Stripe', 'TypeScript', 'Redux'],
    color: '#f59e0b',
    metric: '50K+ patients served',
  },
  {
    title: 'SmartRetail AI',
    category: 'AI/ML',
    desc: 'Computer vision system for retail analytics — customer tracking, shelf monitoring, and demand forecasting.',
    tech: ['PyTorch', 'OpenCV', 'FastAPI', 'Redis', 'PostgreSQL', 'Docker', 'AWS'],
    color: '#ef4444',
    metric: '25% revenue increase',
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
                      <div className={styles.projectHeader} style={{ borderLeftColor: project.color }}>
                        <span className={styles.projectCategory}>{project.category}</span>
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
