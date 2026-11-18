"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Seconds. */
  delay?: number;
  className?: string;
};

/**
 * Fades content up once it enters the viewport. Pure CSS transition driven by
 * an IntersectionObserver; content is always visible without JS (`.no-js`)
 * and under `prefers-reduced-motion` (see base.css).
 */
export default function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className}${visible ? " is-visible" : ""}`.trim() || undefined}
      data-reveal=""
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
