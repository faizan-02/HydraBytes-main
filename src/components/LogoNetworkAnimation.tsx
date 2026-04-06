'use client';

import { useRef, useEffect } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  phaseOffset: number;
}

const CANVAS_WIDTH = 280;
const CANVAS_HEIGHT = 110;
const NODE_COUNT = 10;
const CONNECTION_THRESHOLD = 95;
const PURPLE = [124, 58, 237]; // #7c3aed
const CYAN = [0, 229, 255];   // #00e5ff

function lerpColor(t: number): string {
  const r = Math.round(PURPLE[0] + (CYAN[0] - PURPLE[0]) * t);
  const g = Math.round(PURPLE[1] + (CYAN[1] - PURPLE[1]) * t);
  const b = Math.round(PURPLE[2] + (CYAN[2] - PURPLE[2]) * t);
  return `rgb(${r},${g},${b})`;
}

function createNodes(): Node[] {
  const nodes: Node[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const t = i / (NODE_COUNT - 1);
    nodes.push({
      x: 20 + Math.random() * (CANVAS_WIDTH - 40),
      y: 15 + Math.random() * (CANVAS_HEIGHT - 30),
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 1.5 + Math.random() * 1.0,
      color: lerpColor(t),
      phaseOffset: Math.random() * Math.PI * 2,
    });
  }
  return nodes;
}

export default function LogoNetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    const nodes = createNodes();
    let frameId: number;
    let time = 0;

    const animate = () => {
      time += 0.02;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Update positions
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        // Soft bounce off bounds
        if (node.x < 5 || node.x > CANVAS_WIDTH - 5) {
          node.vx *= -1;
          node.x = Math.max(5, Math.min(CANVAS_WIDTH - 5, node.x));
        }
        if (node.y < 5 || node.y > CANVAS_HEIGHT - 5) {
          node.vy *= -1;
          node.y = Math.max(5, Math.min(CANVAS_HEIGHT - 5, node.y));
        }

        // Clamp velocity
        node.vx = Math.max(-0.15, Math.min(0.15, node.vx));
        node.vy = Math.max(-0.15, Math.min(0.15, node.vy));
      }

      // Draw connections
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_THRESHOLD) {
            const opacity = (1 - dist / CONNECTION_THRESHOLD) * 0.25;
            ctx.strokeStyle = `rgba(100, 180, 255, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const pulse = 0.4 + 0.5 * (0.5 + 0.5 * Math.sin(time + node.phaseOffset));
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.shadowBlur = 6;
        ctx.shadowColor = node.color;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        width: `${CANVAS_WIDTH}px`,
        height: `${CANVAS_HEIGHT}px`,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  );
}
