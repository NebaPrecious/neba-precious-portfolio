"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_COOKIE } from "@/lib/site";

type Theme = "light" | "dark";

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function applyTheme(next: Theme) {
  const root = document.documentElement;
  const commit = () => root.setAttribute("data-theme", next);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduce && document.visibilityState === "visible" && typeof document.startViewTransition === "function") {
    document.startViewTransition(commit);
  } else {
    commit();
  }
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as Theme);

  function toggle() {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`icon-button theme-toggle ${className}`}
      onClick={toggle}
      aria-pressed={isDark}
      aria-label="Dark theme"
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <Sun className="icon-sun" size={17} aria-hidden="true" />
      <Moon className="icon-moon" size={17} aria-hidden="true" />
    </button>
  );
}
