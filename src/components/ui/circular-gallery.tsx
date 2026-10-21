'use client';

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, Check, RotateCw } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

interface GalleryReview {
  quote: string;
  author: string;
  rating: number;
  source?: string;
}

interface GalleryItem {
  title: string;
  category: string;
  desc: string;
  tech: string[];
  color: string;
  image: string;
  objectPosition?: string;
  imageFit?: 'cover' | 'contain';
  imageAspect?: string;
  badge?: { rating: number; source?: string };
  // Shown on the back of the flip card
  href?: string;
  metric?: string;
  features?: string[];
  allTech?: string[];
  review?: GalleryReview;
}

interface CircularGalleryProps {
  items: GalleryItem[];
}

// Opacity of the card directly behind the front one; cards fade smoothly toward this
const BACK_OPACITY = 0.35;
// Autoplay speed in degrees per second, and how quickly speed and position ease (per second)
const AUTO_SPEED = 6;
const SPEED_EASE = 3;
const POSITION_EASE = 5;

// Height the desktop card front's text block needs (category, two-line title, two-line
// description, one row of tags, flip hint). Desktop tags never wrap, so this is the worst case.
const CARD_TEXT_MIN_H = 238;
// Hover this long before the card flips, so sweeping the cursor across doesn't flip it
const FLIP_DELAY = 180;
// Tech chips listed on the back before collapsing the rest into "+N"
const BACK_TECH_LIMIT = 7;

// Below this many px of window height left over for the card, desktop cards stop shrinking
const MIN_DESKTOP_CARD_H = 460;
// Room the navbar and gallery padding need around the card, so the whole card fits on screen
const VERTICAL_CHROME = 165;

// Narrowest width/height ratio among fixed-aspect ('contain') images, e.g. '1200 / 896' -> 1.339
function minImageRatio(items: GalleryItem[]) {
  let min = Infinity;
  for (const item of items) {
    if (item.imageFit !== 'contain' || !item.imageAspect) continue;
    const [w, h] = item.imageAspect.split('/').map((n) => parseFloat(n));
    if (w > 0 && h > 0) min = Math.min(min, w / h);
  }
  return min;
}

// Desktop ring geometry: the viewport's side margins (room for the arrows), its perspective,
// and the arrow buttons' inset and size
const DESKTOP_SIDE_MARGIN = 80;
const DESKTOP_PERSPECTIVE = 2000;
const ARROW_INSET = 16;
const ARROW_SIZE = 52;
// Space left between a neighbouring card's outer edge and the arrow beside it
const ARROW_GAP = 60;

/**
 * Ring radius that puts the outer edge of the neighbouring cards (one step round the ring)
 * ARROW_GAP px inside the arrows. A card at angle t with half-width u has its outer edge at
 * x = R sin t + u cos t, z = -R (1 - cos t) - u sin t; perspective P projects that to
 * x * P / (P - z). Setting the projection equal to the target and solving for R gives this.
 */
function ringRadius(galleryW: number, cardW: number, anglePerItem: number) {
  const t = (anglePerItem * Math.PI) / 180;
  const s = Math.sin(t);
  const c = Math.cos(t);
  const u = cardW / 2;
  const P = DESKTOP_PERSPECTIVE;
  const target = galleryW / 2 - ARROW_INSET - ARROW_SIZE - ARROW_GAP;
  const denom = P * s - target * (1 - c);
  const r = denom > 0 ? (target * (P + u * s) - u * c * P) / denom : cardW * 1.5;
  // Never tighter than the card itself allows, so neighbours don't overlap the front card
  return Math.round(Math.max(r, cardW * 1.3));
}

