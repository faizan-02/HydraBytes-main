'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const dotX = useSpring(mouseX, { stiffness: 800, damping: 40 });
  const dotY = useSpring(mouseY, { stiffness: 800, damping: 40 });
  const ringX = useSpring(mouseX, { stiffness: 250, damping: 30 });
  const ringY = useSpring(mouseY, { stiffness: 250, damping: 30 });

  useEffect(() => {
    // Only hide cursor on pointer devices (not touch)
    if (window.matchMedia('(pointer: fine)').matches) {
      document.body.style.cursor = 'none';
    }
    return () => { document.body.style.cursor = ''; };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };
    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, [role="button"], input, textarea, select, label')) {
        setHovering(true);
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, [role="button"], input, textarea, select, label')) {
        setHovering(false);
      }
    };
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, [mouseX, mouseY, visible]);

  if (!visible) return null;

  return (
    <>
      {/* Solid dot — follows tightly */}
      <motion.div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          style={{ borderRadius: '50%', background: 'var(--accent-primary)' }}
          animate={{
            width: hovering ? 8 : 5,
            height: hovering ? 8 : 5,
            opacity: hovering ? 1 : 0.85,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {/* Ring — lags for depth effect */}
      <motion.div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 9998,
          pointerEvents: 'none',
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          style={{ borderRadius: '50%' }}
          animate={{
            width: hovering ? 36 : 24,
            height: hovering ? 36 : 24,
            opacity: hovering ? 0.55 : 0.22,
            border: hovering
              ? '1px solid var(--accent-secondary)'
              : '1px solid var(--accent-primary)',
          }}
          transition={{ duration: 0.25 }}
        />
      </motion.div>
    </>
  );
}
