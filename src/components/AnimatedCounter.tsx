'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface AnimatedCounterProps {
  target: string;
  className?: string;
}

export default function AnimatedCounter({ target, className = '' }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!isInView) return;

    // Parse the target value
    const numericMatch = target.match(/^([\d.]+)(.*)$/);
    if (!numericMatch) {
      setDisplay(target);
      return;
    }

    const numericValue = parseFloat(numericMatch[1]);
    const suffix = numericMatch[2]; // e.g., '+', '%', '/7'
    const hasDecimal = numericMatch[1].includes('.');
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = eased * numericValue;

      if (hasDecimal) {
        setDisplay(currentValue.toFixed(1) + suffix);
      } else {
        setDisplay(Math.floor(currentValue) + suffix);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, target]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
