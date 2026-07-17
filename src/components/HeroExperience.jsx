import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, PointMaterial, Points, Sphere } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

function ParticleField() {
  const points = useRef();
  const particles = useMemo(() => {
    const positions = new Float32Array(900 * 3);

    for (let index = 0; index < 900; index += 1) {
      const radius = 1.6 + Math.random() * 3.8;
      const angle = Math.random() * Math.PI * 2;
      const vertical = (Math.random() - 0.5) * 3.2;

      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = vertical;
      positions[index * 3 + 2] = Math.sin(angle) * radius;
    }

    return positions;
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.045;
    points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.08;
  });

  return (
    <Points ref={points} positions={particles} stride={3} frustumCulled>
      <PointMaterial transparent color="#67e8f9" size={0.018} sizeAttenuation depthWrite={false} opacity={0.62} />
    </Points>
  );
}

function HolographicSphere() {
  const sphere = useRef();
  const ring = useRef();

  useFrame((state) => {
    const pointerX = state.pointer.x * 0.35;
    const pointerY = state.pointer.y * 0.25;

    if (sphere.current) {
      sphere.current.rotation.y += 0.006;
      sphere.current.rotation.x = THREE.MathUtils.lerp(sphere.current.rotation.x, pointerY, 0.035);
      sphere.current.position.x = THREE.MathUtils.lerp(sphere.current.position.x, pointerX, 0.035);
    }

    if (ring.current) {
      ring.current.rotation.z += 0.008;
      ring.current.rotation.x = 1.22 + Math.sin(state.clock.elapsedTime * 0.7) * 0.1;
    }
  });

  return (
    <Float speed={1.35} rotationIntensity={0.35} floatIntensity={0.6}>
      <group ref={sphere}>
        <Sphere args={[1.25, 96, 96]}>
          <meshStandardMaterial color="#0f172a" emissive="#0891b2" emissiveIntensity={0.42} roughness={0.24} metalness={0.72} wireframe />
        </Sphere>
        <mesh ref={ring} rotation={[1.22, 0.22, 0]}>
          <torusGeometry args={[1.62, 0.012, 16, 160]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.78} />
        </mesh>
        <mesh rotation={[0.32, -0.78, 0.4]}>
          <torusGeometry args={[1.92, 0.008, 16, 160]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.48} />
        </mesh>
      </group>
    </Float>
  );
}

export default function HeroExperience() {
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-[1.5rem] bg-slate-950/45">
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,transparent_34%,rgba(10,15,30,0.48)_74%)]" />
      <Canvas camera={{ position: [0, 0, 5.2], fov: 45 }} dpr={[1, 1.7]} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[3, 4, 4]} intensity={18} color="#22d3ee" />
          <pointLight position={[-4, -2, 3]} intensity={12} color="#8b5cf6" />
          <ParticleField />
          <HolographicSphere />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.45} />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute bottom-5 left-5 z-20 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-cyan-100">
        Live 3D marketplace orbit
      </div>
    </div>
  );
}
