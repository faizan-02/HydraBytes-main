'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  color: string;
  opacity: number;
}

const COLORS = [
  '124, 58, 237',   // purple
  '0, 229, 255',    // cyan
  '244, 114, 182',  // pink
  '124, 58, 237',   // purple (weighted)
];

export default function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${(i / 20) * 90 + 5}%`,
        size: parseFloat((Math.random() * 4 + 2).toFixed(1)),
        duration: parseFloat((Math.random() * 15 + 12).toFixed(1)),
        delay: parseFloat((-(Math.random() * 25)).toFixed(1)),
        color: COLORS[i % COLORS.length],
        opacity: parseFloat((Math.random() * 0.4 + 0.15).toFixed(2)),
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
            left: p.left,
            bottom: '0px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: `rgba(${p.color}, ${p.opacity})`,
            boxShadow: `0 0 ${p.size * 2}px rgba(${p.color}, ${p.opacity * 0.6})`,
            animation: `floatUp ${p.duration}s ${p.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}
