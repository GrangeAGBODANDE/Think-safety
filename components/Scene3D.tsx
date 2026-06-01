'use client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Float, RoundedBox, Html, Sparkles, MeshDistortMaterial, Text } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'

const SECTORS = [
  { slug: 'construction-btp',         nom: 'Construction',  color: '#E67E22', count: 48 },
  { slug: 'sante-medical',            nom: 'Sante',         color: '#E74C3C', count: 36 },
  { slug: 'industrie-manufacturiere', nom: 'Industrie',     color: '#2980B9', count: 52 },
  { slug: 'transport-logistique',     nom: 'Transport',     color: '#27AE60', count: 29 },
  { slug: 'agriculture',              nom: 'Agriculture',   color: '#16A085', count: 31 },
  { slug: 'mines-carrieres',          nom: 'Mines',         color: '#8E44AD', count: 24 },
  { slug: 'petrole-gaz',              nom: 'Petrole',       color: '#D35400', count: 27 },
  { slug: 'bureaux-services',         nom: 'Bureaux',       color: '#2C3E50', count: 41 },
  { slug: 'education-formation',      nom: 'Education',     color: '#1ABC9C', count: 33 },
]

function SectorCard({ sector, baseAngle, radius, index }: any) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragPos, setDragPos] = useState<THREE.Vector3 | null>(null)
  const { gl, camera } = useThree()
  const scaleTarget = useRef(1)
  const currentScale = useRef(1)

  useFrame((state) => {
    if (!groupRef.current) return
    if (!dragging) {
      const t = state.clock.elapsedTime
      const angle = baseAngle + t * 0.06
      groupRef.current.position.x = Math.cos(angle) * radius
      groupRef.current.position.z = Math.sin(angle) * radius
      groupRef.current.position.y = Math.sin(t * 0.5 + index * 0.7) * 0.35
    } else if (dragPos) {
      groupRef.current.position.lerp(dragPos, 0.25)
    }
    groupRef.current.lookAt(camera.position)
    scaleTarget.current = hovered ? 1.18 : 1
    currentScale.current += (scaleTarget.current - currentScale.current) * 0.12
    groupRef.current.scale.setScalar(currentScale.current)
  })

  const onDown = (e: any) => {
    e.stopPropagation()
    setDragging(true)
    gl.domElement.style.cursor = 'grabbing'
    ;(e.target as any).setPointerCapture?.(e.pointerId)
  }
  const onUp = (e: any) => {
    setDragging(false)
    setDragPos(null)
    gl.domElement.style.cursor = hovered ? 'grab' : 'auto'
    ;(e.target as any).releasePointerCapture?.(e.pointerId)
  }
  const onMove = (e: any) => {
    if (!dragging) return
    setDragPos(new THREE.Vector3(e.point.x, e.point.y + 0.5, e.point.z))
  }

  return (
    <group ref={groupRef}>
      <RoundedBox args={[2.4, 1.4, 0.12]} radius={0.1}
        onPointerEnter={() => { setHovered(true); gl.domElement.style.cursor = 'grab' }}
        onPointerLeave={() => { setHovered(false); if (!dragging) gl.domElement.style.cursor = 'auto' }}
        onPointerDown={onDown} onPointerUp={onUp} onPointerMove={onMove}>
        <meshStandardMaterial
          color={hovered || dragging ? sector.color : '#0a1628'}
          metalness={0.7} roughness={0.1} transparent opacity={0.88}
          emissive={sector.color} emissiveIntensity={hovered || dragging ? 0.4 : 0.06}
        />
      </RoundedBox>
      <RoundedBox args={[2.44, 1.44, 0.06]} radius={0.12}>
        <meshStandardMaterial color={sector.color} transparent
          opacity={hovered || dragging ? 0.5 : 0.12}
          emissive={sector.color} emissiveIntensity={hovered || dragging ? 0.8 : 0.2}
        />
      </RoundedBox>
      <Html center transform distanceFactor={9}>
        <div style={{width:'190px',textAlign:'center',pointerEvents:'none',userSelect:'none',fontFamily:'sans-serif'}}>
          <div style={{color:hovered||dragging?'white':sector.color,fontSize:'12px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.08em',lineHeight:1.3,textShadow:hovered?'0 0 20px '+sector.color:'none'}}>
            {sector.nom}
          </div>
          <div style={{color:'rgba(255,255,255,0.4)',fontSize:'10px',marginTop:'4px',fontWeight:600}}>{sector.count} formations</div>
          {(hovered || dragging) && <div style={{color:'rgba(255,255,255,0.6)',fontSize:'9px',marginTop:'5px',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'99px',padding:'2px 8px',display:'inline-block'}}>Attraper</div>}
        </div>
      </Html>
      {(hovered || dragging) && <pointLight color={sector.color} intensity={2} distance={4} />}
    </group>
  )
}

