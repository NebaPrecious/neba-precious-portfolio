"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Hand, MousePointer2, Sparkles } from "lucide-react";
import type { PlaygroundHandle } from "./Playground";
import type { SceneSpec } from "./types";

// Each scene is its own lazily-loaded chunk; a page only downloads the one it uses.
const Playground = dynamic(() => import("./Playground"), { ssr: false, loading: () => null });
const Devices = dynamic(() => import("./scenes/Devices"), { ssr: false, loading: () => null });
const Orbit = dynamic(() => import("./scenes/Orbit"), { ssr: false, loading: () => null });
const Lanyard = dynamic(() => import("./scenes/Lanyard"), { ssr: false, loading: () => null });

/** WebGL + enough horsepower + motion allowed → load the 3D scene. */
function canPlay() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if ((nav.deviceMemory ?? 8) < 3 || (navigator.hardwareConcurrency ?? 8) < 3) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

const hints: Record<SceneSpec["type"], string> = {
  toybox: "Move to push · Click to bounce",
  devices: "Drag to spin · Click a screen to open",
  orbit: "Drag to spin · Click a frame to watch",
  lanyard: "Grab the badge · Fling it",
};

/**
 * Hero with an interactive 3D scene behind the copy. Every page gets a
 * different idea (toy box, devices, orbit, lanyard). Until — or unless —
 * the scene loads, a static composition is shown so the hero is never empty.
 */
export default function PlayHero({
  scene,
  children,
  variant = "full",
  className = "",
  labelledBy = "hero-title",
  fallbackWord,
}: {
  scene: SceneSpec;
  children: React.ReactNode;
  /** "full" = landing (viewport height), "page" = shorter hero for inner pages. */
  variant?: "full" | "page";
  className?: string;
  labelledBy?: string;
  /** Letters for the static fallback (defaults to the toy box's first word). */
  fallbackWord?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const apiRef = useRef<PlaygroundHandle | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!canPlay()) return;
    const start = () => setEnabled(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 600);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function onPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (scene.type !== "toybox") return;
    if ((event.target as HTMLElement).closest("a, button, input, textarea, select")) return;
    apiRef.current?.bounce();
  }

  const word = fallbackWord ?? (scene.type === "toybox" ? scene.words[0] : "");
  const common = { eventSource: sectionRef, paused: !visible, onReady: () => setReady(true) };

  return (
    <section
      ref={sectionRef}
      className={`play-hero ${className}`.trim()}
      data-variant={variant}
      data-scene={scene.type}
      data-playing={enabled && ready}
      onPointerDown={onPointerDown}
      aria-labelledby={labelledBy}
    >
      {word && (
        <div className="play-fallback" aria-hidden="true">
          {[...word].map((l, i) => (
            <span key={i} style={{ "--i": i } as React.CSSProperties}>
              {l}
            </span>
          ))}
        </div>
      )}

      {enabled && (
        <div className="play-canvas">
          {scene.type === "toybox" && <Playground {...common} scene={scene} apiRef={apiRef} />}
          {scene.type === "devices" && <Devices {...common} scene={scene} />}
          {scene.type === "orbit" && <Orbit {...common} scene={scene} />}
          {scene.type === "lanyard" && <Lanyard {...common} scene={scene} />}
        </div>
      )}

      {children}

      {enabled && (
        <div className="play-hint wrap">
          <span className="mono">
            {scene.type === "lanyard" ? <Hand size={13} aria-hidden="true" /> : <MousePointer2 size={13} aria-hidden="true" />}{" "}
            {hints[scene.type]}
          </span>
          {scene.type === "toybox" && (
            <button type="button" className="play-toss" onClick={() => apiRef.current?.bounce(true)}>
              <Sparkles size={14} aria-hidden="true" /> Toss everything
            </button>
          )}
        </div>
      )}
    </section>
  );
}
