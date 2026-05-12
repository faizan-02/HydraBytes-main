'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/ThemeContext';

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
  const { theme } = useTheme();
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
        @keyframes linePulse0 { 0%,100%{opacity:0.18} 50%{opacity:0.45} }
        @keyframes linePulse1 { 0%,100%{opacity:0.15} 50%{opacity:0.40} }
        @keyframes linePulse2 { 0%,100%{opacity:0.20} 50%{opacity:0.48} }
        @keyframes linePulse3 { 0%,100%{opacity:0.14} 50%{opacity:0.38} }
        @keyframes linePulse4 { 0%,100%{opacity:0.16} 50%{opacity:0.42} }
        `}
      `}</style>
      <defs>
        <linearGradient id="connLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          {theme === 'light' ? (
            <>
              <stop offset="0%" stopColor="rgba(0,151,167,0.5)" />
              <stop offset="100%" stopColor="rgba(8,145,178,0.4)" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="rgba(0,180,216,0.25)" />
              <stop offset="100%" stopColor="rgba(0,229,255,0.18)" />
            </>
          )}
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
            strokeWidth={0.7}
            style={
              reducedMotion
                ? { opacity: 0.25 }
                : {
                    animation: `linePulse${i} ${3.5 + i * 0.4}s ease-in-out infinite`,
                    animationDelay: `${i * 0.6}s`,
                  }
            }
          />
        );
      })}
    </svg>
  );
}
