'use client';

import React, { RefObject } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

interface TimelineContentProps {
  children: React.ReactNode;
  animationNum: number;
  timelineRef: RefObject<HTMLDivElement | null>;
  customVariants?: Variants;
  className?: string;
  as?: React.ElementType;
}

export function TimelineContent({
  children,
  animationNum,
  timelineRef,
  customVariants,
  className,
  as: Component = 'div',
}: TimelineContentProps) {
  const isInView = useInView(timelineRef, { once: true, margin: '-100px' });

  const defaultVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { delay: i * 0.15, duration: 0.5 },
    }),
  };

  const variants = customVariants || defaultVariants;

  return (
    <motion.div
      custom={animationNum}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {Component === 'div' ? children : <Component>{children}</Component>}
    </motion.div>
  );
}