function CoreSphere() {
  const outerRef = useRef<THREE.Mesh>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)
  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (outerRef.current) outerRef.current.rotation.y = t * 0.15
    if (ring1Ref.current) { ring1Ref.current.rotation.z = t * 0.4; ring1Ref.current.rotation.x = Math.sin(t*0.1)*0.3 }
    if (ring2Ref.current) { ring2Ref.current.rotation.x = t * -0.25; ring2Ref.current.rotation.y = t * 0.15 }
    if (ring3Ref.current) ring3Ref.current.rotation.y = t * 0.5
  })
  return (
    <group>
      <mesh ref={outerRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshDistortMaterial color="#d4500f" distort={0.25} speed={2.5}
          metalness={0.4} roughness={0.1} emissive="#d4500f" emissiveIntensity={0.3} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.95, 32, 32]} />
        <meshStandardMaterial color="#060d1a" metalness={0.95} roughness={0.02} />
      </mesh>
      <mesh ref={ring1Ref} rotation={[Math.PI/3, 0, 0]}>
        <torusGeometry args={[2.6, 0.025, 16, 120]} />
        <meshStandardMaterial color="#d4500f" emissive="#d4500f" emissiveIntensity={0.9} transparent opacity={0.6} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI/4, Math.PI/4, 0]}>
        <torusGeometry args={[3.2, 0.018, 16, 120]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.7} transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[Math.PI/6, 0, Math.PI/3]}>
        <torusGeometry args={[3.8, 0.012, 16, 120]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} transparent opacity={0.25} />
      </mesh>
      <pointLight color="#d4500f" intensity={4} distance={10} />
      <pointLight color="#3b82f6" intensity={1.5} distance={6} position={[3,2,0]} />
    </group>
  )
}

function FloatingStats() {
  const items = [
    { val:'500+', lbl:'Formations', x:-7, y:3.5,  z:-1, c:'#f97316' },
    { val:'18',   lbl:'Secteurs',   x:7,  y:-2.5, z:-2, c:'#60a5fa' },
    { val:'12k+', lbl:'Apprenants', x:-6, y:-3.5, z:2,  c:'#4ade80' },
    { val:'24/7', lbl:'Alertes',    x:6.5,y:4,    z:1,  c:'#c084fc' },
  ]
  return <>
    {items.map((s,i) => (
      <Float key={i} speed={1.5+i*0.2} floatIntensity={0.6} rotationIntensity={0.15} position={[s.x,s.y,s.z]}>
        <RoundedBox args={[1.9, 1.0, 0.1]} radius={0.09}>
          <meshStandardMaterial color="#0a1628" metalness={0.6} roughness={0.1}
            transparent opacity={0.75} emissive={s.c} emissiveIntensity={0.08} />
        </RoundedBox>
        <Html center transform distanceFactor={8}>
          <div style={{textAlign:'center',pointerEvents:'none',userSelect:'none',fontFamily:'sans-serif'}}>
            <div style={{color:s.c,fontSize:'20px',fontWeight:900,lineHeight:1,textShadow:'0 0 12px '+s.c}}>{s.val}</div>
            <div style={{color:'rgba(255,255,255,0.45)',fontSize:'9px',textTransform:'uppercase',letterSpacing:'0.12em',marginTop:'3px'}}>{s.lbl}</div>
          </div>
        </Html>
        <pointLight color={s.c} intensity={0.5} distance={2} />
      </Float>
    ))}
  </>
}

function Particles() {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(3000*3)
    for (let i=0; i<3000; i++) {
      arr[i*3]   = (Math.random()-0.5)*50
      arr[i*3+1] = (Math.random()-0.5)*50
      arr[i*3+2] = (Math.random()-0.5)*50
    }
    return arr
  }, [])
  useFrame((s) => {
    if (!ref.current) return
    ref.current.rotation.y = s.clock.elapsedTime * 0.008
    ref.current.rotation.x = s.clock.elapsedTime * 0.004
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={3000} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#d4500f" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

function CameraRig() {
  const mouse = useRef({x:0,y:0})
  useEffect(() => {
    const h = (e: MouseEvent) => {
      mouse.current.x = (e.clientX/window.innerWidth - 0.5) * 2
      mouse.current.y = -(e.clientY/window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])
  useFrame(({camera}) => {
    camera.position.x += (mouse.current.x * 2.5 - camera.position.x) * 0.025
    camera.position.y += (mouse.current.y * 1.5 - camera.position.y) * 0.025
    camera.lookAt(0, 0, 0)
  })
  return null
}

function NebulaBackground() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((s) => {
    if (meshRef.current) (meshRef.current.material as any).uniforms?.time && ((meshRef.current.material as any).uniforms.time.value = s.clock.elapsedTime)
  })
  return (
    <mesh ref={meshRef} scale={60}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#060d1a" side={THREE.BackSide} />
    </mesh>
  )
}

function MainScene() {
  return (
    <>
      <color attach="background" args={['#060d1a']} />
      <fog attach="fog" args={['#060d1a', 25, 60]} />
      <ambientLight intensity={0.25} />
      <Stars radius={90} depth={60} count={5000} factor={4} fade speed={0.8} />
      <Sparkles count={150} scale={18} size={1.8} speed={0.25} color="#d4500f" opacity={0.35} />
      <Sparkles count={80} scale={12} size={1.2} speed={0.15} color="#3b82f6" opacity={0.25} />
      <NebulaBackground />
      <CoreSphere />
      {SECTORS.map((s,i) => (
        <SectorCard key={s.slug} sector={s} baseAngle={(i/SECTORS.length)*Math.PI*2} radius={5.8} index={i} />
      ))}
      <FloatingStats />
      <Particles />
      <CameraRig />
    </>
  )
}

export default function Scene3D() {
  return (
    <div style={{position:'fixed',inset:0,zIndex:0}}>
      <Canvas camera={{position:[0,0.5,13],fov:58}} gl={{antialias:true,alpha:false}} dpr={[1,1.8]}>
        <Suspense fallback={null}><MainScene /></Suspense>
      </Canvas>
    </div>
  )
}
