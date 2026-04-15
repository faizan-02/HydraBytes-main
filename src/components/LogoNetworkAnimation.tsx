'use client';

import { useRef, useEffect } from 'react';

interface Node {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  hvx: number;
  hvy: number;
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
const PURPLE = [124, 58, 237];
const CYAN = [0, 229, 255];

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
    const x = 20 + Math.random() * (CANVAS_WIDTH - 40);
    const y = 15 + Math.random() * (CANVAS_HEIGHT - 30);
    nodes.push({
      x,
      y,
      homeX: x,
      homeY: y,
      hvx: (Math.random() - 0.5) * 0.3,
      hvy: (Math.random() - 0.5) * 0.3,
      vx: 0,
      vy: 0,
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
    const mouse = { x: 0, y: 0, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const pad = 60;
      if (mx > -pad && mx < CANVAS_WIDTH + pad && my > -pad && my < CANVAS_HEIGHT + pad) {
        mouse.x = mx;
        mouse.y = my;
        mouse.active = true;
      } else {
        mouse.active = false;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    let frameId: number;
    let time = 0;

    const animate = () => {
      time += 0.02;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      for (const node of nodes) {
        // Drift home position (slow ambient motion)
        node.homeX += node.hvx;
        node.homeY += node.hvy;
        if (node.homeX < 8 || node.homeX > CANVAS_WIDTH - 8) {
          node.hvx *= -1;
          node.homeX = Math.max(8, Math.min(CANVAS_WIDTH - 8, node.homeX));
        }
        if (node.homeY < 8 || node.homeY > CANVAS_HEIGHT - 8) {
          node.hvy *= -1;
          node.homeY = Math.max(8, Math.min(CANVAS_HEIGHT - 8, node.homeY));
        }

        // Compute target (home + optional cursor attraction)
        let targetX = node.homeX;
        let targetY = node.homeY;
        if (mouse.active) {
          const dx = node.homeX - mouse.x;
          const dy = node.homeY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 110;
          if (dist < radius && dist > 0.5) {
            const push = Math.pow(1 - dist / radius, 2) * 32;
            targetX += (dx / dist) * push;
            targetY += (dy / dist) * push;
          }
        }

        // Spring toward target with damping
        const spring = 0.08;
        const damping = 0.82;
        node.vx += (targetX - node.x) * spring;
        node.vy += (targetY - node.y) * spring;
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;

        // Clamp to canvas
        node.x = Math.max(4, Math.min(CANVAS_WIDTH - 4, node.x));
        node.y = Math.max(4, Math.min(CANVAS_HEIGHT - 4, node.y));
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
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
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
