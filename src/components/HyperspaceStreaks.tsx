import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface HyperspaceStreaksProps {
  active: boolean
}

const STAR_COUNT = 65

type StarState = {
  x: number
  y: number
  z: number
  speed: number
  size: number
}

function createCircleStarTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return new THREE.CanvasTexture(canvas)
  }

  const center = size / 2
  const glow = ctx.createRadialGradient(center, center, 0, center, center, center)
  glow.addColorStop(0, 'rgba(255, 255, 255, 1)')
  glow.addColorStop(0.18, 'rgba(255, 255, 255, 0.95)')
  glow.addColorStop(0.42, 'rgba(210, 230, 255, 0.35)')
  glow.addColorStop(0.7, 'rgba(170, 205, 255, 0.08)')
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)')

  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function createStar(): StarState {
  const sideBias = Math.random() < 0.7 ? 1 : 0.35
  const angle = Math.random() * Math.PI * 2
  const radius = (1.8 + Math.random() * 9) * sideBias

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius * 0.7,
    z: -6 - Math.random() * 50,
    speed: 28 + Math.random() * 48,
    size: 0.035 + Math.random() * 0.05,
  }
}

export function HyperspaceStreaks({ active }: HyperspaceStreaksProps) {
  const groupRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const { camera } = useThree()
  const intensity = useRef(0)
  const seeded = useRef(false)

  const { stars, pointPositions, starTexture } = useMemo(() => {
    const stars = Array.from({ length: STAR_COUNT }, () => createStar())
    return {
      stars,
      pointPositions: new Float32Array(STAR_COUNT * 3),
      starTexture: createCircleStarTexture(),
    }
  }, [])

  function writeStar(i: number, star: StarState) {
    const idx = i * 3
    pointPositions[idx] = star.x
    pointPositions[idx + 1] = star.y
    pointPositions[idx + 2] = star.z
  }

  function seedStars() {
    for (let i = 0; i < STAR_COUNT; i += 1) {
      stars[i] = createStar()
      writeStar(i, stars[i])
    }
    seeded.current = true
  }

  useFrame((_, delta) => {
    intensity.current = THREE.MathUtils.lerp(intensity.current, active ? 1 : 0, active ? 0.1 : 0.16)

    if (groupRef.current) {
      groupRef.current.visible = intensity.current > 0.02
      groupRef.current.quaternion.copy(camera.quaternion)
      groupRef.current.position.copy(camera.position)
    }

    if (intensity.current < 0.02) return

    if (active && !seeded.current) {
      seedStars()
    }

    if (!active && intensity.current < 0.05) {
      seeded.current = false
    }

    for (let i = 0; i < STAR_COUNT; i += 1) {
      const star = stars[i]
      // Ease star speed down a touch as intensity settles near arrival.
      star.z += star.speed * delta * (0.5 + intensity.current * 1.35)

      const pass = THREE.MathUtils.clamp((star.z + 20) / 30, 0, 1)
      star.x *= 1 + pass * 0.01
      star.y *= 1 + pass * 0.01

      if (star.z > 8) {
        stars[i] = createStar()
      }

      writeStar(i, stars[i])
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true
      const material = pointsRef.current.material as THREE.PointsMaterial
      material.opacity = intensity.current * 0.95
      material.size = 0.12 + intensity.current * 0.1
    }
  })

  return (
    <group ref={groupRef} visible={false}>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[pointPositions, 3]}
            count={STAR_COUNT}
          />
        </bufferGeometry>
        <pointsMaterial
          map={starTexture}
          color="#eef5ff"
          size={0.16}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          alphaTest={0.01}
        />
      </points>
    </group>
  )
}
