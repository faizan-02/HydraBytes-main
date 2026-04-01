import styles from '../components/LoadingScreen.module.css';

export default function Loading() {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingContent}>
        <div className={styles.logoContainer}>
          <svg
            className={styles.logoSvg}
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="routeLoadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#00e5ff" />
              </linearGradient>
            </defs>
            <path
              className={styles.hexPath}
              d="M30 3L54.25 17V45L30 57L5.75 45V17L30 3Z"
              stroke="url(#routeLoadGrad)"
              strokeWidth="2.5"
              fill="none"
            />
            <text
              x="30"
              y="36"
              textAnchor="middle"
              fill="url(#routeLoadGrad)"
              fontSize="20"
              fontWeight="800"
              fontFamily="Poppins, sans-serif"
            >
              H
            </text>
          </svg>
        </div>
        <div className={styles.loadingBar}>
          <div className={styles.loadingBarFill} />
        </div>
      </div>
    </div>
  );
}