function useResponsiveValues(
  imageRatio: number,
  anglePerItem: number,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const [values, setValues] = useState({ cardW: 440, cardH: 520, radius: 600, viewH: 570, isMobile: false });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) {
        setValues({ cardW: Math.min(w - 60, 290), cardH: 500, radius: 320, viewH: 550, isMobile: true });
        return;
      }
      if (w < 768) {
        setValues({ cardW: Math.min(w - 60, 340), cardH: 540, radius: 400, viewH: 590, isMobile: true });
        return;
      }

      // Desktop: size by width, then shrink so the whole card fits under the navbar
      let cardW = w < 1024 ? 410 : w < 1440 ? 460 : 490;
      let cardH = w < 1024 ? 540 : w < 1440 ? 590 : 610;
      const maxH = Math.max(MIN_DESKTOP_CARD_H, window.innerHeight - VERTICAL_CHROME);
      if (cardH > maxH) {
        cardW = Math.round(cardW * (maxH / cardH));
        cardH = maxH;
      }
      // Narrow the card if needed so fixed-aspect images show in full at full width above the text
      cardW = Math.min(cardW, Math.floor((cardH - CARD_TEXT_MIN_H) * imageRatio));
      // The gallery sits inside the page container, so space the ring by its own width
      const galleryW = containerRef.current?.clientWidth || w;
      setValues({ cardW, cardH, radius: ringRadius(galleryW, cardW, anglePerItem), viewH: cardH + 50, isMobile: false });
    };
    update();
    window.addEventListener('resize', update);
    const ro = containerRef.current ? new ResizeObserver(update) : null;
    if (containerRef.current) ro?.observe(containerRef.current);
    return () => {
      window.removeEventListener('resize', update);
      ro?.disconnect();
    };
  }, [imageRatio, anglePerItem, containerRef]);

  return values;
}

function tagStyle(isMobile: boolean, small = false): React.CSSProperties {
  return {
    flexShrink: 0,
    whiteSpace: 'nowrap',
    padding: isMobile ? '0.25rem 0.7rem' : small ? '0.2rem 0.5rem' : '0.25rem 0.55rem',
    borderRadius: '6px',
    fontSize: isMobile ? '0.55rem' : small ? '0.6rem' : '0.65rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    background: 'var(--bg-glass)',
  };
}

