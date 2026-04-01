'use client';

import { useEffect, useState } from 'react';

import styles from './LoadingScreen.module.css';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if this is a return visit in the same session
    const hasLoaded = sessionStorage.getItem('hydrabytes-loaded');
    if (hasLoaded) {
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem('hydrabytes-loaded', 'true');
      }, 600);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className={`${styles.loadingScreen} ${fadeOut ? styles.fadeOut : ''}`}>
      <div className={styles.loadingContent}>
        <div className={styles.logoContainer}>
          <div style={{ width: '224px', height: '107px', overflow: 'hidden', position: 'relative', margin: '0 auto' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/transparent.png" alt="HydraBytes" style={{ position: 'absolute', width: '282px', top: '-69px', left: '50%', transform: 'translateX(-50%)' }} />
          </div>
        </div>
        <div className={styles.loadingBar}>
          <div className={styles.loadingBarFill} />
        </div>
        <p className={styles.loadingText}>Initializing Experience</p>
      </div>
    </div>
  );
}
