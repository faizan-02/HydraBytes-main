import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  // Mirror the [data-theme="dark"] attribute system already in use
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Brand purple / cyan — match globals.css CSS custom properties exactly
        primary: {
          DEFAULT: '#7c3aed',
          hover: '#8b5cf6',
          glow: 'rgba(124,58,237,0.3)',
        },
        cyan: {
          DEFAULT: '#00e5ff',
          glow: 'rgba(0,229,255,0.2)',
        },
        // Dark theme background scale
        dark: {
          primary: '#0a0a12',
          secondary: '#12121e',
          tertiary: '#1a1a2e',
        },
        // Light theme background scale
        light: {
          primary: '#f8f8fc',
          secondary: '#ffffff',
          tertiary: '#f0f0f8',
        },
      },
      fontFamily: {
        primary: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-poppins)', 'var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
    },
  },
};

export default config;
