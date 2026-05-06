import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Sphere,
  Box,
  Torus,
} from "@react-three/drei";
import useReducedMotion from "../../hooks/useReducedMotion";

// eslint-disable-next-line react-refresh/only-export-components
export function isWebGLSupported() {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    const isLowEnd =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

    return gl !== null && !isLowEnd;
  } catch {
    return false;
  }
}

function AnimatedCard({ position, rotation, color, delay = 0 }) {
  const meshRef = useRef();
  const reducedMotion = useReducedMotion();

  useFrame((state) => {
    if (!meshRef.current || reducedMotion) return;

    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(time * 0.5 + delay) * 0.3;
    meshRef.current.rotation.x = Math.sin(time * 0.3 + delay) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Box
        ref={meshRef}
        position={position}
        rotation={rotation}
        args={[1.5, 1, 0.05]}
      >
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.2}
          speed={reducedMotion ? 0 : 2}
          roughness={0.3}
          metalness={0.7}
        />
      </Box>
    </Float>
  );
}

function AnimatedSphere({ position, color, scale = 1 }) {
  const meshRef = useRef();
  const reducedMotion = useReducedMotion();

  useFrame((state) => {
    if (!meshRef.current || reducedMotion) return;

    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.2;
    meshRef.current.rotation.x = time * 0.1;
  });

  return (
    <Sphere ref={meshRef} position={position} args={[0.5 * scale, 32, 32]}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.3}
        speed={reducedMotion ? 0 : 1.5}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

function AnimatedTorus({ position, color }) {
  const meshRef = useRef();
  const reducedMotion = useReducedMotion();

  useFrame((state) => {
    if (!meshRef.current || reducedMotion) return;

    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * 0.3;
    meshRef.current.rotation.y = time * 0.4;
  });

  return (
    <Torus ref={meshRef} position={position} args={[0.6, 0.2, 16, 100]}>
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
    </Torus>
  );
}

function HeroScene() {
  const reducedMotion = useReducedMotion();
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current || reducedMotion) return;

    groupRef.current.rotation.y += delta * 0.1;
  });

  return (
    <group ref={groupRef}>
      <AnimatedCard
        position={[0, 0, 0]}
        rotation={[0.2, -0.3, 0.1]}
        color="#14b8a6"
        delay={0}
      />

      <AnimatedCard
        position={[2, 1, -1]}
        rotation={[0.1, 0.4, -0.1]}
        color="#f97316"
        delay={1}
      />

      <AnimatedSphere position={[-2, -1, -0.5]} color="#5eead4" scale={0.8} />
      <AnimatedSphere position={[2.5, -0.5, -1]} color="#fb923c" scale={0.6} />

      <AnimatedTorus position={[-1.5, 1.5, -1]} color="#2dd4bf" />

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f97316" />
    </group>
  );
}

function ParallaxScene({ mouseX = 0, mouseY = 0 }) {
  const groupRef = useRef();
  const reducedMotion = useReducedMotion();

  useFrame(() => {
    if (!groupRef.current || reducedMotion) return;

    groupRef.current.rotation.y = mouseX * 0.5;
    groupRef.current.rotation.x = mouseY * 0.3;
  });

  return (
    <group ref={groupRef}>
      <HeroScene />
    </group>
  );
}

function Fallback2DAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="absolute w-32 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-xl animate-float"
        style={{
          animation: "float 6s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-24 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg shadow-xl"
        style={{
          animation: "float 6s ease-in-out infinite 1s",
          transform: "translate(80px, -40px)",
        }}
      />
      <div
        className="absolute w-16 h-16 bg-primary-300 rounded-full shadow-lg opacity-60"
        style={{
          animation: "float 6s ease-in-out infinite 2s",
          transform: "translate(-60px, 30px)",
        }}
      />
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}

export default function Scene3D({
  enableParallax = false,
  mouseX = 0,
  mouseY = 0,
}) {
  const reducedMotion = useReducedMotion();
  const webGLSupported = isWebGLSupported();

  if (!webGLSupported || reducedMotion) {
    return <Fallback2DAnimation />;
  }

  return (
    <div className="w-full h-full" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        {enableParallax ? (
          <ParallaxScene mouseX={mouseX} mouseY={mouseY} />
        ) : (
          <HeroScene />
        )}
      </Canvas>
    </div>
  );
}
