'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';
import SpotlightCard from '@/components/SpotlightCard';
import MagneticButton from '@/components/MagneticButton';
import FloatingParticles from '@/components/FloatingParticles';
import styles from './about.module.css';

const team = [
  { name: 'Alex Rivera', role: 'CEO & Founder', initials: 'AR', color: '#7c3aed' },
  { name: 'Priya Sharma', role: 'CTO', initials: 'PS', color: '#00e5ff' },
  { name: 'James Chen', role: 'Lead Designer', initials: 'JC', color: '#f472b6' },
  { name: 'Sarah Kim', role: 'AI Lead', initials: 'SK', color: '#22c55e' },
];

const values = [
  { icon: '💡', title: 'Innovation First', desc: 'We push boundaries, embracing emerging technologies to deliver solutions ahead of the curve.' },
  { icon: '🤝', title: 'Client Partnership', desc: 'Your success is our success. We build lasting relationships through transparency and trust.' },
  { icon: '🎯', title: 'Excellence Always', desc: 'Every line of code, every pixel, every interaction is crafted to the highest standard.' },
  { icon: '🌍', title: 'Global Impact', desc: 'We build technology that scales globally and creates positive change in the world.' },
];

const timeline = [
  { year: '2021', title: 'Founded', desc: 'HydraBytes was born from a vision to make premium tech accessible to growing businesses.' },
  { year: '2022', title: 'Team Growth', desc: 'Expanded to 15+ specialists across engineering, design, and AI research.' },
  { year: '2023', title: '100+ Projects', desc: 'Reached milestone of 100+ successful project deliveries across three continents.' },
  { year: '2024', title: 'AI Division', desc: 'Launched our dedicated AI & ML division, serving enterprise clients worldwide.' },
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
              <div className={styles.missionStats}>
                <SpotlightCard>
                  <div className={styles.missionStat}>
                    <span className={styles.missionStatValue}>4+</span>
                    <span className={styles.missionStatLabel}>Years of Innovation</span>
                  </div>
                </SpotlightCard>
                <SpotlightCard>
                  <div className={styles.missionStat}>
                    <span className={styles.missionStatValue}>25+</span>
                    <span className={styles.missionStatLabel}>Team Members</span>
                  </div>
                </SpotlightCard>
                <SpotlightCard>
                  <div className={styles.missionStat}>
                    <span className={styles.missionStatValue}>12</span>
                    <span className={styles.missionStatLabel}>Countries Served</span>
                  </div>
                </SpotlightCard>
                <SpotlightCard>
                  <div className={styles.missionStat}>
                    <span className={styles.missionStatValue}>150+</span>
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
              <AnimatedSection key={v.title} delay={i * 0.1}>
                <SpotlightCard>
                  <div className={styles.valueCard}>
                    <span className={styles.valueIcon}>{v.icon}</span>
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
                    <div className={styles.teamAvatar} style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}88)` }}>
                      {member.initials}
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
