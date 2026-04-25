"use client"
import React, { useEffect, useState, memo, createContext, useContext } from 'react';
import { useTheme } from '@/lib/ThemeContext';

type IconType = 'react' | 'python' | 'nodejs' | 'tensorflow' | 'swift' | 'firebase';
type GlowColor = 'cyan' | 'purple';

interface SkillConfig {
  id: string;
  orbitRadius: number;
  size: number;
  speed: number;
  iconType: IconType;
  phaseShift: number;
  glowColor: GlowColor;
  label: string;
}

interface OrbitingSkillProps {
  config: SkillConfig;
  angle: number;
  scale: number;
}

interface GlowingOrbitPathProps {
  radius: number;
  glowColor?: GlowColor;
  animationDelay?: number;
  scale?: number;
}

const DarkCtx = createContext(true);

const iconComponents: Record<IconType, { component: () => React.JSX.Element; color: string }> = {
  react: {
    component: () => (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <g stroke="#61DAFB" strokeWidth="1" fill="none">
          <circle cx="12" cy="12" r="2.05" fill="#61DAFB"/>
          <ellipse cx="12" cy="12" rx="11" ry="4.2"/>
          <ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(60 12 12)"/>
          <ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(120 12 12)"/>
        </g>
      </svg>
    ),
    color: '#61DAFB'
  },
  python: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.96 3.403 5.96h2.03v-2.867s-.109-3.42 3.35-3.42h5.766s3.24.052 3.24-3.148V3.202S18.28 0 11.914 0zM8.708 1.85a1.049 1.049 0 110 2.098 1.049 1.049 0 010-2.098z" fill="#3776AB"/>
        <path d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752h-5.814v-.826h8.121S24 18.211 24 12.031c0-6.18-3.403-5.96-3.403-5.96h-2.03v2.867s.109 3.42-3.35 3.42H9.451s-3.24-.052-3.24 3.148v5.292S5.72 24 12.086 24zm3.206-1.85a1.049 1.049 0 110-2.098 1.049 1.049 0 010 2.098z" fill="#FFD43B"/>
      </svg>
    ),
    color: '#3776AB'
  },
  nodejs: {
    component: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.602.065-.037.151-.023.218.017l2.256 1.339a.36.36 0 00.275 0l8.795-5.076a.247.247 0 00.135-.241V6.921a.255.255 0 00-.137-.246l-8.791-5.072a.27.27 0 00-.273 0L2.075 6.675a.252.252 0 00-.139.246v10.146c0 .1.055.194.139.241l2.409 1.392c1.307.654 2.108-.116 2.108-.89V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.112.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L1.352 18.675C.533 18.215 0 17.352 0 16.43V6.284c0-.922.533-1.786 1.352-2.245L10.147.037c.8-.452 1.866-.452 2.657 0l8.796 5.002c.819.459 1.352 1.323 1.352 2.245v10.146c0 .922-.533 1.783-1.352 2.245l-8.796 5.078c-.28.163-.601.247-.926.247z" fill="#339933"/>
      </svg>
    ),
    color: '#339933'
  },
  tensorflow: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M1.292 5.856L11.54 0v24l-4.095-2.378V7.603L4.366 9.39 1.292 7.6zm21.416 0L12.46 0v24l4.095-2.378V7.603l3.079 1.787 3.074-1.79z" fill="#FF6F00"/>
      </svg>
    ),
    color: '#FF6F00'
  },
  swift: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M7.168 19.032c-3.608-2.593-5.96-6.94-4.86-11.096.396-1.497 1.225-2.88 2.476-3.888-.156.396-.264.804-.312 1.224-.396 3.444 2.94 6.672 2.94 6.672s-2.076-3.24-1.236-6.132c.516-1.776 2.1-3.12 3.384-4.2 1.476-1.248 3.156-2.34 5.04-2.856-2.028 2.388-1.14 4.836.744 7.14 1.884 2.304 3.876 3.468 3.456 6.468-.12.84-.42 1.668-.888 2.424 1.068-1.044 1.776-2.4 2.04-3.876 1.464 2.604 1.464 5.784-.528 8.196-2.736 3.312-7.536 4.164-11.592 2.52-.276-.108-.54-.24-.804-.384l-.072-.036c2.748.588 5.796-.18 7.632-2.268-1.788.528-3.744.264-5.244-.684l-.012-.012c1.848.204 3.648-.48 4.812-1.812-1.488.312-3.024-.084-4.152-1.032l-.024-.012c1.668.36 3.312-.432 4.212-1.86-2.28.792-4.836.36-6.72-1.14l-.06-.036c3.948 2.196 8.04 1.704 8.04 1.704-3.312 1.824-7.092 1.38-8.172.864z" fill="#F05138"/>
      </svg>
    ),
    color: '#F05138'
  },
  firebase: {
    component: () => (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M3.89 15.672L6.255 1.618a.413.413 0 01.775-.122l2.542 4.744-5.682 9.432z" fill="#FFA000"/>
        <path d="M20.11 18.67L17.744 3.16a.413.413 0 00-.717-.19L3.89 15.672l7.267 4.187a1.24 1.24 0 001.23 0l7.723-4.449v-.74z" fill="#F57C00"/>
        <path d="M12.387 19.859a1.24 1.24 0 01-1.23 0L3.89 15.672l-.002.003 7.269 4.185a1.24 1.24 0 001.23 0l7.723-4.449v-.003l-7.723 4.451z" fill="#F57C00"/>
        <path d="M12.387 19.859a1.24 1.24 0 01-1.23 0L3.89 15.672 6.255 1.618a.413.413 0 01.775-.122l2.542 4.744 1.255-2.38a.413.413 0 01.73 0l8.553 14.81-7.723 4.449v-.26z" fill="#FFCA28"/>
        <path d="M12.387 19.859a1.24 1.24 0 01-1.23 0L3.89 15.672l7.267 4.187a1.24 1.24 0 001.23 0l7.723-4.449-7.723 4.449z" fill="#FFA000"/>
      </svg>
    ),
    color: '#FFCA28'
  }
};

