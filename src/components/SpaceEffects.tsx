import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Trail } from '@react-three/drei'
import type { Group } from 'three'
import * as THREE from 'three'

interface ShootingStarProps {
  start: [number, number, number]
  end: [number, number, number]
  delay: number
  period: number
  color: string
}

function ShootingStar({ start, end, delay, period, color }: ShootingStarProps) {
  const starRef = useRef<Group>(null)
  const startPoint = useRef(new THREE.Vector3(...start))
  const endPoint = useRef(new THREE.Vector3(...end))

  useFrame(({ clock }) => {
    if (!starRef.current) return

    const flightDuration = 1.15
    const elapsed = (clock.elapsedTime + delay) % period
    const isFlying = elapsed < flightDuration
    starRef.current.visible = isFlying

    if (isFlying) {
      const progress = elapsed / flightDuration
      const eased = 1 - (1 - progress) ** 3
      starRef.current.position.lerpVectors(startPoint.current, endPoint.current, eased)
      starRef.current.scale.setScalar(0.7 + Math.sin(progress * Math.PI) * 0.9)
    }
  })

  return (
    <Trail
      width={0.5}
      length={5}
      color={color}
      attenuation={(width) => width * width}
    >
      <group ref={starRef}>
        <mesh>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <pointLight color={color} intensity={2} distance={5} />
      </group>
    </Trail>
  )
}

export function SpaceEffects() {
  const nebulaRef = useRef<Group>(null)

  useFrame((_, delta) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.z += delta * 0.003
    }
  })

  return (
    <>
      <Sparkles
        count={260}
        scale={[42, 26, 34]}
        size={2.2}
        speed={0.18}
        noise={1.5}
        color="#a9c7ff"
        opacity={0.65}
      />
      <Sparkles
        count={90}
        scale={[34, 22, 28]}
        size={4}
        speed={0.08}
        noise={0.8}
        color="#d9b8ff"
        opacity={0.32}
      />

      <group ref={nebulaRef} position={[0, 0, -38]}>
        <mesh position={[-15, 7, 0]}>
          <circleGeometry args={[15, 64]} />
          <meshBasicMaterial
            color="#182f72"
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[14, -7, -2]}>
          <circleGeometry args={[18, 64]} />
          <meshBasicMaterial
            color="#5b1c68"
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[4, 11, -4]}>
          <circleGeometry args={[10, 64]} />
          <meshBasicMaterial
            color="#164c59"
            transparent
            opacity={0.08}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      <ShootingStar
        start={[-18, 10, 5]}
        end={[7, -7, -6]}
        delay={0}
        period={18}
        color="#b8d8ff"
      />
      <ShootingStar
        start={[18, 8, -2]}
        end={[-5, -5, -10]}
        delay={9}
        period={24}
        color="#d8c1ff"
      />
      <ShootingStar
        start={[-8, 13, -12]}
        end={[14, -3, -18]}
        delay={16}
        period={30}
        color="#8ff5ff"
      />
    </>
  )
}
