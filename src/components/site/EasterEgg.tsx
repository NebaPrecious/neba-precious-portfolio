"use client";

import { useEffect } from "react";

const SECRET = "play";
const LETTERS = "NEBAPRECIOUS</>▶";

/**
 * Little secrets: type "play" anywhere (outside form fields) and letter
 * blocks rain down the screen. Also leaves a hello in the dev console.
 */
export default function EasterEgg() {
  useEffect(() => {
    console.log(
      "%c▚ Neba Precious %c Hey, curious dev 👋 Type “play” anywhere on the page.",
      "background:#64ffda;color:#0b1a30;font-weight:800;padding:4px 8px;border-radius:4px",
      "color:#8892b0",
    );

    let buffer = "";
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-SECRET.length);
      if (buffer === SECRET) rain();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}

function rain() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.createElement("div");
  layer.className = "egg-rain";
  layer.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 36; i++) {
    const b = document.createElement("span");
    b.textContent = LETTERS[i % LETTERS.length];
    b.style.left = `${Math.random() * 96}vw`;
    b.style.animationDelay = `${Math.random() * 0.9}s`;
    b.style.animationDuration = `${1.6 + Math.random() * 1.2}s`;
    b.style.setProperty("--r", `${(Math.random() - 0.5) * 540}deg`);
    b.style.setProperty("--s", `${0.7 + Math.random() * 0.8}`);
    if (i % 3 === 0) b.dataset.alt = "true";
    layer.appendChild(b);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 3800);
}
