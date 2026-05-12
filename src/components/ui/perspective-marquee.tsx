"use client";

import { useRef, useEffect, useState, useCallback } from "react";

export interface PerspectiveMarqueeProps {
  items?: string[];
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  pixelsPerSecond?: number;
  rotateY?: number;
  rotateX?: number;
  perspective?: number;
  fadeColor?: string;
  background?: string;
  className?: string;
}

const DEFAULT_ITEMS = [
  "React",
  "Next.js",
  "TypeScript",
  "Python",
  "Node.js",
  "Docker",
  "AWS",
  "TensorFlow",
];

export function PerspectiveMarquee({
  items = DEFAULT_ITEMS,
  fontSize = 84,
  color = "#fafafa",
  fontWeight = 700,
  pixelsPerSecond = 60,
  rotateY = -28,
  rotateX = 8,
  perspective = 1200,
  fadeColor = "#050505",
  background = "#050505",
  className,
}: PerspectiveMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const isVisibleRef = useRef(true);
  const [offset, setOffset] = useState(0);

  const itemPadding = fontSize * 0.9;
  const approxItemWidth = items.reduce(
    (acc, item) => acc + item.length * fontSize * 0.6 + itemPadding,
    0,
  );

  const animate = useCallback(
    (time: number) => {
      rafRef.current = requestAnimationFrame(animate);
      if (!isVisibleRef.current) {
        lastTimeRef.current = 0;
        return;
      }
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      offsetRef.current =
        (offsetRef.current + delta * pixelsPerSecond) % approxItemWidth;
      setOffset(offsetRef.current);
    },
    [pixelsPerSecond, approxItemWidth],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(el);

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [animate]);

  const rendered = [...items, ...items, ...items];

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        perspective: `${perspective}px`,
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            display: "flex",
            whiteSpace: "nowrap",
            transform: `translateX(${-offset}px)`,
            willChange: "transform",
          }}
        >
          {rendered.map((item, i) => {
            const itemCenter =
              i * (approxItemWidth / items.length) +
              approxItemWidth / items.length / 2 -
              offset;
            const containerWidth =
              containerRef.current?.offsetWidth ?? 1280;
            const norm = (itemCenter - containerWidth / 2) / (containerWidth / 2);
            const distance = Math.min(1, Math.abs(norm));
            const opacity = 1 - distance * 0.4;

            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  fontFamily: "var(--font-heading), sans-serif",
                  fontSize,
                  fontWeight,
                  color,
                  letterSpacing: "-0.03em",
                  paddingRight: itemPadding,
                  opacity,
                }}
              >
                {item}
              </span>
            );
          })}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `linear-gradient(90deg, ${fadeColor} 0%, transparent 18%, transparent 82%, ${fadeColor} 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `linear-gradient(180deg, ${fadeColor} 0%, transparent 25%, transparent 75%, ${fadeColor} 100%)`,
        }}
      />
    </div>
  );
}
