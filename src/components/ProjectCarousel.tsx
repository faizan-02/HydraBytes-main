'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface Project {
  title: string;
  category: string;
  desc: string;
  tech: string[];
  color: string;
  image: string;
}

interface ProjectCarouselProps {
  projects: Project[];
}

export default function ProjectCarousel({ projects }: ProjectCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const total = projects.length;

  const go = useCallback((dir: number) => {
    setDirection(dir);
    setCurrent((prev) => (prev + dir + total) % total);
  }, [total]);

  useEffect(() => {
    const interval = setInterval(() => go(1), 5000);
    return () => clearInterval(interval);
  }, [go]);

  const getIndex = (offset: number) => (current + offset + total) % total;

  const positions = [
    { x: '-65%', z: -200, rotateY: 25, opacity: 0.5, scale: 0.8 },
    { x: '-30%', z: -80, rotateY: 12, opacity: 0.7, scale: 0.9 },
    { x: '0%', z: 0, rotateY: 0, opacity: 1, scale: 1 },
    { x: '30%', z: -80, rotateY: -12, opacity: 0.7, scale: 0.9 },
    { x: '65%', z: -200, rotateY: -25, opacity: 0.5, scale: 0.8 },
  ];

  const visibleIndices = [-2, -1, 0, 1, 2].map(
    (offset) => getIndex(offset)
  );

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Carousel */}
      <div
        style={{
          position: 'relative',
          height: '520px',
          perspective: '1200px',
          perspectiveOrigin: '50% 40%',
          overflow: 'visible',
        }}
      >
        <AnimatePresence initial={false}>
          {visibleIndices.map((projectIndex, posIndex) => {
            const project = projects[projectIndex];
            const pos = positions[posIndex];
            const isCurrent = posIndex === 2;

            return (
              <motion.div
                key={`${projectIndex}-${posIndex}`}
                initial={{
                  x: direction > 0 ? '80%' : '-80%',
                  opacity: 0,
                  scale: 0.7,
                  rotateY: direction > 0 ? -30 : 30,
                }}
                animate={{
                  x: pos.x,
                  opacity: isInView ? pos.opacity : 0,
                  scale: pos.scale,
                  rotateY: pos.rotateY,
                  z: pos.z,
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '380px',
                  maxWidth: '85vw',
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center center',
                  marginLeft: '-190px',
                  marginTop: '-240px',
                  zIndex: isCurrent ? 10 : 5 - Math.abs(posIndex - 2),
                  cursor: isCurrent ? 'default' : 'pointer',
                  pointerEvents: isCurrent ? 'auto' : 'auto',
                }}
                onClick={() => {
                  if (posIndex < 2) go(-1);
                  if (posIndex > 2) go(1);
                }}
              >
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: isCurrent
                      ? `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${project.color}15`
                      : '0 8px 30px rgba(0,0,0,0.3)',
                    transition: 'box-shadow 0.3s ease',
                  }}
                >
                  {/* Project image */}
                  <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="400px"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(to top, var(--bg-primary) 0%, transparent 60%)`,
                      }}
                    />
                  </div>

                  {/* Card content */}
                  <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                    {/* Category badge */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.25rem 0.7rem',
                        borderRadius: '999px',
                        border: `1px solid ${project.color}30`,
                        background: `${project.color}10`,
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: project.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: project.color,
                        }}
                      />
                      {project.category}
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                        marginBottom: '0.6rem',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {project.desc}
                    </p>

                    {/* Tech tags */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.4rem',
                        marginBottom: '1rem',
                      }}
                    >
                      {project.tech.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                            letterSpacing: '0.01em',
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* View details */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <div
                          style={{
                            width: '24px',
                            height: '2px',
                            background: project.color,
                            borderRadius: '1px',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}
                        >
                          VIEW
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: project.color,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        VIEW DETAILS
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous project"
        style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'all 0.25s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color-hover)';
          e.currentTarget.style.background = 'var(--bg-card-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.background = 'var(--bg-card)';
        }}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={() => go(1)}
        aria-label="Next project"
        style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'all 0.25s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color-hover)';
          e.currentTarget.style.background = 'var(--bg-card-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.background = 'var(--bg-card)';
        }}
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots indicator */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '1.5rem',
        }}
      >
        {projects.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            aria-label={`Go to project ${i + 1}`}
            style={{
              width: i === current ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === current ? 'var(--accent-primary)' : 'var(--border-color-hover)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* View All Projects */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
        <Link
          href="/portfolio"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            borderRadius: '9999px',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color-hover)',
            color: 'var(--text-primary)',
            fontSize: '0.88rem',
            fontWeight: 600,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            transition: 'all 0.3s ease',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.background = 'var(--accent-glow)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color-hover)';
            e.currentTarget.style.background = 'var(--bg-glass)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          View All Projects
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
