import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Generate random points in a sphere shell
function randomInSphere(numPoints: number, radius: number): Float32Array {
    const positions = new Float32Array(numPoints * 3);
    for (let i = 0; i < numPoints; i++) {
        // Random spherical distribution
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        // Distribute within shell
        const r = Math.cbrt(Math.random()) * radius;

        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        positions[i * 3] = r * sinPhi * cosTheta;     // x
        positions[i * 3 + 1] = r * sinPhi * sinTheta; // y
        positions[i * 3 + 2] = r * cosPhi;            // z
    }
    return positions;
}

export function FloatingParticlesBackground({ color = '#8b5cf6', opacity = 0.6 }: { color?: string, opacity?: number }) {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ opacity }}>
            <Canvas camera={{ position: [0, 0, 1.5] }}>
                <CyberParticles color={color} />
            </Canvas>
        </div>
    );
}

function CyberParticles({ color }: { color: string }) {
    const ref = useRef<THREE.Points>(null);
    const sphere = useMemo(() => randomInSphere(1700, 1.2), []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 15;
            ref.current.rotation.y -= delta / 20;

            // Breathing effect
            const time = state.clock.getElapsedTime();
            const scale = 1 + Math.sin(time * 0.8) * 0.04;
            ref.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref as any} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color={color}
                    size={0.012}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
}
