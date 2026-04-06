'use client';

import { useState, useEffect } from 'react';

const chipPositions: Record<string, { x: number; y: number }> = {
  nextjs:     { x: 8,  y: 15 },
  react:      { x: 90, y: 22 },
  typescript: { x: 6,  y: 65 },
  nodejs:     { x: 92, y: 80 },
  aiml:       { x: 95, y: 40 },
};

const connections: [string, string][] = [
  ['nextjs', 'react'],
  ['react', 'aiml'],
  ['aiml', 'nodejs'],
  ['nextjs', 'typescript'],
  ['typescript', 'nodejs'],
];

export default function ChipConnectorLines() {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0,
        animation: 'chipLinesFadeIn 1.5s ease forwards',
      }}
    >
      <style>{`
        @keyframes chipLinesFadeIn {
          to { opacity: 1; }
        }
        ${reducedMotion ? '' : `
        @keyframes dashTravel0 { to { stroke-dashoffset: -28; } }
        @keyframes dashTravel1 { to { stroke-dashoffset: -28; } }
        @keyframes dashTravel2 { to { stroke-dashoffset: -28; } }
        @keyframes dashTravel3 { to { stroke-dashoffset: -28; } }
        @keyframes dashTravel4 { to { stroke-dashoffset: -28; } }
        `}
      `}</style>
      <defs>
        <linearGradient id="connLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(124,58,237,0.25)" />
          <stop offset="100%" stopColor="rgba(0,229,255,0.18)" />
        </linearGradient>
      </defs>
      {connections.map(([from, to], i) => {
        const a = chipPositions[from];
        const b = chipPositions[to];
        return (
          <line
            key={`${from}-${to}`}
            x1={`${a.x}%`}
            y1={`${a.y}%`}
            x2={`${b.x}%`}
            y2={`${b.y}%`}
            stroke="url(#connLineGrad)"
            strokeWidth={0.8}
            strokeDasharray="6 8"
            strokeDashoffset={0}
            style={
              reducedMotion
                ? undefined
                : {
                    animation: `dashTravel${i} 4s linear infinite`,
                    animationDelay: `${i * 0.8}s`,
                  }
            }
          />
        );
      })}
    </svg>
  );
}
