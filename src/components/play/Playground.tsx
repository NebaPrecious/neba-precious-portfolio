"use client";

/**
 * The home "toy box": a real-time physics playground. Letter blocks spelling
 * the name drop in, alongside props for both disciplines (code brackets,
 * a camera, a play button). The pointer drives an invisible pusher that
 * shoves things around; clicking/tapping bounces nearby objects.
 *
 * Loaded lazily by <PlayHero> only on capable devices with motion allowed.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRapier,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { haptic, onShake, setGravity, tilt } from "./motion";
import { usePalette } from "./palette";
import type { ToyboxScene } from "./types";

/* --------------------------------------------------------- letter texture */

function useLetterTexture(letter: string, face: string, ink: string, border: string) {
  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = face;
    ctx.fillRect(0, 0, size, size);
    // Inner bevel line so plain boxes read as rounded toy blocks.
    ctx.strokeStyle = border;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(14, 14, size - 28, size - 28, 28);
    ctx.stroke();
    const family = getComputedStyle(document.body).fontFamily || "sans-serif";
    ctx.fillStyle = ink;
    ctx.font = `800 ${size * 0.62}px ${family}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, size / 2, size / 2 + size * 0.04);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [letter, face, ink, border]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/* ------------------------------------------------------------------ bodies */

type BodyProps = { position: [number, number, number]; registry: React.RefObject<RapierRigidBody[]> };

function useRegister(registry: BodyProps["registry"]) {
  const ref = useRef<RapierRigidBody>(null);
  useEffect(() => {
    const body = ref.current;
    if (!body) return;
    registry.current.push(body);
    return () => {
      registry.current = registry.current.filter((b) => b !== body);
    };
  }, [registry]);
  return ref;
}

function randomRotation(): [number, number, number] {
  return [Math.random() * 0.6 - 0.3, Math.random() * 0.8 - 0.4, Math.random() * 0.6 - 0.3];
}

function LetterBlock({
  letter,
  size,
  face,
  ink,
  border,
  ...props
}: BodyProps & { letter: string; size: number; face: string; ink: string; border: string }) {
  const ref = useRegister(props.registry);
  const map = useLetterTexture(letter, face, ink, border);
  const [rotation] = useState(randomRotation);
  return (
    <RigidBody ref={ref} position={props.position} rotation={rotation} colliders="cuboid" restitution={0.25} friction={0.8}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial map={map} roughness={0.55} metalness={0.05} />
      </mesh>
    </RigidBody>
  );
}

/** `</>` — three rigid pieces for the engineering side. */
function CodeBrackets({ position, registry, color }: BodyProps & { color: string }) {
  const a = useRegister(registry);
  const b = useRegister(registry);
  const c = useRegister(registry);
  const material = <meshStandardMaterial color={color} roughness={0.35} metalness={0.1} />;
  const bar = (w: number) => <boxGeometry args={[w, 0.28, 0.5]} />;
  const [x, y, z] = position;
  return (
    <>
      <RigidBody ref={a} position={[x - 1.1, y, z]} colliders="cuboid" restitution={0.3}>
        <mesh castShadow position={[0, 0.32, 0]} rotation={[0, 0, 0.62]}>
          {bar(1.1)}
          {material}
        </mesh>
        <mesh castShadow position={[0, -0.32, 0]} rotation={[0, 0, -0.62]}>
          {bar(1.1)}
          {material}
        </mesh>
      </RigidBody>
      <RigidBody ref={b} position={[x, y + 0.8, z]} colliders="cuboid" restitution={0.3}>
        <mesh castShadow rotation={[0, 0, -1.15]}>
          {bar(1.6)}
          {material}
        </mesh>
      </RigidBody>
      <RigidBody ref={c} position={[x + 1.1, y + 1.4, z]} colliders="cuboid" restitution={0.3}>
        <mesh castShadow position={[0, 0.32, 0]} rotation={[0, 0, -0.62]}>
          {bar(1.1)}
          {material}
        </mesh>
        <mesh castShadow position={[0, -0.32, 0]} rotation={[0, 0, 0.62]}>
          {bar(1.1)}
          {material}
        </mesh>
      </RigidBody>
    </>
  );
}

/** A little video camera for the studio side. */
function Camera({ position, registry, body, lens, light }: BodyProps & { body: string; lens: string; light: string }) {
  const ref = useRegister(registry);
  const [rotation] = useState(randomRotation);
  return (
    <RigidBody ref={ref} position={position} rotation={rotation} colliders="cuboid" restitution={0.2}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 1, 0.9]} />
        <meshStandardMaterial color={body} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.4, 0.4, 24]} />
        <meshStandardMaterial color={lens} roughness={0.2} metalness={0.4} />
      </mesh>
      <mesh position={[0.5, 0.36, 0.46]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color={light} emissive={light} emissiveIntensity={2} />
      </mesh>
      <mesh castShadow position={[-0.25, 0.68, 0]}>
        <boxGeometry args={[0.6, 0.36, 0.5]} />
        <meshStandardMaterial color={body} roughness={0.6} />
      </mesh>
    </RigidBody>
  );
}

/** A triangular "play" prism. */
function PlayButton({ position, registry, color }: BodyProps & { color: string }) {
  const ref = useRegister(registry);
  return (
    <RigidBody ref={ref} position={position} colliders="hull" restitution={0.35}>
      <mesh castShadow rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.7, 0.7, 0.35, 3]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
    </RigidBody>
  );
}

function Marble({ position, registry, color }: BodyProps & { color: string }) {
  const ref = useRegister(registry);
  return (
    <RigidBody ref={ref} position={position} colliders="ball" restitution={0.6} friction={0.3}>
      <mesh castShadow>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.25} />
      </mesh>
    </RigidBody>
  );
}

/** Film reel: a disc with spoke holes. */
function FilmReel({ position, registry, color, hole }: BodyProps & { color: string; hole: string }) {
  const ref = useRegister(registry);
  const [rotation] = useState(randomRotation);
  return (
    <RigidBody ref={ref} position={position} rotation={rotation} colliders="hull" restitution={0.35}>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.28, 40]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.52, Math.sin(a) * 0.52, 0.15]}>
            <circleGeometry args={[0.18, 20]} />
            <meshStandardMaterial color={hole} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, 0.15]}>
        <circleGeometry args={[0.14, 20]} />
        <meshStandardMaterial color={hole} />
      </mesh>
    </RigidBody>
  );
}

/** Clapperboard with a striped top bar. */
function Clapper({ position, registry, body, stripe }: BodyProps & { body: string; stripe: string }) {
  const ref = useRegister(registry);
  const [rotation] = useState(randomRotation);
  const map = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 32;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = body;
    ctx.fillRect(0, 0, 256, 32);
    ctx.fillStyle = stripe;
    for (let x = -32; x < 256; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 32);
      ctx.lineTo(x + 24, 0);
      ctx.lineTo(x + 48, 0);
      ctx.lineTo(x + 24, 32);
      ctx.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [body, stripe]);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <RigidBody ref={ref} position={position} rotation={rotation} colliders="cuboid" restitution={0.2}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.25, 0.16]} />
        <meshStandardMaterial color={body} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0.78, 0]} rotation={[0, 0, 0.18]}>
        <boxGeometry args={[1.85, 0.26, 0.18]} />
        <meshStandardMaterial map={map} roughness={0.6} />
      </mesh>
    </RigidBody>
  );
}

/** Envelope: a flat block with a printed flap. */
function Envelope({ position, registry, paper, ink }: BodyProps & { paper: string; ink: string }) {
  const ref = useRegister(registry);
  const [rotation] = useState(randomRotation);
  const map = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 168;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, 256, 168);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 10;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(10, 12);
    ctx.lineTo(128, 96);
    ctx.lineTo(246, 12);
    ctx.stroke();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [paper, ink]);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <RigidBody ref={ref} position={position} rotation={rotation} colliders="cuboid" restitution={0.25}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.18, 1.12]} />
        <meshStandardMaterial attach="material-0" color={paper} />
        <meshStandardMaterial attach="material-1" color={paper} />
        <meshStandardMaterial attach="material-2" map={map} />
        <meshStandardMaterial attach="material-3" color={paper} />
        <meshStandardMaterial attach="material-4" color={paper} />
        <meshStandardMaterial attach="material-5" color={paper} />
      </mesh>
    </RigidBody>
  );
}

/* ------------------------------------------------------------------ world */

const BOUNDS = { x: 6.4, z: 4 };

function Walls() {
  // On wide screens the copy sits on the left: keep the toys out from under it.
  const { size } = useThree();
  const wide = size.width / size.height >= 1.3;
  const leftX = wide ? -5.2 : -BOUNDS.x - 0.5;
  return (
    <RigidBody type="fixed" colliders={false}>
      {/* Floor */}
      <CuboidCollider args={[40, 0.5, 40]} position={[0, -0.5, 0]} friction={1} />
      {/* Invisible walls keep everything inside the frame. */}
      <CuboidCollider args={[0.5, 10, BOUNDS.z]} position={[leftX, 10, 0]} />
      <CuboidCollider args={[0.5, 10, BOUNDS.z]} position={[BOUNDS.x + 0.5, 10, 0]} />
      <CuboidCollider args={[BOUNDS.x, 10, 0.5]} position={[0, 10, -BOUNDS.z - 0.5]} />
      <CuboidCollider args={[BOUNDS.x, 10, 0.5]} position={[0, 10, BOUNDS.z + 0.5]} />
    </RigidBody>
  );
}

/** Invisible kinematic ball that follows the pointer across the floor. */
function Pusher({ active, glow }: { active: React.RefObject<boolean>; glow: string }) {
  const body = useRef<RapierRigidBody>(null);
  const ring = useRef<THREE.Mesh>(null);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const current = useMemo(() => new THREE.Vector3(0, 0.7, 12), []);

  useFrame((state, delta) => {
    if (!body.current) return;
    state.raycaster.setFromCamera(state.pointer, state.camera);
    const target = active.current && state.raycaster.ray.intersectPlane(plane, hit) ? hit : null;
    const goal = target
      ? new THREE.Vector3(
          THREE.MathUtils.clamp(target.x, -BOUNDS.x, BOUNDS.x),
          0.7,
          THREE.MathUtils.clamp(target.z, -BOUNDS.z, BOUNDS.z),
        )
      : new THREE.Vector3(current.x, -4, current.z); // park below the floor when idle
    current.lerp(goal, 1 - Math.exp(-delta * 14));
    body.current.setNextKinematicTranslation(current);
    if (ring.current) {
      ring.current.position.set(current.x, 0.02, current.z);
      const material = ring.current.material as THREE.MeshBasicMaterial;
      material.opacity = THREE.MathUtils.lerp(material.opacity, target ? 0.55 : 0, 0.15);
    }
  });

  return (
    <>
      <RigidBody ref={body} type="kinematicPosition" colliders={false} position={[0, -4, 12]}>
        <BallCollider args={[0.75]} />
      </RigidBody>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.78, 48]} />
        <meshBasicMaterial color={glow} transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

/** Phone tilt steers gravity, so the toys roll around the floor. */
function TiltGravity({ registry }: { registry: React.RefObject<RapierRigidBody[]> }) {
  const { world } = useRapier();
  const last = useRef({ x: 0, z: 0 });
  useFrame(() => {
    if (!tilt.enabled) return;
    const gx = tilt.x * 22;
    const gz = tilt.y * 16;
    setGravity(world, gx, -24, gz);
    if (Math.abs(gx - last.current.x) + Math.abs(gz - last.current.z) > 1.2) {
      last.current = { x: gx, z: gz };
      registry.current.forEach((b) => b.wakeUp());
    }
  });
  return null;
}

/** Frames the play area for any aspect ratio (phones look from further back). */
function CameraRig() {
  const { camera, size, pointer } = useThree();
  const base = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const goal = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    const aspect = size.width / size.height;
    // Wide screens: the copy sits on the left, so frame the toys on the right.
    const wide = aspect >= 1.3;
    const distance = aspect < 0.8 ? 33 : wide ? 22 : 25;
    const shiftX = wide ? -4.6 : 0;
    // Portrait: lift the play area above the copy at the bottom.
    const shiftZ = aspect < 0.8 ? 5 : aspect < 1.3 ? 3 : 1.5;
    target.set(shiftX, 0, shiftZ);
    base.set(shiftX, distance * 0.68, distance * 0.62 + shiftZ);
    // Start already framed (no sweep from the default camera position).
    camera.position.copy(base);
    camera.lookAt(target);
  }, [size, base, target, camera]);
  useFrame(() => {
    // Gentle parallax towards the pointer.
    goal.set(base.x + pointer.x * 0.9, base.y + pointer.y * 0.5, base.z);
    camera.position.lerp(goal, 0.05);
    camera.lookAt(target);
  });
  return null;
}

/** What a page's toy box contains: one or two words of blocks, plus props. */
export type SceneConfig = Omit<ToyboxScene, "type">;

export type PlaygroundHandle = {
  /** Bounce everything near the pointer, or everything when `all` is true. */
  bounce: (all?: boolean) => void;
};

function Scene({
  pointerActive,
  scene,
  apiRef,
  paletteSource,
}: {
  pointerActive: React.RefObject<boolean>;
  scene: SceneConfig;
  apiRef: React.RefObject<PlaygroundHandle | null>;
  paletteSource: React.RefObject<HTMLElement | null>;
}) {
    const registry = useRef<RapierRigidBody[]>([]);
    const palette = usePalette(paletteSource);
    const { raycaster, camera, pointer } = useThree();
    const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

    useImperativeHandle(apiRef, () => ({
      bounce(all = false) {
        raycaster.setFromCamera(pointer, camera);
        const point = new THREE.Vector3();
        const hasPoint = !all && raycaster.ray.intersectPlane(plane, point);
        for (const body of registry.current) {
          const p = body.translation();
          const dx = p.x - (hasPoint ? point.x : 0);
          const dz = p.z - (hasPoint ? point.z : 0);
          const dist = Math.hypot(dx, dz);
          if (!all && dist > 3.4) continue;
          const mass = body.mass();
          const strength = all ? 1 : 1 - dist / 3.4;
          body.applyImpulse(
            {
              x: (dx / (dist || 1)) * 3 * mass * strength + (Math.random() - 0.5) * mass,
              y: (7 + Math.random() * 3) * mass * (all ? 1 : 0.4 + strength),
              z: (dz / (dist || 1)) * 3 * mass * strength,
            },
            true,
          );
          body.applyTorqueImpulse(
            { x: (Math.random() - 0.5) * mass, y: (Math.random() - 0.5) * mass, z: (Math.random() - 0.5) * mass },
            true,
          );
        }
      },
    }));

    // Shake the phone to toss everything.
    useEffect(
      () =>
        onShake(() => {
          haptic(30);
          apiRef.current?.bounce(true);
        }),
      [apiRef],
    );

    // Phones (portrait): a calmer scene with just the main word and a few toys.
    const { size } = useThree();
    const narrow = size.width / size.height < 0.8;
    const [first = "", second = ""] = scene.words;
    const big = [...first];
    const small = narrow ? [] : [...second];
    const sceneProps = narrow ? scene.props.filter((p) => p !== "marbles").slice(0, 1) : scene.props;
    const marbleCount = narrow ? Math.min(3, scene.props.filter((p) => p === "marbles").length * 3) : scene.props.filter((p) => p === "marbles").length * 5;
    // Big blocks shrink a little for long words so they fit the play area.
    const bigSize = big.length > 5 ? 1.35 : 1.7;
    const bigGap = bigSize + 0.35;
    // Props are spread across fixed spawn spots, left and right of the words.
    const spots: [number, number, number][] = [
      [-2.9, 9, 1.5],
      [4.2, 10, 1],
      [4.2, 13, -2.4],
      [-3.6, 12, -2.2],
      [0, 16, 3],
      [2.4, 18, 2.6],
      [-2.4, 19, -2.8],
    ];
    let spot = 0;
    const next = () => spots[spot++ % spots.length];

    return (
      <>
        <ambientLight intensity={0.55} />
        <hemisphereLight args={[palette.text, palette.bg, 0.5]} />
        <directionalLight
          castShadow
          position={[3, 16, 6]}
          intensity={1.7}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-bias={-0.0004}
        />
        <pointLight position={[-6, 4, 4]} intensity={18} color={palette.accent} distance={18} />

        {/* Shadow-catching floor: transparent, so the page colour shows through. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <shadowMaterial opacity={0.22} />
        </mesh>

        <CameraRig />

        <Physics gravity={[0, -24, 0]}>
          <Walls />
          <TiltGravity registry={registry} />
          <Pusher active={pointerActive} glow={palette.accent} />

          {big.map((letter, i) => (
            <LetterBlock
              key={`b-${i}`}
              registry={registry}
              letter={letter}
              size={bigSize}
              face={palette.surface}
              ink={palette.accent}
              border={palette.accent}
              position={[(i - (big.length - 1) / 2) * bigGap, 6 + i * 1.6, -1]}
            />
          ))}
          {small.map((letter, i) => (
            <LetterBlock
              key={`s-${i}`}
              registry={registry}
              letter={letter}
              size={0.95}
              face={palette.text}
              ink={palette.bg}
              border={palette.bg}
              position={[(i - (small.length - 1) / 2) * 1.12, 12 + i * 0.7, 1.6]}
            />
          ))}

          {sceneProps.map((kind, i) => {
            const at = next();
            switch (kind) {
              case "brackets":
                return <CodeBrackets key={i} registry={registry} position={at} color={palette.accent} />;
              case "camera":
                return <Camera key={i} registry={registry} position={at} body={palette.surface} lens={palette.text} light={palette.gold} />;
              case "play":
                return <PlayButton key={i} registry={registry} position={at} color={palette.gold} />;
              case "reel":
                return <FilmReel key={i} registry={registry} position={at} color={palette.text} hole={palette.bg} />;
              case "clapper":
                return <Clapper key={i} registry={registry} position={at} body={palette.surface} stripe={palette.text} />;
              case "envelope":
                return <Envelope key={i} registry={registry} position={at} paper={palette.text} ink={palette.accent} />;
              case "marbles":
                return null;
            }
          })}
          {Array.from({ length: marbleCount }, (_, i) => (
            <Marble
              key={`m-${i}`}
              registry={registry}
              position={[-3 + (i % 5) * 1.5, 15 + i, 3 - Math.floor(i / 5) * 2]}
              color={i % 2 ? palette.accent : palette.text}
            />
          ))}
        </Physics>
      </>
    );
}

export default function Playground({
  eventSource,
  paused,
  scene,
  apiRef,
  onReady,
}: {
  eventSource: React.RefObject<HTMLElement | null>;
  paused: boolean;
  scene: SceneConfig;
  apiRef: React.RefObject<PlaygroundHandle | null>;
  onReady?: () => void;
}) {
  const pointerActive = useRef(false);

  useEffect(() => {
    const el = eventSource.current;
    if (!el) return;
    const on = (e: PointerEvent) => {
      // Touch: only follow while a finger is down; mouse: follow on hover.
      pointerActive.current = e.pointerType === "mouse" ? true : e.buttons > 0 || e.type === "pointerdown";
    };
    const off = () => {
      pointerActive.current = false;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") off();
    };
    el.addEventListener("pointermove", on);
    el.addEventListener("pointerdown", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", off);
    return () => {
      el.removeEventListener("pointermove", on);
      el.removeEventListener("pointerdown", on);
      el.removeEventListener("pointerleave", off);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", off);
    };
  }, [eventSource]);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      frameloop={paused ? "never" : "always"}
      camera={{ position: [0, 9.5, 12], fov: 34, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      eventSource={eventSource as React.RefObject<HTMLElement>}
      eventPrefix="client"
      onCreated={() => onReady?.()}
      aria-hidden="true"
    >
      <Scene apiRef={apiRef} pointerActive={pointerActive} scene={scene} paletteSource={eventSource} />
    </Canvas>
  );
}
