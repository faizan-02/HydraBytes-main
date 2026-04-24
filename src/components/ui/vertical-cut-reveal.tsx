'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion } from 'framer-motion';
import type { AnimationOptions } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextProps {
  children: React.ReactNode;
  reverse?: boolean;
  transition?: AnimationOptions;
  splitBy?: 'words' | 'characters' | 'lines' | string;
  staggerDuration?: number;
  staggerFrom?: 'first' | 'last' | 'center' | 'random' | number;
  containerClassName?: string;
  wordLevelClassName?: string;
  elementLevelClassName?: string;
  onClick?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  autoStart?: boolean;
}

export interface VerticalCutRevealRef {
  startAnimation: () => void;
  reset: () => void;
}

interface WordObject {
  characters: string[];
  needsSpace: boolean;
}

const splitChars = (text: string): string[] => {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const seg = new Intl.Segmenter('en', { granularity: 'grapheme' });
    return Array.from(seg.segment(text), ({ segment }) => segment);
  }
  return Array.from(text);
};

const VerticalCutReveal = forwardRef<VerticalCutRevealRef, TextProps>(
  (
    {
      children,
      reverse = false,
      transition = { type: 'spring', stiffness: 190, damping: 22 },
      splitBy = 'words',
      staggerDuration = 0.2,
      staggerFrom = 'first',
      containerClassName,
      wordLevelClassName,
      elementLevelClassName,
      onClick,
      onStart,
      onComplete,
      autoStart = true,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const text = typeof children === 'string' ? children : children?.toString() || '';
    const [isAnimating, setIsAnimating] = useState(false);

    const elements = useMemo(() => {
      const words = text.split(' ');
      if (splitBy === 'characters') {
        return words.map((word, i) => ({
          characters: splitChars(word),
          needsSpace: i !== words.length - 1,
        }));
      }
      if (splitBy === 'words') return text.split(' ');
      if (splitBy === 'lines') return text.split('\n');
      return text.split(splitBy);
    }, [text, splitBy]);

    const getDelay = useCallback(
      (index: number) => {
        const total =
          splitBy === 'characters'
            ? (elements as WordObject[]).reduce(
                (a, w) => a + w.characters.length + (w.needsSpace ? 1 : 0),
                0
              )
            : elements.length;
        if (staggerFrom === 'first') return index * staggerDuration;
        if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration;
        if (staggerFrom === 'center')
          return Math.abs(Math.floor(total / 2) - index) * staggerDuration;
        if (staggerFrom === 'random')
          return Math.abs(Math.floor(Math.random() * total) - index) * staggerDuration;
        return Math.abs((staggerFrom as number) - index) * staggerDuration;
      },
      [elements, staggerFrom, staggerDuration, splitBy]
    );

    const startAnimation = useCallback(() => {
      setIsAnimating(true);
      onStart?.();
    }, [onStart]);

    useImperativeHandle(ref, () => ({
      startAnimation,
      reset: () => setIsAnimating(false),
    }));

    useEffect(() => {
      if (autoStart) startAnimation();
    }, [autoStart, startAnimation]);

    const variants = {
      hidden: { y: reverse ? '-100%' : '100%' },
      visible: (i: number) => ({
        y: 0,
        transition: {
          ...transition,
          delay: ((transition?.delay as number) || 0) + getDelay(i),
        },
      }),
    };

    return (
      <span
        className={cn(containerClassName, 'inline-flex flex-wrap whitespace-pre-wrap', splitBy === 'lines' && 'flex-col')}
        onClick={onClick}
        ref={containerRef}
      >
        <span className="sr-only">{text}</span>
        {(splitBy === 'characters'
          ? (elements as WordObject[])
          : (elements as string[]).map((el, i) => ({
              characters: [el],
              needsSpace: i !== elements.length - 1,
            }))
        ).map((wordObj, wIdx, arr) => {
          const prev = arr.slice(0, wIdx).reduce((s, w) => s + w.characters.length, 0);
          return (
            <span key={wIdx} aria-hidden className={cn('inline-flex overflow-hidden', wordLevelClassName)}>
              {wordObj.characters.map((char, cIdx) => (
                <span key={cIdx} className={cn(elementLevelClassName, 'whitespace-pre-wrap relative')}>
                  <motion.span
                    custom={prev + cIdx}
                    initial="hidden"
                    animate={isAnimating ? 'visible' : 'hidden'}
                    variants={variants}
                    onAnimationComplete={
                      wIdx === elements.length - 1 && cIdx === wordObj.characters.length - 1
                        ? onComplete
                        : undefined
                    }
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                </span>
              ))}
              {wordObj.needsSpace && <span> </span>}
            </span>
          );
        })}
      </span>
    );
  }
);

VerticalCutReveal.displayName = 'VerticalCutReveal';
export { VerticalCutReveal };
