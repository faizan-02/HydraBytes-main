'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import MagneticButton from '@/components/MagneticButton';
import FloatingParticles from '@/components/FloatingParticles';
import { GlowingEffect } from '@/components/ui/grid-glow-effect-purple-blue';
import { TextScramble } from '@/components/ui/text-scramble';
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
    title: 'Building a 3-Class Lung Cancer Image Classifier with TensorFlow and Flask',
    excerpt: 'A walkthrough of how we built a CNN-based lung cancer image classifier that distinguishes Adenocarcinoma, Benign, and Squamous Cell Carcinoma tissue, wrapped in a Flask API with a clean upload interface.',
    date: 'Apr 14, 2026',
    category: 'AI & ML',
    readTime: '6 min read',
    image: '/blog-lung-cancer.png',
    url: 'https://dev.to/thehydrabytes/building-a-3-class-lung-cancer-image-classifier-with-tensorflow-and-flask-4615',
  },
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

function BlogPostCard({ post }: { post: typeof posts[number] }) {
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => setHovered(true), 200);
  };
  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setHovered(false);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const hasUrl = 'url' in post && post.url;

  const cardContent = (
    <>
      <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <Image
          src={post.image}
          alt={post.title}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 350px"
        />
        {!hasUrl && (
          <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(10,10,18,0.75)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', backdropFilter: 'blur(8px)' }}>Coming Soon</div>
        )}
      </div>
      <div className={styles.postMeta}>
        <span className={styles.postCategory}>{post.category}</span>
        <span className={styles.postDate}>{post.readTime}</span>
      </div>
      <h3 className={styles.postTitle}>{post.title}</h3>
      <p className={styles.postExcerpt}>{post.excerpt}</p>
      {hasUrl ? (
        <span
          className={styles.readMore}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.9)',
            transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <TextScramble text="READ FULL ARTICLE" trigger={hovered} speed={25} />
          <ArrowRight size={14} style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(-6px)', transition: 'opacity 0.3s ease 0.1s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s' }} />
        </span>
      ) : (
        <span className={styles.postDate}>{post.date}</span>
      )}
    </>
  );

  return (
    <div
      style={{ position: 'relative', borderRadius: '1rem', height: '100%' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <GlowingEffect
        spread={40}
        glow
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
        variant="blue-purple"
        blur={0}
        movementDuration={1.5}
      />
      <div style={{
        borderRadius: '1rem',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        height: '100%',
      }}>
        {hasUrl ? (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.postCard}
            aria-label={`Read article: ${post.title}`}
            style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit', cursor: 'pointer', height: '100%' }}
          >
            {cardContent}
          </a>
        ) : (
          <div className={styles.postCard} style={{ cursor: 'default', height: '100%' }}>
            {cardContent}
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedCard({ post }: { post: typeof featured }) {
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => setHovered(true), 200);
  };
  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setHovered(false);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div
      style={{ position: 'relative', borderRadius: '1rem' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <GlowingEffect
        spread={40}
        glow
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
        variant="blue-purple"
        blur={0}
        movementDuration={1.5}
      />
      <div style={{
        borderRadius: '1rem',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
      }}>
        <div className={styles.featuredPost}>
          <div style={{ position: 'relative', width: '100%', height: '280px', overflow: 'hidden', borderRadius: '0.75rem', marginBottom: '1.75rem' }}>
            <Image
              src={post.image}
              alt={post.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 900px"
              priority
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,18,0.85) 0%, transparent 60%)' }} />
          </div>
          <div className={styles.featuredMeta}>
            <span className={styles.featuredCategory}>{post.category}</span>
            <span className={styles.featuredDate}>{post.date} · {post.readTime}</span>
          </div>
          <h2 className={styles.featuredTitle}>{post.title}</h2>
          <p className={styles.featuredExcerpt}>{post.excerpt}</p>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Read full article: ${post.title}`}
            className={styles.readMore}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.9)',
              transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <TextScramble text="READ FULL ARTICLE" trigger={hovered} speed={25} />
            <ArrowRight size={16} style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(-6px)', transition: 'opacity 0.3s ease 0.1s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s' }} />
          </a>
        </div>
      </div>
    </div>
  );
}

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
            <FeaturedCard post={featured} />
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
                <BlogPostCard post={post} />
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
            <form className={styles.newsletter} onSubmit={handleSubscribe} aria-label="Newsletter subscription">
              <input
                type="email"
                placeholder="Enter your email"
                aria-label="Email address for newsletter"
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
