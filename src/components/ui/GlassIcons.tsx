import React from 'react';
import './GlassIcons.css';

export type GlassIconColor =
  | 'blue'
  | 'purple'
  | 'red'
  | 'indigo'
  | 'orange'
  | 'green'
  | 'cyan'
  | 'pink';

export type GlassIconsItem = {
  icon: React.ReactElement;
  color: GlassIconColor | string;
  label: string;
  customClass?: string;
};

const gradientMapping: Record<string, string> = {
  blue: 'linear-gradient(hsl(223, 90%, 50%), hsl(208, 90%, 50%))',
  purple: 'linear-gradient(hsl(283, 90%, 50%), hsl(268, 90%, 50%))',
  red: 'linear-gradient(hsl(3, 90%, 50%), hsl(348, 90%, 50%))',
  indigo: 'linear-gradient(hsl(253, 90%, 50%), hsl(238, 90%, 50%))',
  orange: 'linear-gradient(hsl(43, 90%, 50%), hsl(28, 90%, 50%))',
  green: 'linear-gradient(hsl(123, 90%, 40%), hsl(108, 90%, 40%))',
  cyan: 'linear-gradient(hsl(193, 90%, 45%), hsl(178, 90%, 42%))',
  pink: 'linear-gradient(hsl(330, 90%, 60%), hsl(315, 90%, 55%))',
};

const resolveBackground = (color: string): string =>
  gradientMapping[color] ?? color;

/* =========================================================
   Multi-item grid (per React Bits spec)
   ========================================================= */
type GlassIconsProps = {
  items: GlassIconsItem[];
  className?: string;
};

const GlassIcons: React.FC<GlassIconsProps> = ({ items, className }) => (
  <div className={`icon-btns ${className || ''}`}>
    {items.map((item, index) => (
      <button
        key={index}
        className={`icon-btn ${item.customClass || ''}`}
        aria-label={item.label}
        type="button"
      >
        <span
          className="icon-btn__back"
          style={{ background: resolveBackground(item.color) }}
        />
        <span className="icon-btn__front">
          <span className="icon-btn__icon" aria-hidden="true">
            {item.icon}
          </span>
        </span>
        <span className="icon-btn__label">{item.label}</span>
      </button>
    ))}
  </div>
);

export default GlassIcons;

/* =========================================================
   Single-icon inline variant
   Same glass visual, no grid, no label — designed to drop
   into existing cards that already provide their own text.
   ========================================================= */
type GlassIconProps = {
  icon: React.ReactElement;
  color: GlassIconColor | string;
  size?: number;
  className?: string;
};

export const GlassIcon: React.FC<GlassIconProps> = ({
  icon,
  color,
  size = 44,
  className,
}) => (
  <span
    className={`glass-icon ${className || ''}`}
    style={
      {
        width: size,
        height: size,
        '--glass-radius': `${Math.round(size * 0.22)}px`,
      } as React.CSSProperties
    }
  >
    <span
      className="glass-icon__back"
      style={{ background: resolveBackground(color) }}
    />
    <span className="glass-icon__front">
      <span className="glass-icon__icon" aria-hidden="true">
        {icon}
      </span>
    </span>
  </span>
);