const SkillIcon = memo(({ type }: { type: IconType }) => {
  const IconComponent = iconComponents[type]?.component;
  return IconComponent ? <IconComponent /> : null;
});
SkillIcon.displayName = 'SkillIcon';

const skillsConfig: SkillConfig[] = [
  { id: 'react', orbitRadius: 100, size: 45, speed: 1, iconType: 'react', phaseShift: 0, glowColor: 'cyan', label: 'React' },
  { id: 'python', orbitRadius: 100, size: 42, speed: 1, iconType: 'python', phaseShift: (2 * Math.PI) / 3, glowColor: 'cyan', label: 'Python' },
  { id: 'swift', orbitRadius: 100, size: 40, speed: 1, iconType: 'swift', phaseShift: (4 * Math.PI) / 3, glowColor: 'cyan', label: 'Swift' },
  { id: 'tensorflow', orbitRadius: 180, size: 48, speed: -0.6, iconType: 'tensorflow', phaseShift: 0, glowColor: 'purple', label: 'TensorFlow' },
  { id: 'nodejs', orbitRadius: 180, size: 45, speed: -0.6, iconType: 'nodejs', phaseShift: (2 * Math.PI) / 3, glowColor: 'purple', label: 'Node.js' },
  { id: 'firebase', orbitRadius: 180, size: 42, speed: -0.6, iconType: 'firebase', phaseShift: (4 * Math.PI) / 3, glowColor: 'purple', label: 'Firebase' },
];

