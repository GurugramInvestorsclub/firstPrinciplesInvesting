"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

function WireframePolyhedron() {
    const meshRef = useRef<THREE.Mesh>(null)
    const groupRef = useRef<THREE.Group>(null)
    const mouseTarget = useRef({ x: 0, y: 0 })
    const mouseCurrent = useRef({ x: 0, y: 0 })
    const [reducedMotion, setReducedMotion] = useState(false)

    const geometry = useMemo(() => new THREE.IcosahedronGeometry(2.2, 1), [])
    const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry])

    useEffect(() => {
        const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
        setReducedMotion(mql.matches)

        function handleMouse(e: MouseEvent) {
            mouseTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 2
            mouseTarget.current.y = (e.clientY / window.innerHeight - 0.5) * 2
        }

        window.addEventListener("mousemove", handleMouse, { passive: true })
        return () => window.removeEventListener("mousemove", handleMouse)
    }, [])

    useFrame((_, delta) => {
        if (!meshRef.current || !groupRef.current) return

        // Extremely slow rotation
        if (!reducedMotion) {
            meshRef.current.rotation.y += delta * 0.08
            meshRef.current.rotation.x += delta * 0.03
        }

        // Mouse parallax — max 6 degrees (0.105 radians)
        const maxAngle = 0.105
        mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.02
        mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.02

        groupRef.current.rotation.y = mouseCurrent.current.x * maxAngle
        groupRef.current.rotation.x = -mouseCurrent.current.y * maxAngle
    })

    return (
        <group ref={groupRef}>
            <mesh ref={meshRef}>
                <lineSegments geometry={edgesGeometry}>
                    <lineBasicMaterial
                        color="#F5B800"
                        transparent
                        opacity={0.35}
                        linewidth={1}
                    />
                </lineSegments>
            </mesh>
        </group>
    )
}

function Scene() {
    const { viewport } = useThree()

    // Position polyhedron to the right on desktop, center on mobile
    const posX = viewport.width > 8 ? viewport.width * 0.18 : 0
    const posY = viewport.width > 8 ? 0.3 : 0.5

    return (
        <group position={[posX, posY, 0]}>
            <WireframePolyhedron />
        </group>
    )
}

export default function HeroCanvas() {
    return (
        <Canvas
            camera={{ position: [0, 0, 7], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
        >
            <Scene />
        </Canvas>
    )
}
