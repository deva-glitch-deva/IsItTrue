"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { VERDICT_META } from "@/lib/constants";
import type { Verdict } from "@/lib/types";

function tickColor(index: number) {
  if (index < 4) return "#1fae6a";
  if (index < 8) return "#f5a623";
  return "#ef4444";
}

function Needle({ settled, verdict }: { settled: boolean; verdict: Verdict }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef(-0.2);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (settled) {
      const meta = VERDICT_META[verdict];
      const map: Record<Verdict, number> = {
        TRUE: 0.92,
        MISLEADING: 0,
        FALSE: -0.92,
        UNVERIFIED: -0.18,
      };
      target.current = map[verdict];
      void meta;
    } else {
      const t = state.clock.getElapsedTime();
      target.current =
        Math.sin(t * 7.2) * 1.05 + Math.sin(t * 17.1) * 0.2 + Math.sin(t * 3.1) * 0.15;
    }
    group.current.rotation.z = THREE.MathUtils.damp(
      group.current.rotation.z,
      target.current,
      settled ? 9 : 20,
      delta,
    );
  });

  return (
    <group ref={group} position={[0, 0, 0.55]}>
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[0.09, 1.75, 0.1]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.09, 0.16, 0.3, 20]} />
        <meshStandardMaterial color="#24170f" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#f5a623" metalness={0.3} roughness={0.32} />
      </mesh>
    </group>
  );
}

function Gauge({ settled, verdict }: { settled: boolean; verdict: Verdict }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
    group.current.rotation.x = -0.04 + state.pointer.y * 0.04;
  });

  const ticks = Array.from({ length: 13 }, (_, index) => {
    const angle = (-2.2 + (index / 12) * 4.4) * 1;
    return { angle, index };
  });

  return (
    <group ref={group}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.42, 64]} />
        <meshStandardMaterial color="#f5edde" roughness={0.48} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.22]}>
        <cylinderGeometry args={[2.18, 2.18, 0.08, 64]} />
        <meshStandardMaterial color="#e8d9c2" roughness={0.8} />
      </mesh>
      {ticks.map(({ angle, index }) => (
        <mesh
          key={index}
          position={[
            Math.sin(angle) * 1.82,
            Math.cos(angle) * 1.82,
            0.32,
          ]}
          rotation={[0, 0, -angle]}
        >
          <boxGeometry args={[0.07, index % 3 === 0 ? 0.36 : 0.2, 0.06]} />
          <meshStandardMaterial
            color={tickColor(index)}
            emissive={tickColor(index)}
            emissiveIntensity={0.12}
          />
        </mesh>
      ))}
      <Needle settled={settled} verdict={verdict} />
      <RoundedBox
        args={[1.35, 0.36, 0.18]}
        radius={0.12}
        smoothness={4}
        position={[0, -1.8, 0.34]}
      >
        <meshStandardMaterial color="#24170f" roughness={0.55} />
      </RoundedBox>
      <mesh position={[-2.4, -1.9, 0.1]}>
        <sphereGeometry args={[0.25, 20, 20]} />
        <meshStandardMaterial color="#8ee4b8" roughness={0.5} />
      </mesh>
      <mesh position={[2.4, -1.9, 0.1]}>
        <sphereGeometry args={[0.25, 20, 20]} />
        <meshStandardMaterial color="#ff8fa3" roughness={0.5} />
      </mesh>
    </group>
  );
}

export default function GaugeScene({
  settled = false,
  verdict = "UNVERIFIED",
}: {
  settled?: boolean;
  verdict?: Verdict;
}) {
  return (
    <Canvas
      dpr={[1, 1.35]}
      camera={{ position: [0, 0, 6.4], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 5, 5]} intensity={2.4} />
      <directionalLight position={[-4, -2, 3]} intensity={0.5} color="#83c7ff" />
      <Gauge settled={settled} verdict={verdict} />
    </Canvas>
  );
}
