'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export default function TextReveal({
  text,
  className = '',
  delay = 0,
  staggerDelay = 0.03,
  as: Tag = 'h1',
}: TextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const chars = text.split('');

  return (
    <Tag ref={ref} className={className} style={{ display: 'block', overflow: 'hidden' }}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: '100%', opacity: 0 }}
          animate={isInView ? { y: '0%', opacity: 1 } : { y: '100%', opacity: 0 }}
          transition={{
            duration: 0.5,
            delay: delay + i * staggerDelay,
            ease: [0.215, 0.61, 0.355, 1],
          }}
          style={{ display: 'inline-block', willChange: 'transform' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </Tag>
  );
}
