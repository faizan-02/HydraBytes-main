'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/grid-glow-effect-purple-blue';

interface GalleryItem {
  title: string;
  category: string;
  desc: string;
  tech: string[];
  color: string;
  image: string;
  objectPosition?: string;
}

interface CircularGalleryProps {
  items: GalleryItem[];
}

function useResponsiveValues() {
  const [values, setValues] = useState({ cardW: 520, cardH: 620, radius: 700, viewH: 680, isMobile: false });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) {
        setValues({ cardW: Math.min(w - 60, 290), cardH: 500, radius: 320, viewH: 550, isMobile: true });
      } else if (w < 768) {
        setValues({ cardW: Math.min(w - 60, 340), cardH: 540, radius: 400, viewH: 590, isMobile: true });
      } else if (w < 1024) {
        setValues({ cardW: 420, cardH: 580, radius: 520, viewH: 640, isMobile: false });
      } else if (w < 1440) {
        setValues({ cardW: 480, cardH: 600, radius: 650, viewH: 660, isMobile: false });
      } else {
        setValues({ cardW: 520, cardH: 620, radius: 700, viewH: 680, isMobile: false });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return values;
}

function GalleryCard({ item, cardH, isMobile }: { item: GalleryItem; cardH: number; isMobile: boolean }) {
  const br = isMobile ? '16px' : '20px';
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ position: 'relative', borderRadius: br, height: `${cardH}px` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!isMobile && (
        <GlowingEffect
          spread={40}
          glow
          disabled={false}
          proximity={80}
          inactiveZone={0.01}
          borderWidth={2}
          variant="blue-purple"
          blur={0}
          movementDuration={1.5}
        />
      )}
      <div
        style={{
          borderRadius: br,
          overflow: 'hidden',
          background: 'var(--bg-secondary, #12121e)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: isMobile ? '45%' : '50%', flexShrink: 0, overflow: 'hidden' }}>
          <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover', objectPosition: item.objectPosition || 'center' }} sizes={isMobile ? '300px' : '520px'} />
        </div>

        <div style={{ padding: isMobile ? '1rem 1.15rem' : '1.5rem 2rem', display: 'flex', flexDirection: 'column', flex: 1, gap: isMobile ? '0.5rem' : '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}`, flexShrink: 0 }} />
            <span style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)' }}>{item.category}</span>
          </div>

          <h3 style={{ fontSize: isMobile ? '1rem' : '1.35rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, fontFamily: 'var(--font-heading)' }}>{item.title}</h3>

          <p style={{ fontSize: isMobile ? '0.75rem' : '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.desc}</p>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {item.tech.map((t) => (
                <span key={t} style={{ padding: '0.25rem 0.7rem', borderRadius: '6px', fontSize: isMobile ? '0.55rem' : '0.65rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-glass)' }}>{t}</span>
              ))}
            </div>

            <Link
              href="/portfolio"
              style={{
                fontSize: isMobile ? '0.7rem' : '0.82rem',
                fontWeight: 600,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                opacity: hovered ? 1 : 0,
                transform: hovered ? 'translateY(0)' : 'translateY(6px)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
              }}
            >
              VIEW DETAILS <ArrowRight size={isMobile ? 12 : 14} style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(-4px)', transition: 'opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s' }} />
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
      const opacity = Math.max(0.35, 0.55 + 0.45 * cosVal);
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
        targetRotationRef.current += delta * 6;
      }

      const diff = targetRotationRef.current - rotationRef.current;
      rotationRef.current += diff * Math.min(1, delta * 4);

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

  const arrowStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${viewH / 2}px`,
    transform: 'translateY(-50%)',
    zIndex: 400,
    width: isMobile ? '40px' : '52px',
    height: isMobile ? '40px' : '52px',
    borderRadius: '50%',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  };

  return (
    <div
      onMouseEnter={() => { isHoveringRef.current = true; }}
      onMouseLeave={() => { isHoveringRef.current = false; }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative', width: '100%', touchAction: 'pan-y' }}
    >
      {/* Left arrow */}
      <button
        onClick={() => navigate(-1)}
        aria-label="Previous project"
        style={{ ...arrowStyle, left: isMobile ? '6px' : '16px' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.boxShadow = '0 0 25px var(--accent-glow)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <ChevronLeft size={isMobile ? 18 : 24} strokeWidth={1.8} />
      </button>

      {/* Right arrow */}
      <button
        onClick={() => navigate(1)}
        aria-label="Next project"
        style={{ ...arrowStyle, right: isMobile ? '6px' : '16px' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.boxShadow = '0 0 25px var(--accent-glow)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <ChevronRight size={isMobile ? 18 : 24} strokeWidth={1.8} />
      </button>

      <div
        style={{
          position: 'relative',
          height: `${viewH}px`,
          marginLeft: isMobile ? '0px' : '80px',
          marginRight: isMobile ? '0px' : '80px',
          perspective: isMobile ? '1200px' : '2000px',
          perspectiveOrigin: '50% 50%',
          overflow: 'hidden',
          maskImage: 'linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)',
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

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: isMobile ? '0.75rem' : '1.5rem' }}>
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goToItem(i)}
            style={{ width: i === activeIndex ? '28px' : '8px', height: '8px', borderRadius: '999px', border: 'none', background: i === activeIndex ? 'var(--accent-primary)' : 'var(--border-color-hover)', cursor: 'pointer', transition: 'all 0.35s ease', opacity: i === activeIndex ? 1 : 0.5 }}
            aria-label={`Go to project ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
