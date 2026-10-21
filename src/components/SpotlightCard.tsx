'use client';

import { ReactNode } from 'react';
import styles from './SpotlightCard.module.css';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** @deprecated No longer used: the cursor spotlight was removed. Kept so existing callers compile. */
  spotlightColor?: string;
  /** @deprecated No longer used: cards never tilt now. Kept so existing callers compile. */
  disableTilt?: boolean;
}

// Plain card surface: thin border, quiet border change on hover. No tilt, glow or gradient.
export default function SpotlightCard({ children, className = '' }: SpotlightCardProps) {
  return (
    <div className={`${styles.spotlightCard} ${className}`}>
      <div className={styles.spotlightContent}>{children}</div>
    </div>
  );
}
