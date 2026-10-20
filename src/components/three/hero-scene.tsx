"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Float,
  MeshDistortMaterial,
  QuadraticBezierLine,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";

function QuestionMark() {
  return (
    <group position={[0, 0.08, 0.86]} rotation={[0, 0, -0.1]}>
      <mesh rotation={[0, 0, Math.PI * 0.78]}>
        <torusGeometry args={[0.34, 0.105, 18, 44, Math.PI * 1.36]} />
        <meshStandardMaterial color="#24170f" roughness={0.55} />
      </mesh>
      <mesh position={[0.13, -0.5, 0]}>
        <cylinderGeometry args={[0.105, 0.105, 0.32, 18]} />
        <meshStandardMaterial color="#24170f" roughness={0.55} />
      </mesh>
      <mesh position={[0.13, -0.75, 0]}>
        <sphereGeometry args={[0.12, 20, 20]} />
        <meshStandardMaterial color="#24170f" roughness={0.55} />
      </mesh>
    </group>
  );
}

function TruthOrb() {
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[1.35, 64, 64]} />
        <MeshDistortMaterial
          color="#ff6a3d"
          distort={0.24}
          speed={1.6}
          roughness={0.48}
          metalness={0.04}
        />
      </mesh>
      <QuestionMark />
      <mesh position={[-0.58, 0.55, 1.08]}>
        <sphereGeometry args={[0.13, 18, 18]} />
        <meshStandardMaterial color="#ffe28a" roughness={0.3} />
      </mesh>
    </group>
  );
}