// One row of tags: as many whole tags as fit, then a "+N" chip for the rest (never cut mid-word)
function TagRow({ tags, isMobile }: { tags: string[]; isMobile: boolean }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(tags.length);

  useEffect(() => {
    const row = rowRef.current;
    const measure = measureRef.current;
    if (!row || !measure) return;

    const fit = () => {
      const chips = Array.from(measure.children) as HTMLElement[];
      const plusW = chips.pop()?.offsetWidth ?? 0;
      const gap = parseFloat(getComputedStyle(measure).columnGap) || 0;
      const avail = row.clientWidth;
      let used = 0;
      let count = 0;
      for (let i = 0; i < chips.length; i++) {
        const next = used + (i ? gap : 0) + chips[i].offsetWidth;
        const reserve = i < chips.length - 1 ? gap + plusW : 0;
        if (next + reserve > avail) break;
        used = next;
        count = i + 1;
      }
      setVisible(Math.max(1, count));
    };

    // Fires once on observe, then on every width change; refit once web fonts have loaded too
    const ro = new ResizeObserver(fit);
    ro.observe(row);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [tags]);

  const style = tagStyle(isMobile);
  const hidden = tags.length - visible;

  return (
    <div style={{ position: 'relative' }}>
      <div ref={rowRef} style={{ display: 'flex', gap: '0.35rem', overflow: 'hidden' }}>
        {tags.slice(0, visible).map((t) => <span key={t} style={style}>{t}</span>)}
        {hidden > 0 && <span style={style} title={tags.slice(visible).join(', ')}>+{hidden}</span>}
      </div>
      {/* Invisible copy of every tag, measured to decide how many fit */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{ position: 'absolute', top: 0, left: 0, display: 'flex', gap: '0.35rem', visibility: 'hidden', pointerEvents: 'none' }}
      >
        {tags.map((t) => <span key={t} style={style}>{t}</span>)}
        <span style={style}>+9</span>
      </div>
    </div>
  );
}

function Review({ review, isMobile }: { review: GalleryReview; isMobile: boolean }) {
  return (
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap', fontSize: isMobile ? '0.64rem' : '0.72rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
        <Star size={isMobile ? 12 : 13} fill="#fbbf24" color="#fbbf24" style={{ flexShrink: 0 }} />
        <span>{review.rating.toFixed(1)}</span>
        {review.source && <span style={{ fontWeight: 500, color: 'var(--text-tertiary)' }}>· {review.source}</span>}
      </div>
      <p style={{ marginTop: '0.35rem', fontSize: isMobile ? '0.66rem' : '0.74rem', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        &ldquo;{review.quote}&rdquo;
      </p>
      <span style={{ display: 'block', marginTop: '0.2rem', fontSize: isMobile ? '0.6rem' : '0.66rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>{review.author}</span>
    </div>
  );
}

// Memoized so a change of active card only re-renders the two cards whose `active` flipped
const GalleryCard = React.memo(function GalleryCard({
  item, cardH, isMobile, active,
}: { item: GalleryItem; cardH: number; isMobile: boolean; active: boolean }) {
  const br = isMobile ? '16px' : '20px';
  const [flipped, setFlipped] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Turn back to the front whenever the card leaves the front of the ring
  const [prevActive, setPrevActive] = useState(active);
  if (active !== prevActive) {
    setPrevActive(active);
    if (!active) setFlipped(false);
  }
  const showBack = flipped && active;

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };
  const handleMouseEnter = () => {
    if (isMobile) return;
    clearTimer();
    timerRef.current = setTimeout(() => setFlipped(true), FLIP_DELAY);
  };
  const handleMouseLeave = () => {
    if (isMobile) return;
    clearTimer();
    setFlipped(false);
  };
  // Phones have no hover: tapping the front card flips it (links on the back still navigate)
  const handleClick = (e: React.MouseEvent) => {
    if (!isMobile || !active || (e.target as HTMLElement).closest('a')) return;
    setFlipped((f) => !f);
  };

  useEffect(() => clearTimer, []);

  const faceStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: br,
    overflow: 'hidden',
    background: 'var(--bg-secondary, #12121e)',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  };
  const labelStyle: React.CSSProperties = { flexShrink: 0, fontSize: isMobile ? '0.6rem' : '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)' };
  const titleStyle: React.CSSProperties = { flexShrink: 0, fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, fontFamily: 'var(--font-heading)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };
  const features = (item.features ?? []).slice(0, 4);
  const backTech = item.allTech ?? item.tech;

  return (
    <div
      style={{ position: 'relative', borderRadius: br, height: `${cardH}px`, perspective: '1800px' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div
        style={{
          position: 'relative',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
          transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front: project overview */}
        <div style={faceStyle} aria-hidden={showBack}>
          <div
            style={{
              position: 'relative', width: '100%',
              height: item.imageFit === 'contain' ? 'auto' : (isMobile ? '45%' : '44%'),
              aspectRatio: item.imageFit === 'contain' ? item.imageAspect : undefined,
              // Full-width image, but always leaves room for the text block below it
              maxHeight: isMobile ? undefined : `calc(100% - ${CARD_TEXT_MIN_H}px)`,
              flexShrink: 0, overflow: 'hidden', background: 'var(--bg-tertiary)',
            }}
          >
            <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover', objectPosition: item.objectPosition || 'center' }} sizes={isMobile ? '300px' : '520px'} />
            {item.badge && (
              <span
                style={{
                  position: 'absolute', bottom: '12px', left: '12px',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 11px', borderRadius: '999px',
                  background: 'rgba(10,10,18,0.72)', backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: isMobile ? '11px' : '12.5px', fontWeight: 700, color: '#fff', lineHeight: 1,
                }}
              >
                <Star size={isMobile ? 12 : 13} fill="#fbbf24" color="#fbbf24" />
                {item.badge.rating.toFixed(1)}
                {item.badge.source && (
                  <span style={{ fontWeight: 500, opacity: 0.85 }}>· {item.badge.source}</span>
                )}
              </span>
            )}
          </div>

          <div style={{ padding: isMobile ? '1rem 1.15rem' : '1.25rem 1.6rem', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: isMobile ? '0.5rem' : '0.6rem' }}>
            <span style={labelStyle}>{item.category}</span>
            <h3 style={titleStyle}>{item.title}</h3>
            <p style={{ flexShrink: 0, fontSize: isMobile ? '0.75rem' : '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.desc}</p>

            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', gap: '0.45rem' }}>
              {isMobile ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {item.tech.map((t) => <span key={t} style={tagStyle(true)}>{t}</span>)}
                </div>
              ) : (
                <TagRow tags={item.tech} isMobile={false} />
              )}
              <span style={{ alignSelf: 'flex-end', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: isMobile ? '0.6rem' : '0.64rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', lineHeight: 1 }}>
                {isMobile ? 'Tap for details' : 'Hover for details'}
                <RotateCw size={isMobile ? 11 : 12} />
              </span>
            </div>
          </div>
        </div>

        {/* Back: project details */}
        <div style={{ ...faceStyle, transform: 'rotateY(180deg)' }} aria-hidden={!showBack}>
          <div style={{ padding: isMobile ? '1.1rem 1.15rem' : '1.4rem 1.6rem', display: 'flex', flexDirection: 'column', height: '100%', gap: isMobile ? '0.55rem' : '0.7rem' }}>
            <span style={labelStyle}>{item.category}</span>
            <h3 style={titleStyle}>{item.title}</h3>

            {item.metric && (
              <div style={{ flexShrink: 0, borderLeft: '2px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
                <span style={{ display: 'block', fontSize: isMobile ? '0.56rem' : '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-tertiary)', lineHeight: 1.2 }}>
                  Highlight
                </span>
                <span style={{ display: 'block', marginTop: '0.2rem', fontSize: isMobile ? '0.78rem' : '0.88rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                  {item.metric}
                </span>
              </div>
            )}

            {features.length > 0 && (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: isMobile ? '0.35rem' : '0.45rem', minHeight: 0, overflow: 'hidden' }}>
                {features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, fontSize: isMobile ? '0.72rem' : '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <Check size={isMobile ? 13 : 14} style={{ flexShrink: 0, color: 'var(--accent-primary)' }} />
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f}</span>
                  </li>
                ))}
              </ul>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', flexShrink: 0 }}>
              {backTech.slice(0, BACK_TECH_LIMIT).map((t) => <span key={t} style={tagStyle(isMobile, true)}>{t}</span>)}
              {backTech.length > BACK_TECH_LIMIT && <span style={tagStyle(isMobile, true)}>+{backTech.length - BACK_TECH_LIMIT}</span>}
            </div>

            {/* Client review sits in the bottom-left corner, View Details in the bottom-right */}
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.75rem', flexShrink: 0 }}>
              {item.review ? <Review review={item.review} isMobile={isMobile} /> : <span />}
              <InteractiveHoverButton
                href={item.href ?? '/portfolio'}
                text="VIEW DETAILS"
                size={isMobile ? 'sm' : 'md'}
                revealed={showBack}
                style={{ flexShrink: 0 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});


export function CircularGallery({ items }: CircularGalleryProps) {
  const total = items.length;
  const anglePerItem = 360 / total;
  const imageRatio = useMemo(() => minImageRatio(items), [items]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { cardW, cardH, radius, viewH, isMobile } = useResponsiveValues(imageRatio, anglePerItem, containerRef);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isHoveringRef = useRef(false);
  const isVisibleRef = useRef(true);
  const rotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const speedRef = useRef(AUTO_SPEED);
  const prevActiveRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const touchStartRef = useRef<{ x: number; time: number } | null>(null);
  const touchDeltaRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const updateCards = useCallback(() => {
    const rot = rotationRef.current;

    cardRefs.current.forEach((card, i) => {
      if (!card) return;

      const angle = i * anglePerItem;
      const effectiveAngle = ((angle - rot) % 360 + 360) % 360;
      const normalizedAngle = effectiveAngle > 180 ? 360 - effectiveAngle : effectiveAngle;

      card.style.transform = `rotateY(${(angle - rot).toFixed(3)}deg) translateZ(${radius}px)`;

      // Smooth falloff from the front card to BACK_OPACITY at the back of the ring, which
      // stays visible (mirrored) through the gap as the ring turns
      const cosVal = Math.cos(normalizedAngle * Math.PI / 180);
      const facing = Math.pow((1 + cosVal) / 2, 1.5);
      card.style.opacity = (BACK_OPACITY + (1 - BACK_OPACITY) * facing).toFixed(3);
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
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animate = (time: number) => {
      animRef.current = requestAnimationFrame(animate);
      if (!isVisibleRef.current) { lastTimeRef.current = 0; return; }
      if (!lastTimeRef.current) lastTimeRef.current = time;
      // Capped so a tab switch or long frame doesn't make the ring jump
      const delta = Math.min(0.05, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      // Autoplay speed eases toward its target, so hovering glides to a stop instead of halting
      const paused = isHoveringRef.current || touchStartRef.current !== null;
      const targetSpeed = paused || reducedMotion ? 0 : AUTO_SPEED;
      speedRef.current += (targetSpeed - speedRef.current) * (1 - Math.exp(-delta * SPEED_EASE));
      targetRotationRef.current += delta * speedRef.current;

      // Frame-rate independent easing toward the target position
      const diff = targetRotationRef.current - rotationRef.current;
      if (Math.abs(diff) < 0.001 && speedRef.current < 0.001) return;
      rotationRef.current += diff * (1 - Math.exp(-delta * POSITION_EASE));

      updateCards();
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
    width: isMobile ? '40px' : `${ARROW_SIZE}px`,
    height: isMobile ? '40px' : `${ARROW_SIZE}px`,
    borderRadius: '50%',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
  };

  return (
    <div
      ref={containerRef}
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
        style={{ ...arrowStyle, left: isMobile ? '6px' : `${ARROW_INSET}px` }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.boxShadow = '0 0 25px var(--accent-glow)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <ChevronLeft size={isMobile ? 18 : 24} strokeWidth={1.8} />
      </button>

      {/* Right arrow */}
      <button
        onClick={() => navigate(1)}
        aria-label="Next project"
        style={{ ...arrowStyle, right: isMobile ? '6px' : `${ARROW_INSET}px` }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.boxShadow = '0 0 25px var(--accent-glow)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <ChevronRight size={isMobile ? 18 : 24} strokeWidth={1.8} />
      </button>

      <div
        style={{
          position: 'relative',
          height: `${viewH}px`,
          marginLeft: isMobile ? '0px' : `${DESKTOP_SIDE_MARGIN}px`,
          marginRight: isMobile ? '0px' : `${DESKTOP_SIDE_MARGIN}px`,
          perspective: isMobile ? '1200px' : `${DESKTOP_PERSPECTIVE}px`,
          perspectiveOrigin: '50% 50%',
          overflow: 'hidden',
          maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
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
              <GalleryCard item={item} cardH={cardH} isMobile={isMobile} active={i === activeIndex} />
            </div>
          ))}
        </div>
      </div>

      {/* Position indicator: a thin segmented track (each segment jumps to its project) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: isMobile ? '0.75rem' : '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => goToItem(i)}
              aria-label={`Go to project ${i + 1}: ${item.title}`}
              aria-current={i === activeIndex ? 'true' : undefined}
              style={{ width: isMobile ? '22px' : '30px', height: '20px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <span
                style={{
                  display: 'block',
                  width: '100%',
                  height: '2px',
                  borderRadius: '2px',
                  background: i === activeIndex ? 'var(--text-primary)' : 'var(--border-color-hover, var(--border-color))',
                  opacity: i === activeIndex ? 1 : 0.7,
                  transition: 'background 0.4s ease, opacity 0.4s ease',
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
