"use client";

import { useEffect, useState } from "react";

const FPS = 25;

function format(ms: number) {
  const totalFrames = Math.floor((ms / 1000) * FPS);
  const ff = totalFrames % FPS;
  const s = Math.floor(totalFrames / FPS);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(ff)}`;
}

/** A running timecode since the visitor arrived — a small studio detail. */
export default function Timecode() {
  const [ms, setMs] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now();
    let raf = 0;
    let last = -1;
    const tick = (now: number) => {
      const elapsed = now - start;
      const frame = Math.floor((elapsed / 1000) * FPS);
      if (frame !== last) {
        last = frame;
        setMs(elapsed);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span className="timecode mono" aria-hidden="true">
      {format(ms)}
    </span>
  );
}
