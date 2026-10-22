'use client';

import styles from './LogoPulse.module.css';

// Positions of the logo tree, in the coordinate space of /transparent.png (1024 x 1024):
// the trunk rises from the "t" to a junction, then splits into three branches of hexagons.
const JUNCTION: [number, number] = [693, 496];
const NODES: Record<string, [number, number]> = {
  top: [692, 430],
  topLeft: [639, 398],
  left: [640, 464],
  farLeft: [589, 436],
  right: [747, 452],
  farRight: [797, 412],
  topRight: [744, 378],
};

// Each branch: from point, to point, when the light starts travelling (s) and for how long (s).
// The node at the end of a branch lights up as the light arrives.
const BRANCHES: { from: [number, number]; to: [number, number]; start: number; dur: number; node?: string }[] = [
  { from: [693, 540], to: JUNCTION, start: 0, dur: 0.2 },
  { from: JUNCTION, to: NODES.top, start: 0.2, dur: 0.2, node: 'top' },
  { from: JUNCTION, to: NODES.left, start: 0.2, dur: 0.2, node: 'left' },
  { from: JUNCTION, to: NODES.right, start: 0.2, dur: 0.22, node: 'right' },
  { from: NODES.top, to: NODES.topLeft, start: 0.4, dur: 0.18, node: 'topLeft' },
  { from: NODES.left, to: NODES.farLeft, start: 0.4, dur: 0.18, node: 'farLeft' },
  { from: NODES.right, to: NODES.farRight, start: 0.42, dur: 0.18, node: 'farRight' },
  { from: NODES.farRight, to: NODES.topRight, start: 0.6, dur: 0.16, node: 'topRight' },
];

// Pointy-top hexagon matching the logo's hexagons
function hexPoints([cx, cy]: [number, number], r = 19) {
  const w = r * 0.866;
  return [
    [cx, cy - r], [cx + w, cy - r / 2], [cx + w, cy + r / 2],
    [cx, cy + r], [cx - w, cy + r / 2], [cx - w, cy - r / 2],
  ].map((p) => p.join(',')).join(' ');
}

/**
 * A soft light that runs up the logo's tree and lights each hexagon in turn. Rendered on top of
 * the logo image with the same size and offset; remount (change `key`) to replay it.
 */
export default function LogoPulse({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      className={styles.pulse}
      viewBox="0 0 1024 1024"
      width={226}
      height={226}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {BRANCHES.map(({ from, to, start, dur }, i) => (
        <line
          key={i}
          className={styles.trail}
          x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}
          pathLength={100}
          style={{ animationDelay: `${start}s`, animationDuration: `${dur}s` } as React.CSSProperties}
        />
      ))}
      {BRANCHES.filter((b) => b.node).map(({ node, start, dur }) => (
        <polygon
          key={node}
          className={styles.node}
          points={hexPoints(NODES[node!])}
          style={{ animationDelay: `${start + dur - 0.04}s` }}
        />
      ))}
    </svg>
  );
}
