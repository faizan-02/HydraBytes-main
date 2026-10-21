'use client';

import { useMemo } from 'react';
import { Cloud, renderSimpleIcon, type ICloud, type SimpleIcon } from 'react-icon-cloud';
import { useTheme } from '@/lib/ThemeContext';

// Icons are passed in as bundled `simple-icons` objects instead of being fetched by slug at
// runtime: the CSP's connect-src doesn't allow the jsdelivr CDN that fetchSimpleIcons() uses.

export const cloudProps: Omit<ICloud, 'children'> = {
  containerProps: {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
  },
  canvasProps: {
    style: { width: '100%', maxWidth: '460px', height: 'auto', aspectRatio: '1 / 1' },
  },
  options: {
    reverse: true,
    depth: 1,
    wheelZoom: false,
    imageScale: 2,
    activeCursor: 'default',
    tooltip: 'native',
    initial: [0.1, -0.1],
    clickToFront: 500,
    tooltipDelay: 0,
    outlineColour: '#0000',
    maxSpeed: 0.04,
    minSpeed: 0.02,
  },
};

// Page backgrounds from globals.css, used to keep each icon's brand colour readable
const BG_HEX = { light: '#f8f8fc', dark: '#0a0a12' } as const;

export function renderCustomIcon(icon: SimpleIcon, theme: 'light' | 'dark') {
  return renderSimpleIcon({
    icon,
    bgHex: BG_HEX[theme],
    fallbackHex: theme === 'light' ? '#4a4a65' : '#f0f0f5',
    minContrastRatio: theme === 'dark' ? 2 : 1.2,
    size: 42,
    aProps: {
      href: undefined,
      target: undefined,
      rel: undefined,
      onClick: (e: React.MouseEvent) => e.preventDefault(),
    },
  });
}

export function IconCloud({ icons, id = 'icon-cloud' }: { icons: SimpleIcon[]; id?: string }) {
  const { theme } = useTheme();
  const rendered = useMemo(() => icons.map((icon) => renderCustomIcon(icon, theme)), [icons, theme]);

  // Remount on theme change so the canvas redraws with the new contrast-adjusted colours
  return (
    <Cloud key={theme} id={id} {...cloudProps}>
      <>{rendered}</>
    </Cloud>
  );
}
