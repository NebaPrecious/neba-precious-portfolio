"use client";

/**
 * Phone motion sensors for the 3D scenes: tilt (device orientation) and
 * shake (device motion). Values live in a module-level object so 3D frame
 * loops can read them without React re-renders.
 *
 * iOS requires an explicit permission prompt from a user tap
 * (`enableMotion()`); Android/others start as soon as `startMotion()` runs.
 */

export const tilt = {
  /** -1 (left) … 1 (right) */
  x: 0,
  /** -1 (towards you) … 1 (away) */
  y: 0,
  enabled: false,
};

type Listener = () => void;
const shakeListeners = new Set<Listener>();
const stateListeners = new Set<Listener>();
let started = false;
let lastShake = 0;

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

function onOrientation(e: DeviceOrientationEvent) {
  if (e.gamma == null || e.beta == null) return;
  // Phones are usually held ~40° from flat; treat that as "level".
  tilt.x = clamp(e.gamma / 35);
  tilt.y = clamp((e.beta - 40) / 35);
  if (!tilt.enabled) {
    tilt.enabled = true;
    stateListeners.forEach((l) => l());
  }
}

function onMotion(e: DeviceMotionEvent) {
  const a = e.accelerationIncludingGravity ?? e.acceleration;
  if (!a || a.x == null || a.y == null || a.z == null) return;
  const magnitude = Math.hypot(a.x, a.y, a.z);
  const now = performance.now();
  // ~2.2g with gravity included, at most once a second.
  if (magnitude > 22 && now - lastShake > 1000) {
    lastShake = now;
    shakeListeners.forEach((l) => l());
  }
}

type PermissionApi = { requestPermission?: () => Promise<"granted" | "denied"> };

/** True on iOS-style browsers that need a tap to grant motion access. */
export function motionNeedsPermission() {
  if (typeof window === "undefined") return false;
  const DOE = window.DeviceOrientationEvent as unknown as PermissionApi | undefined;
  return typeof DOE?.requestPermission === "function";
}

export function isTouchDevice() {
  return typeof window !== "undefined" && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

/** Start listening (no-op where permission is still required). */
export function startMotion() {
  if (started || typeof window === "undefined" || !isTouchDevice() || motionNeedsPermission()) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  started = true;
  window.addEventListener("deviceorientation", onOrientation);
  window.addEventListener("devicemotion", onMotion);
}

/** Ask for permission (iOS) from a user gesture, then start listening. */
export async function enableMotion(): Promise<boolean> {
  try {
    const DOE = window.DeviceOrientationEvent as unknown as PermissionApi;
    const DME = window.DeviceMotionEvent as unknown as PermissionApi | undefined;
    if (typeof DOE?.requestPermission === "function") {
      const result = await DOE.requestPermission();
      if (result !== "granted") return false;
      await DME?.requestPermission?.().catch(() => "denied");
    }
    started = true;
    window.addEventListener("deviceorientation", onOrientation);
    window.addEventListener("devicemotion", onMotion);
    return true;
  } catch {
    return false;
  }
}

export function onShake(listener: Listener) {
  shakeListeners.add(listener);
  return () => {
    shakeListeners.delete(listener);
  };
}

export function onTiltState(listener: Listener) {
  stateListeners.add(listener);
  return () => {
    stateListeners.delete(listener);
  };
}

/** Short haptic tick where supported (Android). */
export function haptic(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* unsupported */
  }
}

/** Writes physics gravity outside React's render tracking (rapier World). */
export function setGravity(world: { gravity: { x: number; y: number; z: number } }, x: number, y: number, z: number) {
  world.gravity = { x, y, z };
}
