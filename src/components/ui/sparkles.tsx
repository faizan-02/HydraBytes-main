'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';

interface SparklesProps {
  children?: React.ReactNode;
  className?: string;
  count?: number;
  color?: string;
  size?: number;
  density?: number;
  speed?: number;
  direction?: string;
  minSize?: number | null;
  minSpeed?: number | null;
  opacity?: number;
  opacitySpeed?: number;
  minOpacity?: number | null;
  background?: string;
  options?: Record<string, unknown>;
}

export function Sparkles({
  children,
  className = '',
  count = 12,
  color = 'rgba(0, 180, 216, 0.6)',
  size = 3,
  density,
  speed,
  direction,
  ...rest
}: SparklesProps) {
  const sparkles = useMemo(
    () =>
      Array.from({ length: density || count }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animDelay: `${Math.random() * 3}s`,
        animDuration: `${2 + Math.random() * 2}s`,
        sparkleSize: size * (0.5 + Math.random() * 0.8),
      })),
    [count, size, density]
  );

  return (
    <span style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <span
        style={{
          position: 'absolute',
          inset: '-8px',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
        aria-hidden
      >
        {sparkles.map((s) => (
          <span
            key={s.id}
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              width: `${s.sparkleSize}px`,
              height: `${s.sparkleSize}px`,
              borderRadius: '50%',
              background: typeof color === 'string' ? color : '#fff',
              boxShadow: `0 0 ${s.sparkleSize * 2}px ${typeof color === 'string' ? color : '#fff'}`,
              animation: `sparkle-pop ${s.animDuration} ${s.animDelay} ease-in-out infinite`,
            }}
          />
        ))}
      </span>
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      <style>{`
        @keyframes sparkle-pop {
          0%, 100% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </span>
  );
}
