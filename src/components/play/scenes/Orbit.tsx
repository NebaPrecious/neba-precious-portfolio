"use client";

/**
 * Studio hero: covers of real studio work orbit in 3D. Drag (or swipe) to
 * spin with momentum, hover to lift a frame, click to open it.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { tilt } from "../motion";
import { usePalette, type Palette } from "../palette";
import type { OrbitScene, SceneProps } from "../types";

type Card = OrbitScene["cards"][number];

function Frame({
  card,
  angle,
  radius,
  spin,
  palette,
  onOpen,
}: {
  card: Card;
  angle: number;
  radius: number;
  spin: React.RefObject<number>;
  palette: Palette;
  onOpen: (href: string) => void;
}) {
  const source = useTexture(card.url);
  const texture = useMemo(() => {
    const t = source.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  }, [source]);
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  const aspect = card.width / card.height;
  const h = aspect < 0.8 ? 2.6 : aspect > 1.3 ? 1.75 : 2.2;
  const w = h * aspect;

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const a = angle + spin.current;
    const bob = Math.sin(a * 2 + angle) * 0.25;
    g.position.set(Math.sin(a) * radius, bob, Math.cos(a) * radius);
    g.lookAt(camera.position.x, g.position.y, camera.position.z);
    const front = (Math.cos(a) + 1) / 2; // 1 = closest to camera
    const target = (hovered ? 1.12 : 1) * (0.78 + front * 0.32);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, target, 8, delta));
    if (material.current) material.current.opacity = 0.35 + front * 0.65;
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0, -0.02]} scale={hovered ? 1 : 0.001}>
        <planeGeometry args={[w + 0.12, h + 0.12]} />
        <meshBasicMaterial color={palette.accent} />
      </mesh>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onOpen(card.href);
        }}
      >
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial ref={material} map={texture} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function Ring({ cards, eventSource, palette }: { cards: Card[]; eventSource: React.RefObject<HTMLElement | null>; palette: Palette }) {
  const router = useRouter();
  const { size } = useThree();
  const wide = size.width / size.height >= 1.3;
  const spin = useRef(0);
  const velocity = useRef(0.18);
  const drag = useRef<{ x: number; t: number } | null>(null);

  // Drag / swipe to spin, with momentum.
  useEffect(() => {
    const el = eventSource.current;
    if (!el) return;
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) return;
      drag.current = { x: e.clientX, t: performance.now() };
    };
    const move = (e: PointerEvent) => {
      if (!drag.current) return;
      const dx = e.clientX - drag.current.x;
      const dt = Math.max(1, performance.now() - drag.current.t);
      spin.current += dx * 0.006;
      velocity.current = (dx * 0.006 * 1000) / dt;
      drag.current = { x: e.clientX, t: performance.now() };
    };
    const up = () => {
      drag.current = null;
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [eventSource]);

  useFrame((_, delta) => {
    if (drag.current) return;
    // Ease back to a gentle idle drift.
    const idle = 0.18 + (tilt.enabled ? tilt.x * 1.4 : 0);
    velocity.current = THREE.MathUtils.damp(velocity.current, idle, 1.2, delta);
    spin.current += velocity.current * delta;
  });

  // Repeat covers so the ring always looks full.
  const minCards = wide ? 8 : 6;
  const ringCards = useMemo(() => {
    const out: Card[] = [];
    while (out.length < Math.max(minCards, cards.length)) out.push(...cards);
    return out.slice(0, Math.max(minCards, wide ? cards.length : Math.min(cards.length, 8)));
  }, [cards, minCards, wide]);
  const radius = Math.max(3.6, ringCards.length * 0.46);

  return (
    <group
      position={[wide ? 4.4 : 0, wide ? 0.2 : 2.2, wide ? -1 : -2]}
      rotation={[0.1, 0, 0]}
      scale={wide ? 0.82 : 0.74}
    >
      {ringCards.map((card, i) => (
        <Frame
          key={`${card.href}-${i}`}
          card={card}
          angle={(i / ringCards.length) * Math.PI * 2}
          radius={radius}
          spin={spin}
          palette={palette}
          onOpen={(href) => router.push(href)}
        />
      ))}
    </group>
  );
}

export default function Orbit({ scene, eventSource, paused, onReady }: SceneProps<OrbitScene>) {
  const palette = usePalette(eventSource);
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={paused ? "never" : "always"}
      camera={{ position: [0, 1.4, 12], fov: 36 }}
      gl={{ antialias: true, alpha: true }}
      eventSource={eventSource as React.RefObject<HTMLElement>}
      eventPrefix="client"
      onCreated={() => onReady?.()}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Ring cards={scene.cards} eventSource={eventSource} palette={palette} />
      </Suspense>
    </Canvas>
  );
}
