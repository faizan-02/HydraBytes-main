'use client';

import { useScroll, useSpring, useTransform, motion } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const opacity = useTransform(scrollYProgress, [0, 0.01], [0, 1]);

  return (
    <>
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
          height: '2px',
          background: 'var(--border-color-hover)',
          opacity,
          pointerEvents: 'none',
        }}
      />
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1002,
          height: '2px',
          scaleX,
          originX: 0,
          opacity,
          background: 'var(--accent-gradient)',
          boxShadow: '0 0 8px var(--accent-glow)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
