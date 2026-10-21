'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './interactive-hover-button.module.css';

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  href?: string;
  size?: 'sm' | 'md';
  /** When provided, the button stays hidden and unclickable until this is true. */
  revealed?: boolean;
  /** 'span' renders a decorative, non-interactive version for use inside an existing link. */
  as?: 'span';
}

// Borderless text button: each letter rolls up in a staggered wave (on reveal and again
// on hover) while the arrow slides out and back in, and the label lifts on hover.
// Styled with a CSS module because the unlayered global reset in globals.css overrides
// Tailwind's padding utilities. Renders a Next.js Link when `href` is given.
const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = 'Button', href, size = 'md', revealed, as, className, onMouseEnter, ...props }, ref) => {
  // Bumping the key remounts the animated layer, which replays the roll
  const [rollKey, setRollKey] = useState(0);
  const replay = () => setRollKey((k) => k + 1);

  // Replay when the parent reveals the button (adjusting state on prop change, no effect needed)
  const [prevRevealed, setPrevRevealed] = useState(revealed);
  if (revealed !== prevRevealed) {
    setPrevRevealed(revealed);
    if (revealed) setRollKey((k) => k + 1);
  }

  const classes = cn(
    styles.button,
    size === 'sm' && styles.sm,
    revealed !== undefined && styles.hideable,
    revealed && styles.revealed,
    className,
  );
  const iconSize = size === 'sm' ? 12 : 14;

  const content = (
    <span className={styles.lift}>
      <span key={rollKey} className={cn(styles.inner, rollKey > 0 && styles.rolling)} aria-hidden="true">
        <span style={{ display: 'inline-flex' }}>
          {Array.from(text).map((ch, i) => {
            const glyph = ch === ' ' ? ' ' : ch;
            return (
              <span key={i} className={styles.char} style={{ '--i': i } as React.CSSProperties}>
                <span>{glyph}</span>
                <span>{glyph}</span>
              </span>
            );
          })}
        </span>
        <span className={styles.arrow}>
          <ArrowRight size={iconSize} strokeWidth={2} />
          <ArrowRight size={iconSize} strokeWidth={2} />
        </span>
      </span>
    </span>
  );

  // Inside a parent link: same look and animation, but the parent handles navigation
  if (as === 'span') {
    return (
      <span className={classes} style={props.style} aria-hidden="true" onMouseEnter={replay}>
        {content}
      </span>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        style={props.style}
        aria-label={props['aria-label'] ?? text}
        onMouseEnter={replay}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      className={classes}
      aria-label={text}
      onMouseEnter={(e) => { replay(); onMouseEnter?.(e); }}
      {...props}
    >
      {content}
    </button>
  );
});

InteractiveHoverButton.displayName = 'InteractiveHoverButton';

export { InteractiveHoverButton };
