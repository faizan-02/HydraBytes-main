'use client';

export default function AnimatedGridDots() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        backgroundImage: `radial-gradient(circle, rgba(0, 180, 216, 0.12) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)',
        opacity: 0.5,
      }}
      aria-hidden
    />
  );
}