const OrbitingSkill = memo(({ config, angle, scale }: OrbitingSkillProps) => {
  const isDark = useContext(DarkCtx);
  const [isHovered, setIsHovered] = useState(false);
  const { orbitRadius, iconType, label } = config;
  const size = Math.round(config.size * scale);
  const r = orbitRadius * scale;

  const x = Math.cos(angle) * r;
  const y = Math.sin(angle) * r;

  return (
    <div
      className="absolute top-1/2 left-1/2 transition-all duration-300 ease-out"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
        zIndex: isHovered ? 20 : 10,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative w-full h-full p-2 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer"
        style={{
          background: isDark ? 'rgba(15, 20, 40, 0.9)' : 'rgba(255, 255, 255, 0.97)',
          border: isDark ? 'none' : `2px solid ${iconComponents[iconType]?.color}50`,
          transform: isHovered ? 'scale(1.25)' : 'scale(1)',
          boxShadow: isHovered
            ? `0 0 30px ${iconComponents[iconType]?.color}40, 0 0 60px ${iconComponents[iconType]?.color}20`
            : isDark
              ? '0 2px 12px rgba(0,0,0,0.5)'
              : `0 4px 16px rgba(0,0,0,0.1), 0 0 12px ${iconComponents[iconType]?.color}25`,
        }}
      >
        <SkillIcon type={iconType} />
        {isHovered && (
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap pointer-events-none"
            style={{
              color: isDark ? '#c0c0e0' : '#4a4a6a',
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
});
OrbitingSkill.displayName = 'OrbitingSkill';

const GlowingOrbitPath = memo(({ radius, glowColor = 'cyan', animationDelay = 0, scale = 1 }: GlowingOrbitPathProps) => {
  const isDark = useContext(DarkCtx);

  const darkColors = {
    cyan: { primary: 'rgba(6, 182, 212, 0.12)', secondary: 'rgba(6, 182, 212, 0.06)', border: 'rgba(6, 182, 212, 0.18)' },
    purple: { primary: 'rgba(147, 51, 234, 0.12)', secondary: 'rgba(147, 51, 234, 0.06)', border: 'rgba(147, 51, 234, 0.18)' },
  };

  const lightColors = {
    cyan: { primary: 'rgba(6, 182, 212, 0.1)', secondary: 'rgba(6, 182, 212, 0.04)', border: 'rgba(6, 182, 212, 0.2)' },
    purple: { primary: 'rgba(147, 51, 234, 0.1)', secondary: 'rgba(147, 51, 234, 0.04)', border: 'rgba(147, 51, 234, 0.2)' },
  };

  const colors = (isDark ? darkColors : lightColors)[glowColor];

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
      style={{ width: `${radius * scale * 2}px`, height: `${radius * scale * 2}px` }}
    >
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: `radial-gradient(circle, transparent 30%, ${colors.secondary} 70%, ${colors.primary} 100%)`,
          boxShadow: `0 0 20px ${colors.primary}, inset 0 0 20px ${colors.secondary}`,
          animation: 'pulse 4s ease-in-out infinite',
          animationDelay: `${animationDelay}s`,
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `${isDark ? 1 : 2}px solid ${colors.border}`,
          boxShadow: isDark
            ? `inset 0 0 8px ${colors.secondary}`
            : `inset 0 0 10px ${colors.secondary}, 0 0 8px ${colors.primary}`,
        }}
      />
    </div>
  );
});
GlowingOrbitPath.displayName = 'GlowingOrbitPath';

export default function OrbitingSkills() {
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => setScale(window.innerWidth < 768 ? 0.65 : 1);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      setTime(prevTime => prevTime + deltaTime);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  const orbitConfigs: Array<{ radius: number; glowColor: GlowColor; delay: number }> = [
    { radius: 100, glowColor: 'cyan', delay: 0 },
    { radius: 180, glowColor: 'purple', delay: 1.5 }
  ];

  return (
    <DarkCtx.Provider value={isDark}>
      <div className="w-full flex items-center justify-center overflow-visible">
        <div
          className="relative flex items-center justify-center"
          style={{ width: `${Math.round(420 * scale)}px`, height: `${Math.round(420 * scale)}px` }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Center HydraBytes Logo */}
          <div className="relative z-10 flex items-center justify-center">
            <div
              className="absolute rounded-full"
              style={{
                width: '140px',
                height: '140px',
                background: isDark
                  ? 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(124, 58, 237, 0.06) 0%, transparent 70%)',
                filter: 'blur(12px)',
              }}
            />
            <div
              className="absolute rounded-full animate-pulse"
              style={{
                width: '120px',
                height: '120px',
                background: isDark
                  ? 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(6, 182, 212, 0.04) 0%, transparent 70%)',
                filter: 'blur(16px)',
                animationDuration: '3s',
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/transparent.png"
              alt="HydraBytes"
              style={{
                width: '120px',
                height: 'auto',
                objectFit: 'contain',
                filter: isDark
                  ? 'drop-shadow(0 0 24px rgba(6, 182, 212, 0.2))'
                  : 'drop-shadow(0 0 12px rgba(124, 58, 237, 0.12))',
                position: 'relative',
                zIndex: 2,
              }}
            />
          </div>

          {/* Orbit paths */}
          {orbitConfigs.map((config) => (
            <GlowingOrbitPath
              key={`path-${config.radius}`}
              radius={config.radius}
              glowColor={config.glowColor}
              animationDelay={config.delay}
              scale={scale}
            />
          ))}

          {/* Orbiting skill icons */}
          {skillsConfig.map((config) => {
            const angle = time * config.speed + (config.phaseShift || 0);
            return (
              <OrbitingSkill
                key={config.id}
                config={config}
                angle={angle}
                scale={scale}
              />
            );
          })}
        </div>
      </div>
    </DarkCtx.Provider>
  );
}
