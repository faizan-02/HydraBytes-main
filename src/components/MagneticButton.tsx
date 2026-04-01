'use client';

import { useRef, ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: ReactNode;
}

export default function MagneticButton({ children }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const xRaw = useMotionValue(0);
  const yRaw = useMotionValue(0);
  const x = useSpring(xRaw, { stiffness: 200, damping: 15 });
  const y = useSpring(yRaw, { stiffness: 200, damping: 15 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    xRaw.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    yRaw.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  }

  function handleLeave() {
    xRaw.set(0);
    yRaw.set(0);
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y, display: 'inline-flex' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}
