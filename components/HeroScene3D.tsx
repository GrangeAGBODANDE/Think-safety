'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Cylinder, Sphere, Torus, RoundedBox } from '@react-three/drei'
import { Suspense, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

// Forme bouclier reutilisable
const makeShield = () => {
  const s = new THREE.Shape()
  s.moveTo(0, 1.4); s.lineTo(1.1, 0.65); s.lineTo(1.1, -0.35)
  s.quadraticCurveTo(1.0, -1.35, 0, -1.65)
  s.quadraticCurveTo(-1.0, -1.35, -1.1, -0.35)
  s.lineTo(-1.1, 0.65); s.closePath(); return s
}
const makeTriangle = () => {
  const s = new THREE.Shape()
  s.moveTo(0, 1.1); s.lineTo(-0.95, -0.55); s.lineTo(0.95, -0.55); s.closePath(); return s
}

// Casque de securite
function Helmet({ position }: { position: [number,number,number] }) {
  const ref = useRef<THREE.Group>(null)
  const [bounce, setBounce] = useState(false)
  const startT = useRef(0)
  useFrame((s) => {
    if (!ref.current) return
    ref.current.rotation.y = s.clock.elapsedTime * 0.3
    if (bounce) {
      const elapsed = Date.now()/1000 - startT.current
      const y = Math.abs(Math.sin(elapsed * 6)) * 0.8 * Math.max(0, 1 - elapsed * 0.5)
      ref.current.position.y = position[1] + y
      if (elapsed > 2) setBounce(false)
    } else {
      ref.current.position.y = position[1]
    }
  })
  return (
    <Float speed={1.8} floatIntensity={0.45} rotationIntensity={0.1}>
      <group ref={ref} position={position} onClick={() => { setBounce(true); startT.current = Date.now()/1000 }}>
        <pointLight color="#FFD700" intensity={0.8} distance={3.5} />
        <mesh>
          <sphereGeometry args={[0.78, 32, 16, 0, Math.PI*2, 0, Math.PI*0.54]} />
          <meshPhysicalMaterial color="#FFD700" metalness={0.05} roughness={0.2} clearcoat={0.6} clearcoatRoughness={0.1} />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[1.08, 1.02, 0.1, 32]} />
          <meshPhysicalMaterial color="#FFC200" metalness={0.05} roughness={0.25} clearcoat={0.4} />
        </mesh>
        <mesh position={[0, 0.3, 0.62]} rotation={[0.25, 0, 0]}>
          <boxGeometry args={[0.22, 0.08, 0.08]} />
          <meshStandardMaterial color="#CC0000" />
        </mesh>
        <mesh position={[0, 0.48, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#FF4444" metalness={0.5} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  )
}

// Triangle danger
function DangerSign({ position }: { position: [number,number,number] }) {
  const ref = useRef<THREE.Mesh>(null)
  const [active, setActive] = useState(false)
  const shape = useMemo(() => makeTriangle(), [])
  const extCfg = useMemo(() => ({ depth:0.18, bevelEnabled:true, bevelSize:0.04, bevelThickness:0.04 }), [])
  useFrame((s) => {
    if (!ref.current) return
    const t = s.clock.elapsedTime;
    (ref.current as any).rotation.y = Math.sin(t * 0.75) * 0.38;
    (ref.current.material as any).emissiveIntensity = active ? 0.25 + Math.sin(t * 5) * 0.15 : 0.04
  })
  return (
    <Float speed={2.1} floatIntensity={0.5} rotationIntensity={0.05} position={position}>
      <group onClick={() => setActive(!active)}>
        <pointLight color="#FF6B00" intensity={active ? 2 : 0.4} distance={4.5} />
        <mesh ref={ref}>
          <extrudeGeometry args={[shape, extCfg]} />
          <meshPhysicalMaterial color="#FF6B00" metalness={0.1} roughness={0.18} emissive="#FF3300" emissiveIntensity={0.04} clearcoat={0.35} />
        </mesh>
        <mesh position={[0, 0.17, 0.24]}>
          <cylinderGeometry args={[0.065, 0.07, 0.42, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[0, -0.28, 0.24]}>
          <sphereGeometry args={[0.085, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
    </Float>
  )
}

// Bouclier securite
function SafetyShield({ position }: { position: [number,number,number] }) {
  const ref = useRef<THREE.Group>(null)
  const [spin, setSpin] = useState(false)
  const shape = useMemo(() => makeShield(), [])
  const extCfg = useMemo(() => ({ depth:0.22, bevelEnabled:true, bevelSize:0.06, bevelThickness:0.06 }), [])
  const extCfgInner = useMemo(() => ({ depth:0.06, bevelEnabled:false }), [])
  useFrame((s) => {
    if (!ref.current) return
    if (spin) ref.current.rotation.y += 0.04
    else ref.current.rotation.y += (Math.sin(s.clock.elapsedTime * 0.55) * 0.22 - ref.current.rotation.y) * 0.05
  })
  return (
    <Float speed={1.5} floatIntensity={0.55} rotationIntensity={0.08} position={position}>
      <group ref={ref} onClick={() => setSpin(!spin)}>
        <pointLight color="#1a73e8" intensity={0.6} distance={4} />
        <mesh>
          <extrudeGeometry args={[shape, extCfg]} />
          <meshPhysicalMaterial color="#1a73e8" metalness={0.65} roughness={0.08} clearcoat={0.9} clearcoatRoughness={0.04} />
        </mesh>
        <mesh position={[0, 0, 0.23]} scale={0.68}>
          <extrudeGeometry args={[shape, extCfgInner]} />
          <meshPhysicalMaterial color="#60a5fa" metalness={0.3} roughness={0.2} emissive="#3b82f6" emissiveIntensity={0.3} />
        </mesh>
        {/* Checkmark */}
        <mesh position={[-0.16, -0.04, 0.36]} rotation={[0,0,0.48]}>
          <boxGeometry args={[0.1, 0.58, 0.09]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[0.21, 0.16, 0.36]} rotation={[0,0,-1.08]}>
          <boxGeometry args={[0.1, 0.82, 0.09]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
    </Float>
  )
}

// Croix medicale
function MedicalCross({ position }: { position: [number,number,number] }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((s) => {
    if (!ref.current) return
    ref.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.4) * 0.15
    ref.current.rotation.y = s.clock.elapsedTime * 0.25
  })
  return (
    <Float speed={2.5} floatIntensity={0.35} position={position} rotationIntensity={0.05}>
      <group ref={ref}>
        <pointLight color="#ff4444" intensity={0.3} distance={3} />
        <RoundedBox args={[0.28, 1.05, 0.2]} radius={0.06}>
          <meshPhysicalMaterial color="#ff4444" metalness={0.1} roughness={0.2} clearcoat={0.5} />
        </RoundedBox>
        <RoundedBox args={[1.05, 0.28, 0.2]} radius={0.06}>
          <meshPhysicalMaterial color="#ff4444" metalness={0.1} roughness={0.2} clearcoat={0.5} />
        </RoundedBox>
      </group>
    </Float>
  )
}

// Sol reflechissant
function Floor() {
  return (
    <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -2.8, 0]} receiveShadow>
      <planeGeometry args={[18, 18]} />
      <meshStandardMaterial color="#f0f4ff" metalness={0.0} roughness={0.8} transparent opacity={0.35} />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 9, 6]} intensity={1.4} castShadow />
      <directionalLight position={[-5, 5, -3]} intensity={0.45} color="#c8d8ff" />
      <pointLight position={[0, 6, 0]} intensity={0.3} color="#fff5e0" />
      <Helmet position={[-3.2, 0.4, 0]} />
      <DangerSign position={[-1.0, 0.1, 0.5]} />
      <SafetyShield position={[1.2, 0.2, 0]} />
      <MedicalCross position={[3.2, 0.5, 0]} />
      <Floor />
    </>
  )
}

export default function HeroScene3D() {
  return (
    <Canvas camera={{position:[0, 1.8, 9], fov:48}} gl={{antialias:true, alpha:true}} shadows dpr={[1,2]} style={{width:'100%',height:'100%'}}>
      <Suspense fallback={null}><Scene /></Suspense>
    </Canvas>
  )
}
