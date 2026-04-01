'use client';

import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  animationSpeed?: number;
  colors?: string[];
}

export default function GradientText({
  children,
  className = '',
  animationSpeed = 8,
  colors = ['#7c3aed', '#00e5ff', '#f472b6', '#7c3aed'],
}: GradientTextProps) {
  const gradientStyle: React.CSSProperties = {
    display: 'inline-block',
    background: `linear-gradient(90deg, ${colors.join(', ')})`,
    backgroundSize: '300% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: `gradientShift ${animationSpeed}s ease-in-out infinite`,
  };

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <span className={className} style={gradientStyle}>
        {children}
      </span>
    </>
  );
}
