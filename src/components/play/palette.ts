"use client";

import { useEffect, useState } from "react";

/* ---------------------------------------------------------------- palette */

export type Palette = { accent: string; text: string; surface: string; bg: string; gold: string };

/** Resolve CSS custom properties (OKLCH) to sRGB hex via a 1px canvas. */
export function readPalette(el?: Element | null): Palette {
  const styles = getComputedStyle(el ?? document.documentElement);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const resolve = (name: string, fallback: string) => {
    const value = styles.getPropertyValue(name).trim() || fallback;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = fallback;
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  };
  return {
    accent: resolve("--accent", "#64ffda"),
    text: resolve("--text", "#ccd6f6"),
    surface: resolve("--surface-2", "#1d2d50"),
    bg: resolve("--bg", "#0a192f"),
    gold: resolve("--gold", "#f5c451"),
  };
}

export function usePalette(source: React.RefObject<HTMLElement | null>) {
  const [palette, setPalette] = useState<Palette>(() => readPalette(source.current));
  useEffect(() => {
    const observer = new MutationObserver(() => setPalette(readPalette(source.current)));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [source]);
  return palette;
}

