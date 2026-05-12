'use client';

import { useEffect, useState, CSSProperties } from 'react';

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  drift: number;
}

const COLORS = ['26, 107, 122', '0, 180, 216'];

export default function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setParticles(
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: parseFloat((Math.random() * 96 + 2).toFixed(1)),
        size: parseFloat((Math.random() * 1.4 + 1.6).toFixed(1)),
        duration: parseFloat((Math.random() * 10 + 22).toFixed(1)),
        delay: parseFloat((-(Math.random() * 30)).toFixed(1)),
        color: COLORS[i % COLORS.length],
        drift: parseFloat(((Math.random() - 0.5) * 40).toFixed(1)),
      }))
    );
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            bottom: '-8px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: `rgba(${p.color}, 0.85)`,
            boxShadow: `0 0 ${p.size * 3}px rgba(${p.color}, 0.55)`,
            ['--drift' as string]: `${p.drift}px`,
            animation: `floatUp ${p.duration}s ${p.delay}s ease-in-out infinite`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
