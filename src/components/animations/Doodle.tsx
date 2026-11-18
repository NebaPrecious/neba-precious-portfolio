"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hand-drawn accent strokes that draw themselves in when scrolled into view.
 * Decorative only (aria-hidden). Wrap the target text in `.doodle-wrap`.
 */
const paths = {
  // Loose loop around a word.
  loop: {
    viewBox: "0 0 300 120",
    d: "M150 12C78 6 14 30 12 62c-2 34 74 52 150 48 70-4 128-24 126-56C286 22 214 6 140 10 96 12 62 20 40 30",
  },
  // Swoosh underline.
  underline: { viewBox: "0 0 300 40", d: "M6 28C70 14 150 10 294 18M40 34c60-8 140-10 220-6" },
  // Little asterisk / spark.
  asterisk: { viewBox: "0 0 100 100", d: "M50 8v84M14 28l72 44M86 28L14 72" },
  // Playful squiggle.
  squiggle: { viewBox: "0 0 200 40", d: "M4 22c12-16 24-16 36 0s24 16 36 0 24-16 36 0 24 16 36 0 24-16 36 0" },
  // Arrow pointing down-right.
  arrow: { viewBox: "0 0 120 120", d: "M10 14c40 6 74 34 88 86M98 100l-30-6M98 100l6-30" },
} as const;

export type DoodleKind = keyof typeof paths;

export default function Doodle({
  kind,
  color = "var(--accent)",
  className = "",
  width = 4,
  delay = 0,
}: {
  kind: DoodleKind;
  color?: string;
  className?: string;
  width?: number;
  delay?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);
  const p = paths[kind];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className={`doodle doodle-${kind} ${className}`.trim()}
      viewBox={p.viewBox}
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      data-drawn={drawn}
      style={{ "--doodle-delay": `${delay}s` } as React.CSSProperties}
    >
      <path d={p.d} pathLength={1} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
