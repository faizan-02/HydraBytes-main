'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export default function BlurText({
  text,
  className = '',
  delay = 0,
  as: Tag = 'p',
}: BlurTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const words = text.split(' ');

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: 'blur(12px)', y: 8 }}
          animate={
            isInView
              ? { opacity: 1, filter: 'blur(0px)', y: 0 }
              : { opacity: 0, filter: 'blur(12px)', y: 8 }
          }
          transition={{
            duration: 0.6,
            delay: delay + i * 0.06,
            ease: [0.25, 0.4, 0.25, 1],
          }}
          style={{ display: 'inline-block', marginRight: '0.3em', willChange: 'transform, filter' }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
