"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { VERDICT_META } from "@/lib/constants";
import type { Verdict } from "@/lib/types";

function StampBody({ verdict }: { verdict: Verdict }) {
  const group = useRef<THREE.Group>(null);
  const pressed = useRef(0);
  const meta = VERDICT_META[verdict];
  const color = useMemo(() => new THREE.Color(meta.color), [meta.color]);
  const cream = useMemo(() => new THREE.Color(meta.bg), [meta.bg]);
  const ink = useMemo(() => new THREE.Color(meta.deep), [meta.deep]);

  useFrame((state, delta) => {
    if (!group.current) return;
    pressed.current = Math.min(1, pressed.current + delta * 1.7);
    const t = pressed.current;
    const drop = THREE.MathUtils.lerp(2.4, 0, Math.min(1, t * 1.35));
    const squash =
      t > 0.55 ? 1 - Math.sin((t - 0.55) * 18) * 0.06 * (1 - t) : 1;
    group.current.position.y = drop;
    group.current.scale.y = squash;
    group.current.rotation.x =
      -0.28 + Math.sin(state.clock.elapsedTime * 0.7) * 0.04;
    group.current.rotation.y = -0.18 + state.pointer.x * 0.18;
    group.current.rotation.z = -0.08;
  });

  return (
    <group ref={group}>
      <RoundedBox args={[3.6, 0.42, 2.2]} radius={0.16} smoothness={4} castShadow>
        <meshStandardMaterial color={color} roughness={0.38} metalness={0.08} />
      </RoundedBox>
      <RoundedBox
        args={[3.28, 0.18, 1.92]}
        radius={0.1}
        smoothness={4}
        position={[0, 0.28, 0]}
      >
        <meshStandardMaterial color={cream} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, -0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.28, 24]} />
        <meshStandardMaterial color={ink} roughness={0.45} />
      </mesh>
      <mesh position={[1.35, 0.12, 0.85]}>
        <cylinderGeometry args={[0.28, 0.32, 0.18, 28]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Paper() {
  return (
    <group position={[0, -0.55, 0]}>
      <RoundedBox args={[4.6, 0.08, 3.1]} radius={0.08} receiveShadow>
        <meshStandardMaterial color="#f5edde" roughness={0.85} />
      </RoundedBox>
      {[-0.7, -0.35, 0, 0.35].map((z) => (
        <mesh key={z} position={[0.15, 0.06, z]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.4, 0.045]} />
          <meshStandardMaterial color="#d8c9b0" />
        </mesh>
      ))}
    </group>
  );
}

export default function StampScene({ verdict }: { verdict: Verdict }) {
  return (
    <Canvas
      dpr={[1, 1.4]}
      camera={{ position: [0, 2.6, 5.4], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      shadows
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[3, 6, 4]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 2, 3]} intensity={0.55} color="#83c7ff" />
      <Paper />
      <StampBody verdict={verdict} />
    </Canvas>
  );
}
