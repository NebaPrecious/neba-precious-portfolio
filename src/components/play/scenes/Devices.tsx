"use client";

/**
 * Work hero: real project screenshots on floating 3D devices. Drag to spin the
 * whole arrangement (springs back), hover lifts a device, click opens the
 * project. Phones for portrait screens, displays for landscape ones.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Float, PresentationControls, RoundedBox, useTexture } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { tilt } from "../motion";
import { usePalette, type Palette } from "../palette";
import type { DevicesScene, SceneProps } from "../types";

type Screen = DevicesScene["screens"][number];

function Device({
  screen,
  position,
  rotationY,
  palette,
  onOpen,
}: {
  screen: Screen;
  position: [number, number, number];
  rotationY: number;
  palette: Palette;
  onOpen: (href: string) => void;
}) {
  const source = useTexture(screen.url);
  const texture = useMemo(() => {
    const t = source.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  }, [source]);
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const aspect = screen.width / screen.height;
  const portrait = aspect < 0.85;
  const h = portrait ? 3.4 : Math.min(2.3, 3.8 / aspect);
  const w = h * aspect;
  const bezel = portrait ? 0.14 : 0.12;

  useFrame((_, delta) => {
    if (!group.current) return;
    const target = hovered ? 1.07 : 1;
    const s = THREE.MathUtils.damp(group.current.scale.x, target, 10, delta);
    group.current.scale.setScalar(s);
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, position[2] + (hovered ? 0.5 : 0), 10, delta);
  });

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]}>
      <RoundedBox args={[w + bezel * 2, h + bezel * 2, 0.18]} radius={portrait ? 0.22 : 0.08} smoothness={4} castShadow>
        <meshStandardMaterial color={palette.surface} roughness={0.35} metalness={0.45} />
      </RoundedBox>
      {/* Screen */}
      <mesh
        position={[0, 0, 0.092]}
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
          onOpen(screen.href);
        }}
      >
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {portrait ? (
        <mesh position={[0, h / 2 - 0.12, 0.095]}>
          <planeGeometry args={[0.5, 0.12]} />
          <meshBasicMaterial color={palette.bg} />
        </mesh>
      ) : (
        // A stand for displays.
        <mesh position={[0, -h / 2 - 0.55, -0.2]} castShadow>
          <boxGeometry args={[0.18, 0.9, 0.18]} />
          <meshStandardMaterial color={palette.surface} metalness={0.5} roughness={0.4} />
        </mesh>
      )}
      {/* Accent edge glow when hovered */}
      <mesh position={[0, 0, -0.1]} scale={hovered ? 1 : 0.001}>
        <planeGeometry args={[w + bezel * 2 + 0.16, h + bezel * 2 + 0.16]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function Rig({ screens, palette }: { screens: Screen[]; palette: Palette }) {
  const router = useRouter();
  const { size } = useThree();
  const wide = size.width / size.height >= 1.3;
  const n = screens.length;
  const tiltGroup = useRef<THREE.Group>(null);

  // On phones, tilting turns the whole arrangement.
  useFrame((_, delta) => {
    const g = tiltGroup.current;
    if (!g || !tilt.enabled) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, tilt.x * 0.7, 4, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tilt.y * 0.25, 4, delta);
  });

  // An arc: centre device forward, the rest fanned back and angled inward.
  const layout = useMemo(
    () =>
      screens.map((_, i) => {
        const t = n === 1 ? 0 : i / (n - 1) - 0.5; // -0.5..0.5
        const x = t * (n - 1) * 2.5;
        const z = -Math.abs(t) * 2.2;
        return { position: [x, 0, z] as [number, number, number], rotationY: -t * 0.9 };
      }),
    [screens, n],
  );

  return (
    <group position={[wide ? 2.9 : 0, wide ? 0.2 : 1.2, 0]} scale={wide ? 0.82 : 0.52}>
      <PresentationControls
        global
        snap
        rotation={[0, wide ? -0.25 : 0, 0]}
        polar={[-0.25, 0.25]}
        azimuth={[-0.9, 0.9]}
        speed={1.6}
      >
        <group ref={tiltGroup}>
        {screens.map((screen, i) => (
          <Float key={screen.url + i} speed={1.2 + i * 0.15} rotationIntensity={0.25} floatIntensity={0.6}>
            <Device
              screen={screen}
              position={layout[i].position}
              rotationY={layout[i].rotationY}
              palette={palette}
              onOpen={(href) => router.push(href)}
            />
          </Float>
        ))}
        </group>
      </PresentationControls>
      <ContactShadows position={[0, -2.6, 0]} opacity={0.35} scale={18} blur={2.6} far={5} />
    </group>
  );
}

export default function Devices({ scene, eventSource, paused, onReady }: SceneProps<DevicesScene>) {
  const palette = usePalette(eventSource);
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={paused ? "never" : "always"}
      camera={{ position: [0, 0.6, 11], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      eventSource={eventSource as React.RefObject<HTMLElement>}
      eventPrefix="client"
      onCreated={() => onReady?.()}
      aria-hidden="true"
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 6, 8]} intensity={1.6} />
      <pointLight position={[-6, 2, 4]} intensity={20} color={palette.accent} distance={20} />
      <Suspense fallback={null}>
        <Rig screens={scene.screens.slice(0, 5)} palette={palette} />
      </Suspense>
    </Canvas>
  );
}
