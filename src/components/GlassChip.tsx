'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlassChipProps {
  label: string;
  icon?: React.ReactNode;
  color: string;
  delay?: number;
  style?: React.CSSProperties;
  theme?: 'light' | 'dark';
  position?: 'absolute' | 'relative';
  revealedLabel?: string;
  continuousFloat?: boolean;
}

let chipIdCounter = 0;

export default function GlassChip({ label, icon, color, delay = 0, style, position = 'absolute', revealedLabel, continuousFloat = true, theme }: GlassChipProps) {
  const [popped, setPopped] = useState(false);
  const [filterId] = useState(() => `glass-chip-${chipIdCounter++}`);

  const handlePop = useCallback(() => {
    setPopped((prev) => !prev);
  }, []);

  return (
    <motion.div
      style={{
        position: position,
        ...style,
        zIndex: 2,
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={continuousFloat ? { opacity: 1, y: [0, -6, 0] } : { opacity: 1, y: 0 }}
      transition={{
        opacity: { duration: 0.6, delay, ease: 'easeOut' },
        ...(continuousFloat ? { y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.6 } } : {}),
      }}
      whileHover={{ scale: 1.15, y: -10 }}
      onClick={handlePop}
    >
      <AnimatePresence mode="wait">
        {!popped ? (
          /* ── Liquid Glass state ── */
          <motion.div
            key="glass"
            initial={{ scale: 0.8, opacity: 0, filter: 'blur(8px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{
              scale: [1, 1.2, 0],
              opacity: [1, 0.8, 0],
              filter: ['blur(0px)', 'blur(4px)', 'blur(12px)'],
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.6rem 1.2rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              color: color,
            }}
          >
            {/* Very subtle glass shell */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.05)',
                boxShadow:
                  '0 2px 6px rgba(0,0,0,0.04), inset 1px 1px 1px -0.5px rgba(255,255,255,0.4), inset -1px -1px 1px -0.5px rgba(255,255,255,0.2), inset 0 0 2px 1px rgba(255,255,255,0.05)',
                transition: 'all 0.3s ease',
              }}
            />

            {/* Subtle liquid distortion layer */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                borderRadius: '9999px',
                isolation: 'isolate',
                zIndex: -1,
                backdropFilter: `url("#${filterId}") blur(6px)`,
                WebkitBackdropFilter: `url("#${filterId}") blur(6px)`,
              }}
            />

            {/* Text behind subtle glass */}
            <span style={{ position: 'relative', zIndex: 10 }}>
              {label}
            </span>

            {/* SVG Glass Filter (hidden) - customized for subtle effect */}
            <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
              <defs>
                <filter
                  id={filterId}
                  x="0%"
                  y="0%"
                  width="100%"
                  height="100%"
                  colorInterpolationFilters="sRGB"
                >
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.04 0.04"
                    numOctaves="1"
                    seed="1"
                    result="turbulence"
                  />
                  <feGaussianBlur in="turbulence" stdDeviation="1" result="blurredNoise" />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="blurredNoise"
                    scale="15"
                    xChannelSelector="R"
                    yChannelSelector="B"
                    result="displaced"
                  />
                  <feGaussianBlur in="displaced" stdDeviation="1.5" result="finalBlur" />
                  <feComposite in="finalBlur" in2="finalBlur" operator="over" />
                </filter>
              </defs>
            </svg>
          </motion.div>
        ) : (
          /* ── Revealed state (after pop) ── */
          <motion.div
            key="revealed"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: revealedLabel ? 1 : 2, opacity: 1 }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 15,
              delay: 0.1,
            }}
            style={
              revealedLabel
                ? {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                    color: color,
                    background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    boxShadow: `0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px ${color}20`,
                  }
                : {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: color,
                  }
            }
          >
            {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
            {revealedLabel && <span>{revealedLabel}</span>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pop particle burst */}
      <AnimatePresence>
        {popped && (
          <>
            {[...Array(10)].map((_, i) => {
              const angle = (i / 10) * Math.PI * 2;
              const dist = 25 + Math.random() * 20;
              return (
                <motion.span
                  key={`p-${i}`}
                  initial={{ opacity: 0.8, scale: 1, x: 0, y: 0 }}
                  animate={{
                    opacity: 0,
                    scale: 0,
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: color,
                    pointerEvents: 'none',
                    opacity: 0.8,
                  }}
                />
              );
            })}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
