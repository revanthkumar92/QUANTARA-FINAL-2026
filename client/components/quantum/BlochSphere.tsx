import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Sphere, Line } from "@react-three/drei";
import { Atom } from "lucide-react";
import * as THREE from "three";

interface BlochCoordinates {
  x: number;
  y: number;
  z: number;
}

interface BlochSphereProps {
  coordinates: BlochCoordinates;
  size?: number;
  showLabels?: boolean;
  animated?: boolean;
}

// Internal 3D Bloch Sphere Component
function BlochSphere3D({
  coordinates,
  showLabels = true,
  animated = false,
}: BlochSphereProps) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const vectorRef = useRef<THREE.Group>(null);

  const { x, y, z } = coordinates;

  // Ensure coordinates are within valid range
  const clampedX = Math.max(-1, Math.min(1, isNaN(x) ? 0 : x));
  const clampedY = Math.max(-1, Math.min(1, isNaN(y) ? 0 : y));
  const clampedZ = Math.max(-1, Math.min(1, isNaN(z) ? 1 : z));

  useFrame((state) => {
    if (animated && sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 3]} intensity={0.8} />

      {/* Sphere wireframe */}
      <Sphere ref={sphereRef} args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#06b6d4"
          wireframe
          opacity={0.15}
          transparent
        />
      </Sphere>

      {/* Coordinate axes */}
      <Line
        points={[
          [-1.3, 0, 0],
          [1.3, 0, 0],
        ]}
        color="#ef4444"
        lineWidth={3}
      />
      <Line
        points={[
          [0, -1.3, 0],
          [0, 1.3, 0],
        ]}
        color="#10b981"
        lineWidth={3}
      />
      <Line
        points={[
          [0, 0, -1.3],
          [0, 0, 1.3],
        ]}
        color="#3b82f6"
        lineWidth={3}
      />

      {showLabels && (
        <>
          {/* Axis labels */}
          <Text
            position={[1.4, 0, 0]}
            fontSize={0.12}
            color="#ef4444"
            fontWeight="bold"
          >
            X
          </Text>
          <Text
            position={[0, 1.4, 0]}
            fontSize={0.12}
            color="#10b981"
            fontWeight="bold"
          >
            Y
          </Text>
          <Text
            position={[0, 0, 1.4]}
            fontSize={0.12}
            color="#3b82f6"
            fontWeight="bold"
          >
            Z
          </Text>

          {/* State labels */}
          <Text
            position={[0, 0, 1.2]}
            fontSize={0.1}
            color="#06b6d4"
            fontWeight="bold"
          >
            |0⟩
          </Text>
          <Text
            position={[0, 0, -1.2]}
            fontSize={0.1}
            color="#06b6d4"
            fontWeight="bold"
          >
            |1⟩
          </Text>
          <Text
            position={[1.2, 0, 0]}
            fontSize={0.1}
            color="#06b6d4"
            fontWeight="bold"
          >
            |+⟩
          </Text>
          <Text
            position={[-1.2, 0, 0]}
            fontSize={0.1}
            color="#06b6d4"
            fontWeight="bold"
          >
            |-⟩
          </Text>
        </>
      )}

      {/* State vector */}
      <group ref={vectorRef}>
        <Line
          points={[
            [0, 0, 0],
            [clampedX, clampedY, clampedZ],
          ]}
          color="#fbbf24"
          lineWidth={4}
        />

        {/* State point */}
        <Sphere args={[0.04]} position={[clampedX, clampedY, clampedZ]}>
          <meshBasicMaterial color="#fbbf24" />
        </Sphere>

        {/* Glow effect around state point */}
        <Sphere args={[0.08]} position={[clampedX, clampedY, clampedZ]}>
          <meshBasicMaterial color="#fbbf24" opacity={0.3} transparent />
        </Sphere>
      </group>
    </>
  );
}

// Loading fallback component
function BlochSphereLoading() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-cyan-400 bg-gradient-to-br from-gray-900/50 to-blue-900/30 rounded-lg">
      <Atom className="h-12 w-12 animate-spin mb-4" />
      <p className="text-sm">Loading Bloch Sphere...</p>
    </div>
  );
}

// Error fallback component
function BlochSphereError() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-red-400 bg-gradient-to-br from-gray-900/50 to-red-900/30 rounded-lg">
      <Atom className="h-8 w-8 mb-2" />
      <p className="text-sm">Failed to load 3D visualization</p>
      <p className="text-xs text-gray-400 mt-1">Try refreshing the page</p>
    </div>
  );
}

// Main Bloch Sphere Component
export function BlochSphereVisualization({
  coordinates,
  size, // Optional fixed size
  showLabels = true,
  animated = false,
}: BlochSphereProps & { size?: number }) {
  return (
    <div
      className={`w-full rounded-lg overflow-hidden bg-gradient-to-br from-slate-900/50 to-blue-900/30 ${size ? "" : "h-[300px] sm:h-[350px] md:h-[400px]"
        }`}
      style={size ? { height: `${size}px` } : {}}
    >
      <Suspense fallback={<BlochSphereLoading />}>
        <Canvas
          camera={{
            position: [2.5, 2.5, 2.5],
            fov: 50,
            near: 0.1,
            far: 1000,
          }}
          gl={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
          }}
          onError={() => console.error("Three.js Canvas error")}
        >
          <BlochSphere3D
            coordinates={coordinates}
            showLabels={showLabels}
            animated={animated}
          />
          <OrbitControls
            enablePan={false}
            minDistance={1.5}
            maxDistance={5}
            enableDamping
            dampingFactor={0.05}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

// Compact Bloch Sphere for smaller spaces
export function BlochSphereCompact({
  coordinates,
}: {
  coordinates: BlochCoordinates;
}) {
  return (
    <BlochSphereVisualization
      coordinates={coordinates}
      size={200}
      showLabels={false}
      animated={true}
    />
  );
}

// Mini Bloch Sphere for tabs and cards
export function BlochSphereMini({
  coordinates,
}: {
  coordinates: BlochCoordinates;
}) {
  return (
    <BlochSphereVisualization
      coordinates={coordinates}
      size={150}
      showLabels={false}
      animated={false}
    />
  );
}
