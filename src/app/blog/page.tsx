'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';
import SpotlightCard from '@/components/SpotlightCard';
import MagneticButton from '@/components/MagneticButton';
import FloatingParticles from '@/components/FloatingParticles';
import styles from './blog.module.css';

const featured = {
  title: 'The Future of AI in Web Development: 2024 and Beyond',
  excerpt: 'Explore how artificial intelligence is reshaping the web development landscape, from automated coding to intelligent user experiences.',
  date: 'Mar 15, 2024',
  category: 'AI & Technology',
  readTime: '8 min read',
  image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85',
};

const posts = [
  {
    title: 'Building Scalable React Applications with Next.js 15',
    excerpt: 'Learn architectural patterns and best practices for building enterprise-grade React applications.',
    date: 'Mar 10, 2024',
    category: 'Web Development',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Mobile-First Design: Why It Matters More Than Ever',
    excerpt: 'With mobile traffic dominating the web, discover why mobile-first design is no longer optional.',
    date: 'Mar 5, 2024',
    category: 'Design',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Machine Learning for Business: A Practical Guide',
    excerpt: 'How to identify ML opportunities in your business and implement solutions that deliver ROI.',
    date: 'Feb 28, 2024',
    category: 'AI & ML',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1488229297570-58520851e868?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'The Rise of Progressive Web Apps',
    excerpt: 'PWAs are bridging the gap between web and native apps. Here\'s what you need to know.',
    date: 'Feb 20, 2024',
    category: 'Web Development',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Cybersecurity Best Practices for Startups',
    excerpt: 'Essential security measures every startup should implement from day one.',
    date: 'Feb 15, 2024',
    category: 'Security',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Optimizing React Performance: Advanced Techniques',
    excerpt: 'Deep-dive into code splitting, memoization, and rendering optimizations for React apps.',
    date: 'Feb 10, 2024',
    category: 'Web Development',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
  },
];

export default function BlogPage() {
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
              <Link href="#" className={styles.featuredPost}>
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
                <span className={styles.readMore}>Read Article →</span>
              </Link>
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
                  <Link href="#" className={styles.postCard}>
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
                    <span className={styles.postDate}>{post.date}</span>
                  </Link>
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
            <div className={styles.newsletter}>
              <input type="email" placeholder="Enter your email" className={styles.newsletterInput} />
              <MagneticButton>
                <button className="btn btn-primary">Subscribe</button>
              </MagneticButton>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
