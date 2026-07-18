'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, Tag, Play, Star } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import FloatingParticles from '@/components/FloatingParticles';
import { projects } from '../projects';
import styles from './project.module.css';

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find(p => p.slug === slug);

  if (!project) {
    return (
      <div className={styles.notFound}>
        <h1>Project not found</h1>
        <Link href="/portfolio" className={styles.backLink}>
          <ArrowLeft size={18} /> Back to Portfolio
        </Link>
      </div>
    );
  }

  const currentIndex = projects.findIndex(p => p.slug === slug);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  return (
    <>
      {/* Hero */}
      <section className={styles.hero} style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingParticles />
        <div className="container">
          <AnimatedSection>
            <Link href="/portfolio" className={styles.backLink}>
              <ArrowLeft size={18} /> Back to Portfolio
            </Link>
            <div className={styles.heroMeta}>
              <span className={styles.categoryBadge} style={{ borderColor: project.color, color: project.color }}>
                {project.category}
              </span>
              <span className={styles.dateBadge}>
                <Calendar size={14} /> {project.year}
              </span>
              {project.clientType && (
                <span className={styles.dateBadge}>
                  {project.clientType === 'internal'
                    ? 'In-house product'
                    : project.clientType === 'upwork'
                      ? 'Client project · Upwork'
                      : 'Client project'}
                </span>
              )}
            </div>
            <h1 className={styles.heroTitle}>{project.title}</h1>
            <p className={styles.heroDesc}>{project.desc}</p>
            <div className={styles.techTags}>
              {project.tech.map(t => (
                <span key={t} className={styles.techTag}>
                  <Tag size={12} /> {t}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Gallery */}
      <section className={`section ${styles.gallerySection}`}>
        <div className="container">
          <AnimatedSection>
            <div className={styles.gallery}>
              {project.gallery.map((img, i) => (
                <motion.div
                  key={i}
                  className={styles.galleryItem}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={img}
                    alt={`${project.title} screenshot ${i + 1}`}
                    width={1200}
                    height={675}
                    style={{ objectFit: 'cover', objectPosition: project.objectPosition || 'center', width: '100%', height: 'auto' }}
                    className={styles.galleryImage}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatedSection>

          {project.video && (
            <AnimatedSection delay={0.1}>
              <div className={styles.videoWrapper}>
                <div className={styles.videoLabel}>
                  <Play size={16} /> Project Demo
                </div>
                {(Array.isArray(project.video) ? project.video : [project.video]).map((src, i) => (
                  <video
                    key={i}
                    className={styles.videoPlayer}
                    controls
                    preload="metadata"
                    playsInline
                  >
                    <source src={src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ))}
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* Case Study */}
      <section className={`section ${styles.caseStudySection}`}>
        <div className="container">
          <div className={styles.caseStudyGrid}>
            <AnimatedSection delay={0}>
              <div className={styles.caseStudyCard}>
                <div className={styles.caseStudyIcon} style={{ background: `${project.color}18`, color: project.color }}>01</div>
                <h3 className={styles.caseStudyHeading}>The Challenge</h3>
                <p className={styles.caseStudyText}>{project.challenge}</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <div className={styles.caseStudyCard}>
                <div className={styles.caseStudyIcon} style={{ background: `${project.color}18`, color: project.color }}>02</div>
                <h3 className={styles.caseStudyHeading}>Our Solution</h3>
                <p className={styles.caseStudyText}>{project.solution}</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className={styles.caseStudyCard}>
                <div className={styles.caseStudyIcon} style={{ background: `${project.color}18`, color: project.color }}>03</div>
                <h3 className={styles.caseStudyHeading}>The Result</h3>
                <p className={styles.caseStudyText}>{project.result}</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className={`section ${styles.featuresSection}`}>
        <div className="container">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">What We Built</span>
              <h2 className="section-title">Key Features</h2>
            </div>
          </AnimatedSection>
          <div className={styles.featuresGrid}>
            {project.features.map((feature, i) => (
              <AnimatedSection key={feature} delay={i * 0.06}>
                <motion.div className={styles.featureCard} whileHover={{ y: -4 }}>
                  <span className={styles.featureNumber} style={{ color: project.color }}>{String(i + 1).padStart(2, '0')}</span>
                  <p className={styles.featureText}>{feature}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      {project.testimonial && (
        <section className="section">
          <div className="container">
            <AnimatedSection>
              <figure
                style={{
                  maxWidth: '760px',
                  margin: '0 auto',
                  textAlign: 'center',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '1rem',
                  padding: '2.5rem 2rem',
                }}
              >
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  {Array.from({ length: project.testimonial.rating }).map((_, i) => (
                    <Star key={i} size={20} fill="#fbbf24" color="#fbbf24" />
                  ))}
                </div>
                <blockquote
                  style={{
                    fontSize: '1.25rem',
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                    fontStyle: 'italic',
                    margin: 0,
                  }}
                >
                  &ldquo;{project.testimonial.quote}&rdquo;
                </blockquote>
                <figcaption style={{ marginTop: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {project.testimonial.author}
                  {project.testimonial.source && (
                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Verified {project.testimonial.source} review
                    </span>
                  )}
                </figcaption>
              </figure>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className={`section ${styles.ctaSection}`}>
        <div className="container">
          <AnimatedSection>
            <div className={styles.ctaCard}>
              <h2 className={styles.ctaTitle}>Have a similar project in mind?</h2>
              <p className={styles.ctaDesc}>
                Let's discuss how we can bring your idea to life with the right technology stack.
              </p>
              <Link href="/contact" className={styles.ctaButton}>
                Get In Touch <ArrowRight size={18} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Navigation */}
      <section className={styles.navSection}>
        <div className="container">
          <div className={styles.projectNav}>
            {prevProject ? (
              <Link href={`/portfolio/${prevProject.slug}`} className={styles.navLink}>
                <ArrowLeft size={16} />
                <div>
                  <span className={styles.navLabel}>Previous Project</span>
                  <span className={styles.navTitle}>{prevProject.title}</span>
                </div>
              </Link>
            ) : <div />}
            {nextProject ? (
              <Link href={`/portfolio/${nextProject.slug}`} className={`${styles.navLink} ${styles.navLinkNext}`}>
                <div>
                  <span className={styles.navLabel}>Next Project</span>
                  <span className={styles.navTitle}>{nextProject.title}</span>
                </div>
                <ArrowRight size={16} />
              </Link>
            ) : <div />}
          </div>
        </div>
      </section>
    </>
  );
}
