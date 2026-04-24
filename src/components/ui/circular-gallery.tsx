'use client';

import React, { useRef, useState, useCallback, useEffect, MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/grid-glow-effect-purple-blue';

interface GalleryItem {
  title: string;
  category: string;
  desc: string;
  tech: string[];
  color: string;
  image: string;
}

interface CircularGalleryProps {
  items: GalleryItem[];
}

function useResponsiveValues() {
  const [values, setValues] = useState({ cardW: 360, cardH: 520, radius: 520, viewH: 580, isMobile: false });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) {
        setValues({ cardW: 280, cardH: 500, radius: 300, viewH: 550, isMobile: true });
      } else if (w < 768) {
        setValues({ cardW: 320, cardH: 510, radius: 370, viewH: 560, isMobile: true });
      } else if (w < 1024) {
        setValues({ cardW: 340, cardH: 520, radius: 440, viewH: 570, isMobile: false });
      } else {
        setValues({ cardW: 360, cardH: 520, radius: 520, viewH: 580, isMobile: false });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return values;
}

const GLOW_CSS = `
@property --gc-hue { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --gc-rotate { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --gc-glow-ty { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --gc-glow-blur { syntax: "<number>"; inherits: true; initial-value: 6; }
@property --gc-glow-opacity { syntax: "<number>"; inherits: true; initial-value: 0.7; }
@property --gc-glow-scale { syntax: "<number>"; inherits: true; initial-value: 1.5; }
@property --gc-glow-radius { syntax: "<number>"; inherits: true; initial-value: 100; }

.gc-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.gc-glow-orb {
  display: block;
  position: absolute;
  width: 80px;
  height: 80px;
  left: 50%;
  top: 50%;
  margin-left: -40px;
  margin-top: -40px;
  z-index: 0;
  pointer-events: none;
  animation: gc-orbit 5s linear infinite;
  transform: rotateZ(calc(var(--gc-rotate) * 1deg));
  transform-origin: center;
  border-radius: calc(var(--gc-glow-radius) * 10vw);
}

.gc-glow-orb::after {
  content: "";
  display: block;
  position: relative;
  width: 130%;
  height: 130%;
  left: -15%;
  top: -15%;
  z-index: -1;
  filter: blur(calc(var(--gc-glow-blur) * 10px));
  background: hsl(calc(var(--gc-hue) * 1deg) 100% 60%);
  border-radius: calc(var(--gc-glow-radius) * 10vw);
  animation: gc-hue 5s linear infinite;
  transform: scaleX(calc(var(--gc-glow-scale) * 1.3))
             scaleY(calc(var(--gc-glow-scale) / 1.1))
             translateY(calc(var(--gc-glow-ty) * 1%));
  opacity: var(--gc-glow-opacity);
  transition: filter 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
}

.gc-wrap:hover .gc-glow-orb {
  --gc-glow-blur: 2;
  --gc-glow-opacity: 0.85;
  --gc-glow-scale: 2.8;
  --gc-glow-radius: 0;
  animation-play-state: paused;
}

.gc-wrap:hover .gc-glow-orb::after {
  --gc-glow-ty: 0;
  animation-play-state: paused;
  transition: --gc-glow-ty 0s ease, --gc-glow-blur 0.1s ease,
              --gc-glow-opacity 0.1s ease, --gc-glow-scale 0.1s ease,
              --gc-glow-radius 0.1s ease;
}

.gc-card-face {
  position: relative;
  z-index: 2;
}

.gc-card-face:hover .gc-spotlight {
  opacity: 1 !important;
}

@keyframes gc-orbit {
  from { --gc-rotate: -70; --gc-glow-ty: -65; }
  25% { --gc-glow-ty: -65; }
  50% { --gc-glow-ty: -65; }
  75% { --gc-glow-ty: -65; }
  to { --gc-rotate: 290; --gc-glow-ty: -65; }
}

@keyframes gc-hue {
  from { --gc-hue: 0; }
  to { --gc-hue: 360; }
}

@media (max-width: 768px) {
  .gc-glow-orb { display: none; }
}
`;

function GalleryCard({ item, cardH, isMobile }: { item: GalleryItem; cardH: number; isMobile: boolean }) {
  const innerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const el = innerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -6;
    const rotateY = ((x - cx) / cx) * 6;
    el.style.setProperty('--spotlight-x', `${x}px`);
    el.style.setProperty('--spotlight-y', `${y}px`);
    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    el.style.borderColor = `${item.color}60`;
    el.style.boxShadow = `0 25px 60px rgba(0,0,0,0.15), 0 0 40px ${item.color}15`;
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    const el = innerRef.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.borderColor = `${item.color}20`;
    el.style.boxShadow = `0 15px 40px rgba(0,0,0,0.08), 0 0 20px ${item.color}08`;
  };

  return (
    <div className="gc-wrap">
      {!isMobile && <span className="gc-glow-orb" />}

      <div
        ref={innerRef}
        className="gc-card-face"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          borderRadius: isMobile ? '16px' : '20px',
          overflow: 'hidden',
          background: 'var(--bg-secondary, #12121e)',
          border: `1px solid ${item.color}20`,
          boxShadow: `0 15px 40px rgba(0,0,0,0.25), 0 0 20px ${item.color}08`,
          display: 'flex',
          flexDirection: 'column',
          height: `${cardH}px`,
          transition: 'transform 0.15s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {!isMobile && (
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
        )}

        <div
          className="gc-spotlight"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 0.4s ease',
            background: `radial-gradient(600px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), ${item.color}20, transparent 40%)`,
            zIndex: 1,
            borderRadius: 'inherit',
          }}
        />

        <div style={{ position: 'relative', width: '100%', height: isMobile ? '45%' : '55%', flexShrink: 0, overflow: 'hidden', zIndex: 2 }}>
          <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} sizes={isMobile ? '300px' : '420px'} />
        </div>

        <div style={{ position: 'relative', zIndex: 2, padding: isMobile ? '1rem 1.15rem' : '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}`, flexShrink: 0 }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)' }}>{item.category}</span>
          </div>

          <h3 style={{ fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, fontFamily: 'var(--font-heading)' }}>{item.title}</h3>

          <p style={{ fontSize: isMobile ? '0.75rem' : '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.desc}</p>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {item.tech.map((t) => (
                <span key={t} style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-glass)' }}>{t}</span>
              ))}
            </div>

            <Link
              href="/portfolio"
              style={{ fontSize: '0.78rem', fontWeight: 600, color: item.color, display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap', flexShrink: 0, transition: 'opacity 0.2s', opacity: 0.8 }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8'; }}
            >
              VIEW DETAILS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CircularGallery({ items }: CircularGalleryProps) {
  const total = items.length;
  const anglePerItem = 360 / total;
  const { cardW, cardH, radius, viewH, isMobile } = useResponsiveValues();

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isHoveringRef = useRef(false);
  const rotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const prevActiveRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Touch swipe support
  const touchStartRef = useRef<{ x: number; time: number } | null>(null);
  const touchDeltaRef = useRef(0);

  const updateCards = useCallback(() => {
    const rot = rotationRef.current;

    cardRefs.current.forEach((card, i) => {
      if (!card) return;

      const angle = i * anglePerItem;
      const effectiveAngle = ((angle - rot) % 360 + 360) % 360;
      const normalizedAngle = effectiveAngle > 180 ? 360 - effectiveAngle : effectiveAngle;

      card.style.transform = `rotateY(${angle - rot}deg) translateZ(${radius}px)`;

      const cosVal = Math.cos(normalizedAngle * Math.PI / 180);
      const opacity = Math.max(0.25, 0.5 + 0.5 * cosVal);
      card.style.opacity = String(opacity);
      card.style.zIndex = String(Math.round(200 + 200 * cosVal));
      card.style.pointerEvents = normalizedAngle < 45 ? 'auto' : 'none';
    });

    const rawIndex = Math.round(((rot % 360 + 360) % 360) / anglePerItem) % total;
    const newActive = ((rawIndex % total) + total) % total;
    if (newActive !== prevActiveRef.current) {
      prevActiveRef.current = newActive;
      setActiveIndex(newActive);
    }
  }, [anglePerItem, radius, total]);

  useEffect(() => {
    updateCards();

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (!isHoveringRef.current && !touchStartRef.current) {
        targetRotationRef.current += delta * 12;
      }

      const diff = targetRotationRef.current - rotationRef.current;
      rotationRef.current += diff * Math.min(1, delta * 5);

      updateCards();
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animRef.current);
      lastTimeRef.current = 0;
    };
  }, [updateCards]);

  const goToItem = useCallback(
    (targetIndex: number) => {
      const targetAngle = targetIndex * anglePerItem;
      const currentMod = ((rotationRef.current % 360) + 360) % 360;
      let diff = targetAngle - currentMod;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      targetRotationRef.current = rotationRef.current + diff;
    },
    [anglePerItem],
  );

  const navigate = useCallback(
    (dir: number) => {
      targetRotationRef.current += dir * anglePerItem;
    },
    [anglePerItem],
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, time: Date.now() };
    touchDeltaRef.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const rotDelta = dx * -0.3;
    targetRotationRef.current += rotDelta - touchDeltaRef.current;
    touchDeltaRef.current = rotDelta;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;
    const elapsed = Date.now() - touchStartRef.current.time;
    const velocity = touchDeltaRef.current / Math.max(elapsed, 1);

    if (Math.abs(velocity) > 0.15) {
      targetRotationRef.current += velocity * 120;
    } else {
      const currentMod = ((targetRotationRef.current % 360) + 360) % 360;
      const nearest = Math.round(currentMod / anglePerItem) * anglePerItem;
      const diff = nearest - currentMod;
      targetRotationRef.current += diff > 180 ? diff - 360 : diff < -180 ? diff + 360 : diff;
    }

    touchStartRef.current = null;
    touchDeltaRef.current = 0;
  }, [anglePerItem]);

  return (
    <div
      onMouseEnter={() => { isHoveringRef.current = true; }}
      onMouseLeave={() => { isHoveringRef.current = false; }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative', width: '100%', touchAction: 'pan-y' }}
    >
      <style dangerouslySetInnerHTML={{ __html: GLOW_CSS }} />

      <div
        style={{
          position: 'relative',
          height: `${viewH}px`,
          perspective: isMobile ? '1200px' : '1800px',
          perspectiveOrigin: '50% 50%',
          overflow: 'hidden',
          maskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transform: `translateZ(${-radius}px)`,
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.title}
              ref={(el) => { cardRefs.current[i] = el; }}
              onClick={() => {
                const rot = rotationRef.current;
                const angle = i * anglePerItem;
                const ea = ((angle - rot) % 360 + 360) % 360;
                const na = ea > 180 ? 360 - ea : ea;
                if (na > 10) goToItem(i);
              }}
              style={{
                position: 'absolute',
                width: `${cardW}px`,
                left: '50%',
                top: '50%',
                marginLeft: `${-cardW / 2}px`,
                marginTop: `${-cardH / 2}px`,
                willChange: 'transform, opacity',
                cursor: 'pointer',
                backfaceVisibility: 'visible',
              }}
            >
              <GalleryCard item={item} cardH={cardH} isMobile={isMobile} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? '1rem' : '1.5rem', marginTop: isMobile ? '1rem' : '2rem' }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Previous project"
          style={{ width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.25s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.boxShadow = '0 0 25px var(--accent-glow)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <ChevronLeft size={isMobile ? 18 : 22} strokeWidth={1.8} />
        </button>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goToItem(i)}
              style={{ width: i === activeIndex ? '28px' : '8px', height: '8px', borderRadius: '999px', border: 'none', background: i === activeIndex ? 'var(--accent-primary)' : 'var(--border-color-hover)', cursor: 'pointer', transition: 'all 0.35s ease', opacity: i === activeIndex ? 1 : 0.5 }}
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => navigate(1)}
          aria-label="Next project"
          style={{ width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.25s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.boxShadow = '0 0 25px var(--accent-glow)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <ChevronRight size={isMobile ? 18 : 22} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
