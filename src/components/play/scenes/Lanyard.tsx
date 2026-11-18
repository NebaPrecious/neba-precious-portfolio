"use client";

/**
 * About hero: a conference-style badge with the portrait, hanging from a
 * lanyard (rope joints). Grab it, drag it around and let go — it swings and
 * settles back to face you.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useRapier,
  useSphericalJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import { RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { setGravity, tilt } from "../motion";
import { usePalette, type Palette } from "../palette";
import type { LanyardScene, SceneProps } from "../types";

const SEGMENTS = 24;
const UP = new THREE.Vector3(0, 1, 0);
const CARD_W = 1.6;
const CARD_H = 2.25;

/** Paints the badge face (portrait, name, title, brands) into a texture. */
function useBadgeTexture(scene: LanyardScene, palette: Palette) {
  const [texture] = useState(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 900;
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  });

  useEffect(() => {
    const canvas = texture.image as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    const family = getComputedStyle(document.body).fontFamily || "sans-serif";
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono") || "monospace";

    const draw = (img?: HTMLImageElement) => {
      ctx.fillStyle = palette.text;
      ctx.fillRect(0, 0, W, H);
      // Header band
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, W, 120);
      ctx.fillStyle = palette.accent;
      ctx.fillRect(40, 44, 30, 30);
      ctx.fillStyle = palette.text;
      ctx.fillRect(70, 44, 30, 30);
      ctx.font = `700 30px ${mono}`;
      ctx.fillStyle = palette.text;
      ctx.textBaseline = "middle";
      ctx.fillText("ACCESS · ALL AREAS", 124, 60);
      // Portrait
      const px = 60;
      const py = 160;
      const ps = W - 120;
      ctx.fillStyle = palette.surface;
      ctx.fillRect(px, py, ps, ps * 0.92);
      if (img) {
        const s = Math.max(ps / img.width, (ps * 0.92) / img.height);
        const iw = img.width * s;
        const ih = img.height * s;
        ctx.save();
        ctx.beginPath();
        ctx.rect(px, py, ps, ps * 0.92);
        ctx.clip();
        ctx.drawImage(img, px + (ps - iw) / 2, py + (ps * 0.92 - ih) * 0.3, iw, ih);
        ctx.restore();
      }
      // Name + title
      ctx.fillStyle = palette.bg;
      ctx.textBaseline = "alphabetic";
      ctx.font = `800 58px ${family}`;
      ctx.fillText(scene.name, 60, py + ps * 0.92 + 90);
      ctx.font = `600 30px ${family}`;
      ctx.fillStyle = palette.surface;
      ctx.fillText(scene.title, 60, py + ps * 0.92 + 136);
      // Footer band with brands
      ctx.fillStyle = palette.accent;
      ctx.fillRect(0, H - 96, W, 96);
      ctx.fillStyle = palette.bg;
      ctx.font = `700 24px ${mono}`;
      ctx.fillText(scene.lines.join("  ·  ").toUpperCase(), 40, H - 40);
      texture.needsUpdate = true;
    };

    draw();
    if (scene.portrait) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => draw(img);
      img.src = scene.portrait;
    }
  }, [texture, scene, palette]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function Band({ scene, palette }: { scene: LanyardScene; palette: Palette }) {
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<RapierRigidBody>(null!);
  const j2 = useRef<RapierRigidBody>(null!);
  const j3 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);
  const band = useRef<THREE.InstancedMesh>(null);
  const mid = useMemo(() => new THREE.Vector3(), []);
  const seg = useMemo(() => new THREE.Vector3(), []);
  const scl = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const mat = useMemo(() => new THREE.Matrix4(), []);
  const { size } = useThree();
  const wide = size.width / size.height >= 1.3;

  const vec = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]),
    [],
  );
  const [dragged, setDragged] = useState<THREE.Vector3 | null>(null);
  const [hovered, setHovered] = useState(false);
  const face = useBadgeTexture(scene, palette);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, CARD_H / 2 + 0.05, 0],
  ]);

  useEffect(() => {
    document.body.style.cursor = dragged ? "grabbing" : hovered ? "grab" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered, dragged]);

  const { world } = useRapier();

  useFrame((state) => {
    if (tilt.enabled) {
      setGravity(world, tilt.x * 30, -40, tilt.y * 10);
      card.current?.wakeUp();
    }
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((r) => r.current?.wakeUp());
      card.current.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current && j1.current && j2.current && j3.current && band.current) {
      curve.points[0].copy(j3.current.translation() as THREE.Vector3);
      curve.points[1].copy(j2.current.translation() as THREE.Vector3);
      curve.points[2].copy(j1.current.translation() as THREE.Vector3);
      curve.points[3].copy(fixed.current.translation() as THREE.Vector3);
      // Strap = a chain of short cylinders along the smoothed rope.
      const pts = curve.getPoints(SEGMENTS);
      for (let i = 0; i < SEGMENTS; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        mid.copy(a).add(b).multiplyScalar(0.5);
        seg.copy(b).sub(a);
        const len = seg.length();
        quat.setFromUnitVectors(UP, seg.normalize());
        mat.compose(mid, quat, scl.set(1, len, 1));
        band.current.setMatrixAt(i, mat);
      }
      band.current.instanceMatrix.needsUpdate = true;
    }
    if (card.current) {
      // Gently turn the badge back to face the viewer.
      const ang = card.current.angvel();
      const rot = card.current.rotation();
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
    }
  });

  const segment = { type: "dynamic" as const, canSleep: true, angularDamping: 2, linearDamping: 2 };

  return (
    <>
      <group position={[wide ? 3.2 : 0, wide ? 4.2 : 5.6, 0]}>
        <RigidBody ref={fixed} {...segment} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segment}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segment}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segment}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segment}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[CARD_W / 2, CARD_H / 2, 0.02]} />
          <group
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerUp={(e) => {
              (e.target as Element)?.releasePointerCapture?.(e.pointerId);
              setDragged(null);
            }}
            onPointerDown={(e) => {
              (e.target as Element)?.setPointerCapture?.(e.pointerId);
              if (!card.current) return;
              setDragged(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation() as THREE.Vector3)));
            }}
          >
            <RoundedBox args={[CARD_W, CARD_H, 0.04]} radius={0.08} smoothness={4}>
              <meshStandardMaterial color={palette.text} roughness={0.5} />
            </RoundedBox>
            <mesh position={[0, 0, 0.021]}>
              <planeGeometry args={[CARD_W - 0.04, CARD_H - 0.04]} />
              <meshStandardMaterial map={face} roughness={0.45} />
            </mesh>
            <mesh position={[0, 0, -0.021]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[CARD_W - 0.04, CARD_H - 0.04]} />
              <meshStandardMaterial color={palette.bg} roughness={0.6} />
            </mesh>
            {/* Clip */}
            <mesh position={[0, CARD_H / 2 + 0.02, 0]}>
              <boxGeometry args={[0.32, 0.14, 0.08]} />
              <meshStandardMaterial color={palette.surface} metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        </RigidBody>
      </group>
      <instancedMesh ref={band} args={[undefined, undefined, SEGMENTS]} frustumCulled={false}>
        <cylinderGeometry args={[0.045, 0.045, 1.02, 8]} />
        <meshStandardMaterial color={palette.accent} roughness={0.55} />
      </instancedMesh>
    </>
  );
}

export default function Lanyard({ scene, eventSource, paused, onReady }: SceneProps<LanyardScene>) {
  const palette = usePalette(eventSource);
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={paused ? "never" : "always"}
      camera={{ position: [0, 0, 13], fov: 25 }}
      gl={{ antialias: true, alpha: true }}
      eventSource={eventSource as React.RefObject<HTMLElement>}
      eventPrefix="client"
      onCreated={() => onReady?.()}
      aria-hidden="true"
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 5, 8]} intensity={1.6} />
      <pointLight position={[-4, 0, 5]} intensity={14} color={palette.accent} distance={16} />
      <Physics gravity={[0, -40, 0]} timeStep={1 / 60}>
        <Band scene={scene} palette={palette} />
      </Physics>
    </Canvas>
  );
}