function Magnifier() {
  return (
    <group position={[1.95, 1.25, 0.3]} rotation={[0.1, -0.2, -0.65]}>
      <mesh>
        <torusGeometry args={[0.62, 0.17, 24, 60]} />
        <meshStandardMaterial color="#8ee4b8" roughness={0.38} metalness={0.08} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.53, 48]} />
        <meshPhysicalMaterial
          color="#c9f7e2"
          transparent
          opacity={0.58}
          roughness={0.08}
          metalness={0}
          transmission={0.5}
          thickness={0.3}
        />
      </mesh>
      <mesh position={[0.94, -1.0, 0]} rotation={[0, 0, -0.7]}>
        <cylinderGeometry args={[0.16, 0.2, 1.35, 24]} />
        <meshStandardMaterial color="#2b2018" roughness={0.6} />
      </mesh>
      <mesh position={[0.94, -1.0, 0]} rotation={[0, 0, -0.7]}>
        <cylinderGeometry args={[0.12, 0.15, 1.1, 24]} />
        <meshStandardMaterial color="#f5edde" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Coin({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={2.4} rotationIntensity={1.2} floatIntensity={0.7}>
      <group position={position} rotation={[0.5, 0.2, 0.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.09, 36]} />
          <meshStandardMaterial
            color="#f5a623"
            roughness={0.35}
            metalness={0.45}
          />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <torusGeometry args={[0.19, 0.035, 10, 30]} />
          <meshStandardMaterial color="#9a5d00" roughness={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

function EvidenceCard() {
  return (
    <Float speed={1.4} rotationIntensity={0.55} floatIntensity={0.45}>
      <group
        position={[-2.15, -0.9, 0.2]}
        rotation={[0.1, 0.62, 0.15]}
      >
        <RoundedBox args={[1.5, 1.9, 0.08]} radius={0.08} smoothness={4} castShadow>
          <meshStandardMaterial color="#f5edde" roughness={0.82} />
        </RoundedBox>
        {[0.5, 0.25, 0, -0.25, -0.5].map((y, index) => (
          <mesh key={y} position={[0, y, 0.055]}>
            <boxGeometry args={[index === 0 ? 0.85 : 1.05, 0.055, 0.02]} />
            <meshStandardMaterial
              color={index === 0 ? "#ff6a3d" : "#a99a86"}
              roughness={0.9}
            />
          </mesh>
        ))}
        <mesh position={[0.5, 0.76, 0.06]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.58, 0.12, 0.02]} />
          <meshStandardMaterial color="#ffe28a" roughness={0.7} />
        </mesh>
      </group>
    </Float>
  );
}

function RedStrings() {
  return (
    <group>
      <QuadraticBezierLine
        start={[-2.1, 0.1, 0.35]}
        end={[1.4, 1.0, 0.3]}
        mid={[-0.2, 1.1, 0.55]}
        color="#d94a4a"
        lineWidth={2.4}
      />
      <QuadraticBezierLine
        start={[-1.9, -0.4, 0.3]}
        end={[1.65, 1.05, 0.35]}
        mid={[0.2, -0.45, 0.55]}
        color="#d94a4a"
        lineWidth={1.6}
      />
    </group>
  );
}

function ClaySticker({
  position,
  color,
  rotation,
}: {
  position: [number, number, number];
  color: string;
  rotation: [number, number, number];
}) {
  return (
    <Float speed={1.8} rotationIntensity={0.8} floatIntensity={0.55}>
      <RoundedBox
        args={[0.75, 0.75, 0.14]}
        radius={0.14}
        smoothness={4}
        position={position}
        rotation={rotation}
        castShadow
      >
        <meshStandardMaterial color={color} roughness={0.5} />
      </RoundedBox>
    </Float>
  );
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  const rig = useRef<THREE.Group>(null);
  const cameraRig = useRef<THREE.Group>(null);
  const gyro = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!rig.current) return;
    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      const orient = window as Window & {
        __iitGyro?: { x: number; y: number };
      };
      if (orient.__iitGyro) gyro.current = orient.__iitGyro;
    }
    const targetX = state.pointer.y * 0.12 + gyro.current.x * 0.08;
    const targetY = state.pointer.x * 0.28 + gyro.current.y * 0.12;
    rig.current.rotation.x = THREE.MathUtils.damp(
      rig.current.rotation.x,
      targetX,
      3,
      delta,
    );
    rig.current.rotation.y = THREE.MathUtils.damp(
      rig.current.rotation.y,
      targetY,
      3,
      delta,
    );
    if (!reducedMotion && cameraRig.current) {
      const progress = Math.min(
        1,
        Math.max(0, window.scrollY / Math.max(1, window.innerHeight)),
      );
        cameraRig.current.position.y = THREE.MathUtils.damp(
          cameraRig.current.position.y,
          -0.12 + progress * 0.12,
          2,
          delta,
        );
        cameraRig.current.position.z = THREE.MathUtils.damp(
          cameraRig.current.position.z,
          progress * 1.1,
          2,
          delta,
        );
        cameraRig.current.rotation.x = THREE.MathUtils.damp(
          cameraRig.current.rotation.x,
          progress * -0.05,
          2,
          delta,
        );
    }
  });

  return (
    <group ref={cameraRig} position={[0, -0.12, 0]}>
      <group ref={rig} rotation={[0.05, -0.15, 0]} scale={0.86}>
        <TruthOrb />
        <Magnifier />
        <EvidenceCard />
        <Coin position={[-1.7, 1.15, 0.7]} />
        <Coin position={[1.55, -1.35, 0.85]} />
        <Coin position={[-0.85, -1.5, 1.1]} />
        <ClaySticker
          position={[1.85, -0.45, -0.2]}
          color="#ffe28a"
          rotation={[0.2, -0.3, 0.3]}
        />
        <ClaySticker
          position={[-2.05, 0.55, -0.4]}
          color="#83c7ff"
          rotation={[-0.1, 0.4, -0.2]}
        />
        <ClaySticker
          position={[1.15, 1.35, -0.8]}
          color="#ff8fa3"
          rotation={[0.4, 0.2, -0.3]}
        />
        <RedStrings />
      </group>
      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={0.14}
        scale={8}
        blur={3.8}
        far={4}
        color="#1a140f"
      />
    </group>
  );
}

export default function HeroScene({ reducedMotion = false }: { reducedMotion?: boolean }) {
  useEffect(() => {
    const onOrient = (event: DeviceOrientationEvent) => {
      const tagged = window as Window & {
        __iitGyro?: { x: number; y: number };
      };
      tagged.__iitGyro = {
        x: Math.max(-1, Math.min(1, (event.beta ?? 0) / 45)),
        y: Math.max(-1, Math.min(1, (event.gamma ?? 0) / 45)),
      };
    };
    window.addEventListener("deviceorientation", onOrient, { passive: true });
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, []);
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.04, 8.6], fov: 36 }}
      gl={{ antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: "high-performance" }}
      shadows
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x000000, 0);
        scene.background = null;
      }}
      className="h-full w-full !bg-transparent"
      style={{ touchAction: "pan-y", width: "100%", height: "100%", display: "block", background: "transparent" }}
    >
      <ambientLight intensity={1.35} />
      <directionalLight
        position={[4, 6, 6]}
        intensity={2.3}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 1, 4]} intensity={0.7} color="#83c7ff" />
      <pointLight position={[0, -4, 3]} intensity={0.7} color="#ff6a3d" />
      <Scene reducedMotion={reducedMotion} />
    </Canvas>
  );
}
