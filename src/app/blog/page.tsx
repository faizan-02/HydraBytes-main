'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';
import SpotlightCard from '@/components/SpotlightCard';
import MagneticButton from '@/components/MagneticButton';
import FloatingParticles from '@/components/FloatingParticles';
import styles from './blog.module.css';

const featured = {
  title: 'How We Built an AI-Powered Retinal Disease Detector',
  excerpt: 'From CNN architecture to handling imbalanced medical datasets: a technical breakdown of OptiPro, our AI system that helps clinicians detect retinal diseases from fundus images.',
  date: 'Apr 11, 2025',
  category: 'AI & ML',
  readTime: '1 min read',
  image: '/blog-optipro.png',
  url: 'https://dev.to/thehydrabytes/how-we-built-an-ai-powered-retinal-disease-detector-7fp',
};

const posts = [
  {
    title: 'Building an AI-Based Student Stress Management System with Python, ML, and RAG',
    excerpt: 'How we built a full-stack mental health platform that detects student stress, anxiety, and depression using machine learning, complete with a RAG-powered AI chatbot and appointment booking.',
    date: 'Apr 14, 2026',
    category: 'AI & ML',
    readTime: '5 min read',
    image: '/studentstressmanagement.png',
    url: 'https://dev.to/thehydrabytes/building-an-ai-based-student-stress-management-system-with-python-ml-and-rag-4nj5',
  },
  {
    title: 'Mobile-First Design: Why It Matters More Than Ever',
    excerpt: 'With mobile traffic dominating the web, discover why mobile-first design is no longer optional.',
    date: 'Mar 5, 2024',
    category: 'Design',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=85',
  },
  {
    title: 'Machine Learning for Business: A Practical Guide',
    excerpt: 'How to identify ML opportunities in your business and implement solutions that deliver ROI.',
    date: 'Feb 28, 2024',
    category: 'AI & ML',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=85',
  },
  {
    title: 'The Rise of Progressive Web Apps',
    excerpt: 'PWAs are bridging the gap between web and native apps. Here\'s what you need to know.',
    date: 'Feb 20, 2024',
    category: 'Web Development',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=85',
  },
  {
    title: 'Cybersecurity Best Practices for Startups',
    excerpt: 'Essential security measures every startup should implement from day one.',
    date: 'Feb 15, 2024',
    category: 'Security',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=85',
  },
  {
    title: 'Optimizing React Performance: Advanced Techniques',
    excerpt: 'Deep-dive into code splitting, memoization, and rendering optimizations for React apps.',
    date: 'Feb 10, 2024',
    category: 'Web Development',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=85',
  },
];

export default function BlogPage() {
  const [nlEmail, setNlEmail] = React.useState('');
  const [nlStatus, setNlStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [nlMessage, setNlMessage] = React.useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setNlStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nlEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setNlStatus('success');
        setNlMessage("You're subscribed! Check your inbox.");
        setNlEmail('');
      } else {
        setNlStatus('error');
        setNlMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setNlStatus('error');
      setNlMessage('Network error. Please try again.');
    }
  };

  return (
    <>
      <section className={styles.hero} style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingParticles />
        <div className="container">
          <AnimatedSection>
            <span className="section-label">Blog & Insights</span>
            <h1 className={styles.heroTitle}>
              Thoughts, Guides &amp; <span className="gradient-text">Insights</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Stay up-to-date with the latest in web development, AI, and digital innovation.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Featured Post */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <AnimatedSection>
            <SpotlightCard>
              <div className={styles.featuredPost}>
                <div style={{ position: 'relative', width: '100%', height: '280px', overflow: 'hidden', borderRadius: '0.75rem', marginBottom: '1.75rem' }}>
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 900px"
                    priority
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,18,0.85) 0%, transparent 60%)' }} />
                </div>
                <div className={styles.featuredMeta}>
                  <span className={styles.featuredCategory}>{featured.category}</span>
                  <span className={styles.featuredDate}>{featured.date} · {featured.readTime}</span>
                </div>
                <h2 className={styles.featuredTitle}>{featured.title}</h2>
                <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
                <a href={featured.url} target="_blank" rel="noopener noreferrer" className={styles.readMore} onMouseMove={(e) => e.stopPropagation()}>Read Full Article →</a>
              </div>
            </SpotlightCard>
          </AnimatedSection>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <AnimatedSection>
            <h2 className="section-title" style={{ marginBottom: '2rem' }}>Latest Articles</h2>
          </AnimatedSection>
          <div className={styles.postsGrid}>
            {posts.map((post, i) => (
              <AnimatedSection key={post.title} delay={i * 0.08}>
                <SpotlightCard>
                  {'url' in post && post.url ? (
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className={styles.postCard} style={{ display: 'block', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }} onMouseMove={(e) => e.stopPropagation()}>
                      <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 100vw, 350px"
                        />
                      </div>
                      <div className={styles.postMeta}>
                        <span className={styles.postCategory}>{post.category}</span>
                        <span className={styles.postDate}>{post.readTime}</span>
                      </div>
                      <h3 className={styles.postTitle}>{post.title}</h3>
                      <p className={styles.postExcerpt}>{post.excerpt}</p>
                      <span className={styles.readMore}>Read Full Article →</span>
                    </a>
                  ) : (
                    <div className={styles.postCard} style={{ cursor: 'default' }}>
                      <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 100vw, 350px"
                        />
                        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(10,10,18,0.75)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', backdropFilter: 'blur(8px)' }}>Coming Soon</div>
                      </div>
                      <div className={styles.postMeta}>
                        <span className={styles.postCategory}>{post.category}</span>
                        <span className={styles.postDate}>{post.readTime}</span>
                      </div>
                      <h3 className={styles.postTitle}>{post.title}</h3>
                      <p className={styles.postExcerpt}>{post.excerpt}</p>
                      <span className={styles.postDate}>{post.date}</span>
                    </div>
                  )}
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <AnimatedSection>
            <h2 className="section-title">Stay in the Loop</h2>
            <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
              Get the latest insights delivered to your inbox. No spam, just value.
            </p>
            <form className={styles.newsletter} onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                className={styles.newsletterInput}
                value={nlEmail}
                onChange={e => setNlEmail(e.target.value)}
                required
              />
              <MagneticButton>
                <button type="submit" className="btn btn-primary" disabled={nlStatus === 'loading'}>
                  {nlStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </MagneticButton>
            </form>
            {nlStatus === 'success' && <p style={{ color: '#22c55e', marginTop: '12px', fontSize: '14px' }}>{nlMessage}</p>}
            {nlStatus === 'error' && <p style={{ color: '#ef4444', marginTop: '12px', fontSize: '14px' }}>{nlMessage}</p>}
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
