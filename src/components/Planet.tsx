import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, useTexture } from '@react-three/drei'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import * as THREE from 'three'
import type { PlanetSection } from '../types'
import { planetTextureConfigs } from '../data/planetTextures'
import { assetUrl } from '../utils/assetUrl'
import { PlanetLabel } from './PlanetLabel'

interface PlanetProps {
  planet: PlanetSection
  isSelected: boolean
  isOverview: boolean
  isMobile: boolean
  onSelect: (id: string) => void
}

export function Planet({ planet, isSelected, isOverview, isMobile, onSelect }: PlanetProps) {
  const groupRef = useRef<Group>(null)
  const surfaceRef = useRef<Mesh>(null)
  const cloudsRef = useRef<Mesh>(null)
  const cloudMaterialRef = useRef<MeshStandardMaterial>(null)
  const haloRef = useRef<Mesh>(null)
  const orbitRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const config = planetTextureConfigs[planet.id] ?? planetTextureConfigs.about
  const [surfaceMap, cloudMap] = useTexture([
    config.surface,
    config.clouds ?? assetUrl('textures/clouds.jpg'),
  ])

  useEffect(() => {
    surfaceMap.colorSpace = THREE.SRGBColorSpace
    surfaceMap.anisotropy = 8
    surfaceMap.wrapS = THREE.RepeatWrapping
    surfaceMap.wrapT = THREE.ClampToEdgeWrapping
    surfaceMap.needsUpdate = true

    cloudMap.colorSpace = THREE.SRGBColorSpace
    cloudMap.anisotropy = 8
    cloudMap.wrapS = THREE.RepeatWrapping
    cloudMap.wrapT = THREE.ClampToEdgeWrapping
    cloudMap.needsUpdate = true
  }, [cloudMap, surfaceMap])

  useFrame((state, delta) => {
    const active = hovered || isSelected
    const targetScale = active ? (isSelected ? 1.14 : 1.1) : 1
    const surfaceSpeed = (planet.rotationSpeed ?? 0.1) * (active ? 1.8 : 1)
    const cloudSpeed = (config.cloudSpeed ?? 0.08) * (active ? 2.4 : 1)

    if (surfaceRef.current) {
      surfaceRef.current.rotation.y += delta * surfaceSpeed
      surfaceRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.02
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * cloudSpeed
      cloudsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.28 + 1.2) * 0.015
      cloudsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.18) * 0.01
    }

    if (cloudMaterialRef.current) {
      const breath = 0.5 + Math.sin(state.clock.elapsedTime * 0.7) * 0.5
      const baseOpacity = config.cloudOpacity ?? 0.35
      cloudMaterialRef.current.opacity = baseOpacity * (0.82 + breath * 0.28) * (active ? 1.15 : 1)
    }

    if (groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08)
    }

    if (haloRef.current) {
      haloRef.current.rotation.z += delta * 0.25
      haloRef.current.scale.setScalar(1.12 + Math.sin(state.clock.elapsedTime * 1.8) * 0.02)
    }

    if (orbitRef.current) {
      orbitRef.current.rotation.z += delta * (active ? 1.5 : 0.35)
      orbitRef.current.rotation.x += delta * 0.14
    }
  })

  const active = hovered || isSelected

  return (
    <Float
      speed={isSelected ? 0.4 : active ? 1.6 : 1.1}
      rotationIntensity={isSelected ? 0 : 0.08}
      floatIntensity={isSelected ? 0 : active ? 0.35 : 0.3}
      position={planet.position}
    >
      <group ref={groupRef}>
        <mesh
          ref={surfaceRef}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(planet.id)
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            setHovered(false)
            document.body.style.cursor = 'auto'
          }}
        >
          <sphereGeometry args={[planet.size, 96, 96]} />
          <meshStandardMaterial
            color={config.tint ?? planet.color}
            map={surfaceMap}
            bumpMap={surfaceMap}
            bumpScale={planet.size * 0.012}
            emissive={planet.emissive}
            emissiveIntensity={active ? 0.18 : 0.06}
            roughness={config.roughness ?? 0.7}
            metalness={config.metalness ?? 0.05}
          />
        </mesh>

        {/* Animated cloud layer */}
        <mesh ref={cloudsRef} scale={1.018}>
          <sphereGeometry args={[planet.size, 64, 64]} />
          <meshStandardMaterial
            ref={cloudMaterialRef}
            map={cloudMap}
            color="#ffffff"
            transparent
            opacity={config.cloudOpacity ?? 0.35}
            depthWrite={false}
            roughness={1}
            metalness={0}
            emissive="#ffffff"
            emissiveIntensity={0.04}
          />
        </mesh>

        {/* Soft atmosphere rim */}
        <mesh scale={1.05}>
          <sphereGeometry args={[planet.size, 48, 48]} />
          <meshBasicMaterial
            color={planet.color}
            transparent
            opacity={active ? 0.13 : 0.06}
            depthWrite={false}
          />
        </mesh>

        <mesh ref={haloRef} scale={1.12}>
          <sphereGeometry args={[planet.size, 48, 48]} />
          <meshBasicMaterial
            color={planet.color}
            transparent
            opacity={active ? 0.08 : 0.025}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh ref={orbitRef} rotation={[Math.PI / 2, 0.35, 0]}>
          <torusGeometry args={[planet.size * 1.8, 0.01, 8, 96]} />
          <meshBasicMaterial
            color={planet.color}
            transparent
            opacity={active ? 0.5 : 0.14}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {planet.hasRings && (
          <mesh rotation={[Math.PI / 2.8, 0, 0]}>
            <ringGeometry args={[planet.size * 1.35, planet.size * 2.05, 96]} />
            <meshStandardMaterial
              color="#d4b87a"
              transparent
              opacity={active ? 0.68 : 0.48}
              side={2}
              roughness={0.9}
              metalness={0.05}
            />
          </mesh>
        )}

        {isOverview && (
          <PlanetLabel
            name={planet.name}
            tagline={planet.tagline}
            color={planet.color}
            size={planet.size}
            hovered={hovered}
            isMobile={isMobile}
          />
        )}
      </group>
    </Float>
  )
}
