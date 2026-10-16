import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import type { PlanetSection } from '../types'

export type FlightPhase = 'idle' | 'align' | 'warp' | 'arrived'

interface CameraRigProps {
  selectedPlanet: PlanetSection | null
  isOverview: boolean
  isMobile: boolean
  flightPhase: FlightPhase
  interactionReady: boolean
  onAlignComplete?: () => void
  onWarpComplete?: () => void
}

const OVERVIEW_POSITION = new THREE.Vector3(0, 4, 20)
const MOBILE_OVERVIEW_POSITION = new THREE.Vector3(0, 0.5, 19.5)
const OVERVIEW_TARGET = new THREE.Vector3(0, 0, 0)
const MOBILE_OVERVIEW_TARGET = new THREE.Vector3(0, 0, -3)
const ALIGN_DURATION = 1.15
const WARP_DURATION = 2.35

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function getInspectDistance(planetSize: number, isMobile: boolean) {
  // Final fly-in framing — a bit farther out so it doesn't feel pressed against the surface.
  return planetSize * (isMobile ? 3.25 : 2.9)
}

export function CameraRig({
  selectedPlanet,
  isOverview,
  isMobile,
  flightPhase,
  interactionReady,
  onAlignComplete,
  onWarpComplete,
}: CameraRigProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()

  const targetPosition = useRef(new THREE.Vector3().copy(OVERVIEW_POSITION))
  const alignStartPos = useRef(new THREE.Vector3())
  const alignStartLook = useRef(new THREE.Vector3())
  const alignEndPos = useRef(new THREE.Vector3())
  const warpStartPos = useRef(new THREE.Vector3())
  const warpStartLook = useRef(new THREE.Vector3())
  const approachDirection = useRef(new THREE.Vector3())
  const phaseProgress = useRef(0)
  const lastPhase = useRef<FlightPhase>('idle')
  const bankAngle = useRef(0)
  const alignCompleteSent = useRef(false)
  const warpCompleteSent = useRef(false)
  const inspectDistance = useRef(5)

  const tempPlanet = useRef(new THREE.Vector3())
  const tempLook = useRef(new THREE.Vector3())
  const tempOffset = useRef(new THREE.Vector3())
  const tempRight = useRef(new THREE.Vector3())
  const tempUp = useRef(new THREE.Vector3())
  const tempDir = useRef(new THREE.Vector3())

  useEffect(() => {
    if (flightPhase === lastPhase.current) return
    lastPhase.current = flightPhase
    phaseProgress.current = 0

    if (!selectedPlanet) return

    const [x, y, z] = selectedPlanet.position
    tempPlanet.current.set(x, y, z)
    inspectDistance.current = getInspectDistance(selectedPlanet.size, isMobile)

    if (flightPhase === 'align') {
      alignCompleteSent.current = false
      warpCompleteSent.current = false
      alignStartPos.current.copy(camera.position)
      alignStartLook.current.copy(controlsRef.current?.target ?? OVERVIEW_TARGET)

      tempDir.current.copy(tempPlanet.current).sub(camera.position).normalize()
      tempRight.current.crossVectors(tempDir.current, new THREE.Vector3(0, 1, 0)).normalize()
      if (tempRight.current.lengthSq() < 0.001) {
        tempRight.current.set(1, 0, 0)
      }
      tempUp.current.crossVectors(tempRight.current, tempDir.current).normalize()

      const yawSign = Math.sign(tempRight.current.x) || 1
      const pitchSign = Math.sign(tempPlanet.current.y - camera.position.y) || 1

      alignEndPos.current
        .copy(camera.position)
        .addScaledVector(tempRight.current, yawSign * 0.4)
        .addScaledVector(tempUp.current, pitchSign * 0.25)

      // Gentle bank that naturally returns to 0 at the end of the turn.
      bankAngle.current = yawSign * -0.12
    }

    if (flightPhase === 'warp') {
      warpCompleteSent.current = false
      // Capture the exact post-align pose so the first warp frame matches the last align frame.
      warpStartPos.current.copy(alignEndPos.current)
      warpStartLook.current.copy(tempPlanet.current)
      camera.position.copy(alignEndPos.current)
      if (controlsRef.current) controlsRef.current.target.copy(tempPlanet.current)
      camera.lookAt(tempPlanet.current)
      bankAngle.current = 0

      approachDirection.current
        .copy(isMobile ? MOBILE_OVERVIEW_POSITION : OVERVIEW_POSITION)
        .sub(tempPlanet.current)
        .normalize()

      if (!isMobile) {
        approachDirection.current.add(new THREE.Vector3(0.35, 0.1, 0)).normalize()
      }

      targetPosition.current
        .copy(tempPlanet.current)
        .addScaledVector(approachDirection.current, inspectDistance.current)
    }
  }, [camera, flightPhase, isMobile, selectedPlanet])

  useFrame((_, delta) => {
    const controls = controlsRef.current
    const inspecting = Boolean(selectedPlanet && !isOverview)

    if (inspecting && selectedPlanet) {
      const [x, y, z] = selectedPlanet.position
      tempPlanet.current.set(x, y, z)

      if (flightPhase === 'align') {
        phaseProgress.current = Math.min(1, phaseProgress.current + delta / ALIGN_DURATION)
        const t = easeOutCubic(phaseProgress.current)

        camera.position.lerpVectors(alignStartPos.current, alignEndPos.current, t)
        tempLook.current.copy(alignStartLook.current).lerp(tempPlanet.current, t)
        if (controls) controls.target.copy(tempLook.current)
        camera.lookAt(tempLook.current)
        // Bank peaks mid-turn and returns to exactly 0 at the end — no leftover roll into warp.
        camera.rotateZ(bankAngle.current * Math.sin(t * Math.PI))

        if (phaseProgress.current >= 1 && !alignCompleteSent.current) {
          alignCompleteSent.current = true
          camera.position.copy(alignEndPos.current)
          if (controls) controls.target.copy(tempPlanet.current)
          camera.lookAt(tempPlanet.current)
          queueMicrotask(() => onAlignComplete?.())
        }
      } else if (flightPhase === 'warp') {
        phaseProgress.current = Math.min(1, phaseProgress.current + delta / WARP_DURATION)
        const t = easeInOutCubic(phaseProgress.current)

        // Fly forward toward the planet...
        camera.position.lerpVectors(warpStartPos.current, targetPosition.current, t)

        // ...but never allow the path to cut inside the inspect distance.
        tempOffset.current.copy(camera.position).sub(tempPlanet.current)
        const currentDist = tempOffset.current.length()
        if (currentDist < inspectDistance.current && currentDist > 0.0001) {
          camera.position
            .copy(tempPlanet.current)
            .addScaledVector(tempOffset.current.normalize(), inspectDistance.current)
        }

        // Keep looking at the planet the whole way — already locked from align.
        tempLook.current.copy(tempPlanet.current)
        if (controls) controls.target.copy(tempLook.current)
        camera.lookAt(tempLook.current)

        if (phaseProgress.current >= 1 && !warpCompleteSent.current) {
          warpCompleteSent.current = true
          camera.position.copy(targetPosition.current)
          if (controls) controls.target.copy(tempPlanet.current)
          camera.lookAt(tempPlanet.current)
          queueMicrotask(() => onWarpComplete?.())
        }
      } else if (flightPhase === 'arrived' || interactionReady) {
        if (controls) {
          // Keep orbit locked to the planet, but don't fight the user's zoom.
          controls.target.lerp(tempPlanet.current, 0.16)
          controls.minDistance = selectedPlanet.size * (isMobile ? 1.8 : 1.6)
          controls.maxDistance = selectedPlanet.size * (isMobile ? 7.5 : 6.5)
          controls.update()
        }

        // Only soft-settle before interaction is unlocked.
        if (!interactionReady) {
          camera.position.lerp(targetPosition.current, 0.14)
        }
      }
    } else {
      targetPosition.current.copy(isMobile ? MOBILE_OVERVIEW_POSITION : OVERVIEW_POSITION)
      camera.position.lerp(targetPosition.current, 0.04)
      if (controls) {
        controls.target.lerp(isMobile ? MOBILE_OVERVIEW_TARGET : OVERVIEW_TARGET, 0.04)
        controls.minDistance = isMobile ? 11 : 9
        controls.maxDistance = isMobile ? 30 : 32
        controls.update()
      }
    }

    if (camera instanceof THREE.PerspectiveCamera) {
      const overviewFov = isMobile ? 62 : 42
      const selectedFov = isMobile ? 48 : 38
      const alignFov = overviewFov - 3

      let desiredFov = overviewFov
      if (flightPhase === 'align') desiredFov = alignFov
      if (flightPhase === 'warp') {
        desiredFov = THREE.MathUtils.lerp(alignFov, selectedFov, easeInOutCubic(phaseProgress.current))
      }
      if (flightPhase === 'arrived') desiredFov = selectedFov

      camera.fov = THREE.MathUtils.lerp(camera.fov, desiredFov, 0.06)
      camera.updateProjectionMatrix()
    }
  })

  const inspecting = Boolean(selectedPlanet && !isOverview)
  const controlsEnabled = isOverview || interactionReady

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={controlsEnabled}
      enablePan={isOverview}
      enableZoom={controlsEnabled}
      enableRotate={controlsEnabled}
      minDistance={isMobile ? 11 : 9}
      maxDistance={isMobile ? 30 : 32}
      maxPolarAngle={Math.PI / 1.55}
      minPolarAngle={Math.PI / 5}
      autoRotate={isOverview}
      autoRotateSpeed={isMobile ? 0.18 : 0.3}
      rotateSpeed={inspecting ? 0.9 : 0.6}
      zoomSpeed={inspecting ? 1.1 : 0.7}
      dampingFactor={0.08}
      enableDamping
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  )
}
