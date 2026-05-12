'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lightbulb, Users, Star, Globe } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import SpotlightCard from '@/components/SpotlightCard';
import MagneticButton from '@/components/MagneticButton';
import FloatingParticles from '@/components/FloatingParticles';
import styles from './about.module.css';

const team = [
  { name: 'Faizan Jawad', role: 'CEO & Founder', initials: 'FJ', color: '#0891b2' },
  { name: 'Asad Ali Khan', role: 'Co-Founder', initials: 'AA', color: '#00e5ff' },
  { name: 'Suhayb Saleem', role: 'Lead Designer', initials: 'SS', color: '#f472b6' },
  { name: 'Haris Munir', role: 'AI Lead', initials: 'HM', color: '#22c55e' },
  { name: 'Muhammad Usman', role: 'Mobile App Developer', initials: 'MU', color: '#f59e0b' },
  { name: 'Umair Khan', role: 'Web Developer', initials: 'UK', color: '#38bdf8' },
];

const values = [
  { icon: Lightbulb, color: '#0891b2', title: 'Innovation First', desc: 'We push boundaries, embracing emerging technologies to deliver solutions ahead of the curve.' },
  { icon: Users, color: '#00e5ff', title: 'Client Partnership', desc: 'Your success is our success. We build lasting relationships through transparency and trust.' },
  { icon: Star, color: '#f472b6', title: 'Excellence Always', desc: 'Every line of code, every pixel, every interaction is crafted to the highest standard.' },
  { icon: Globe, color: '#22c55e', title: 'Global Impact', desc: 'We build technology that scales globally and creates positive change in the world.' },
];

const timeline = [
  { year: '2024', title: 'Founded', desc: 'HydraBytes was born from a vision to make premium tech accessible to growing businesses.' },
  { year: '2024', title: 'Core Team', desc: 'Assembled our founding team across engineering, design, and AI. Delivered our first client projects.' },
  { year: '2025', title: 'Growing Portfolio', desc: 'Expanded our client base across web development, mobile apps, and AI solutions in Pakistan and beyond.' },
  { year: '2025', title: 'AI Division', desc: 'Launched our dedicated AI & ML division, helping clients automate processes and build intelligent products.' },
];

export default function AboutPage() {
  return (
    <>
      <section className={styles.hero} style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingParticles />
        <div className="container">
          <AnimatedSection>
            <span className="section-label">About Us</span>
            <h1 className={styles.heroTitle}>
              Building Tomorrow&apos;s <span className="gradient-text">Technology</span> Today
            </h1>
            <p className={styles.heroSubtitle}>
              We&apos;re a team of passionate engineers, designers, and innovators
              dedicated to transforming businesses through technology.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission */}
      <section className="section">
        <div className="container">
          <div className={styles.missionGrid}>
            <AnimatedSection direction="left">
              <div className={styles.missionContent}>
                <span className="section-label">Our Mission</span>
                <h2 className={styles.missionTitle}>Empowering Businesses Through Innovation</h2>
                <p className={styles.missionDesc}>
                  At HydraBytes, we believe every business deserves access to world-class
                  technology. We bridge the gap between cutting-edge innovation and practical
                  business solutions, delivering products that are beautiful, performant,
                  and built to scale.
                </p>
                <p className={styles.missionDesc}>
                  Our approach combines deep technical expertise with a genuine understanding
                  of business challenges, ensuring every solution we build creates measurable impact.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection direction="right" delay={0.15}>
              <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '1rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <Image
                  src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=1200&q=90"
                  alt="HydraBytes team collaborating"
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,180,216,0.35), rgba(0,229,255,0.15))' }} />
              </div>
              <div className={styles.missionStats}>
                <SpotlightCard>
                  <div className={styles.missionStat}>
                    <span className={styles.missionStatValue}>3+</span>
                    <span className={styles.missionStatLabel}>Years of Innovation</span>
                  </div>
                </SpotlightCard>
                <SpotlightCard>
                  <div className={styles.missionStat}>
                    <span className={styles.missionStatValue}>6</span>
                    <span className={styles.missionStatLabel}>Core Team Members</span>
                  </div>
                </SpotlightCard>
                <SpotlightCard>
                  <div className={styles.missionStat}>
                    <span className={styles.missionStatValue}>5+</span>
                    <span className={styles.missionStatLabel}>Countries Served</span>
                  </div>
                </SpotlightCard>
                <SpotlightCard>
                  <div className={styles.missionStat}>
                    <span className={styles.missionStatValue}>10+</span>
                    <span className={styles.missionStatLabel}>Projects Completed</span>
                  </div>
                </SpotlightCard>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">Our Values</span>
              <h2 className="section-title">What Drives Us</h2>
            </div>
          </AnimatedSection>
          <div className={styles.valuesGrid}>
            {values.map((v, i) => (
              <AnimatedSection key={v.title} delay={i * 0.1} style={{ height: '100%' }}>
                <SpotlightCard spotlightColor={`${v.color}20`}>
                  <div className={styles.valueCard}>
                    <div
                      className={styles.valueIcon}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '14px', background: `${v.color}18`, color: v.color, marginBottom: '1rem' }}
                    >
                      <v.icon size={26} strokeWidth={1.6} />
                    </div>
                    <h3 className={styles.valueTitle}>{v.title}</h3>
                    <p className={styles.valueDesc}>{v.desc}</p>
                  </div>
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">Leadership</span>
              <h2 className="section-title">Meet Our Team</h2>
              <p className="section-subtitle">
                Talented individuals united by a shared passion for innovation.
              </p>
            </div>
          </AnimatedSection>
          <div className={styles.teamGrid}>
            {team.map((member, i) => (
              <AnimatedSection key={member.name} delay={i * 0.1}>
                <SpotlightCard spotlightColor={`${member.color}20`}>
                  <div className={styles.teamCard}>
                    <div className={styles.teamAvatar} style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}88)`, overflow: 'hidden', padding: 0 }}>
                      {(member as typeof member & { image?: string }).image ? (
                        <Image src={(member as typeof member & { image?: string }).image!} alt={member.name} width={80} height={80} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : member.initials}
                    </div>
                    <h3 className={styles.teamName}>{member.name}</h3>
                    <p className={styles.teamRole}>{member.role}</p>
                  </div>
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">Our Journey</span>
              <h2 className="section-title">The HydraBytes Story</h2>
            </div>
          </AnimatedSection>
          <div className={styles.timeline}>
            {timeline.map((item, i) => (
              <AnimatedSection key={item.year} delay={i * 0.12}>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineYear}>{item.year}</span>
                  <div className={styles.timelineDot} />
                  <SpotlightCard>
                    <div className={styles.timelineContent}>
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </SpotlightCard>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <AnimatedSection>
            <h2 className="section-title">Want to Join Our Team?</h2>
            <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
              We&apos;re always looking for talented people who share our passion.
            </p>
            <MagneticButton>
              <Link href="/contact" className="btn btn-primary">
                Get in Touch <span>→</span>
              </Link>
            </MagneticButton>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
