import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import type { PlanetSection } from '../types'
import { computeOverviewFraming } from '../utils/fitOverviewCamera'

export type FlightPhase = 'idle' | 'align' | 'warp' | 'arrived'

interface CameraRigProps {
  planets: PlanetSection[]
  selectedPlanet: PlanetSection | null
  isOverview: boolean
  isMobile: boolean
  compactLayout: boolean
  flightPhase: FlightPhase
  interactionReady: boolean
  onAlignComplete?: () => void
  onWarpComplete?: () => void
}

const ALIGN_DURATION = 1.15
const WARP_DURATION = 2.35

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function getInspectDistance(planetSize: number, isMobile: boolean) {
  return planetSize * (isMobile ? 3.25 : 2.9)
}

export function CameraRig({
  planets,
  selectedPlanet,
  isOverview,
  isMobile,
  compactLayout,
  flightPhase,
  interactionReady,
  onAlignComplete,
  onWarpComplete,
}: CameraRigProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const { camera, size } = useThree()
  const aspect = size.width / Math.max(size.height, 1)

  const overviewFraming = useMemo(
    () =>
      computeOverviewFraming(planets, aspect, {
        compact: compactLayout,
        topUi: compactLayout ? 0.3 : aspect < 1.2 ? 0.24 : 0.18,
        bottomUi: compactLayout ? 0.07 : 0.05,
        sideUi: compactLayout ? 0.07 : aspect < 1.2 ? 0.06 : 0.04,
      }),
    [planets, aspect, compactLayout],
  )

  const targetPosition = useRef(new THREE.Vector3().copy(overviewFraming.position))
  const overviewTarget = useRef(new THREE.Vector3().copy(overviewFraming.target))
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
  const framingInitialized = useRef(false)

  const tempPlanet = useRef(new THREE.Vector3())
  const tempLook = useRef(new THREE.Vector3())
  const tempOffset = useRef(new THREE.Vector3())
  const tempRight = useRef(new THREE.Vector3())
  const tempUp = useRef(new THREE.Vector3())
  const tempDir = useRef(new THREE.Vector3())

  // Snap overview camera when canvas size / layout framing changes (and on first mount).
  useEffect(() => {
    targetPosition.current.copy(overviewFraming.position)
    overviewTarget.current.copy(overviewFraming.target)

    if (!framingInitialized.current || isOverview) {
      if (!framingInitialized.current) {
        camera.position.copy(overviewFraming.position)
        if (controlsRef.current) {
          controlsRef.current.target.copy(overviewFraming.target)
          controlsRef.current.update()
        }
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.fov = overviewFraming.fov
          camera.updateProjectionMatrix()
        }
        framingInitialized.current = true
      }
    }
  }, [camera, isOverview, overviewFraming])

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
      alignStartLook.current.copy(controlsRef.current?.target ?? overviewTarget.current)

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

      bankAngle.current = yawSign * -0.12
    }

    if (flightPhase === 'warp') {
      warpCompleteSent.current = false
      warpStartPos.current.copy(alignEndPos.current)
      warpStartLook.current.copy(tempPlanet.current)
      camera.position.copy(alignEndPos.current)
      if (controlsRef.current) controlsRef.current.target.copy(tempPlanet.current)
      camera.lookAt(tempPlanet.current)
      bankAngle.current = 0

      approachDirection.current
        .copy(overviewFraming.position)
        .sub(tempPlanet.current)
        .normalize()

      if (!isMobile) {
        approachDirection.current.add(new THREE.Vector3(0.35, 0.1, 0)).normalize()
      }

      targetPosition.current
        .copy(tempPlanet.current)
        .addScaledVector(approachDirection.current, inspectDistance.current)
    }
  }, [camera, flightPhase, isMobile, overviewFraming.position, selectedPlanet])

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

        camera.position.lerpVectors(warpStartPos.current, targetPosition.current, t)

        tempOffset.current.copy(camera.position).sub(tempPlanet.current)
        const currentDist = tempOffset.current.length()
        if (currentDist < inspectDistance.current && currentDist > 0.0001) {
          camera.position
            .copy(tempPlanet.current)
            .addScaledVector(tempOffset.current.normalize(), inspectDistance.current)
        }

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
          controls.target.lerp(tempPlanet.current, 0.16)
          controls.minDistance = selectedPlanet.size * (isMobile ? 1.8 : 1.6)
          controls.maxDistance = selectedPlanet.size * (isMobile ? 7.5 : 6.5)
          controls.update()
        }

        if (!interactionReady) {
          camera.position.lerp(targetPosition.current, 0.14)
        }
      }
    } else {
      targetPosition.current.copy(overviewFraming.position)
      overviewTarget.current.copy(overviewFraming.target)
      camera.position.lerp(targetPosition.current, 0.06)
      if (controls) {
        controls.target.lerp(overviewTarget.current, 0.06)
        controls.minDistance = overviewFraming.minDistance
        controls.maxDistance = overviewFraming.maxDistance
        controls.update()
      }
    }

    if (camera instanceof THREE.PerspectiveCamera) {
      const overviewFov = overviewFraming.fov
      const selectedFov = isMobile ? 48 : 38
      const alignFov = overviewFov - 3

      let desiredFov = overviewFov
      if (flightPhase === 'align') desiredFov = alignFov
      if (flightPhase === 'warp') {
        desiredFov = THREE.MathUtils.lerp(alignFov, selectedFov, easeInOutCubic(phaseProgress.current))
      }
      if (flightPhase === 'arrived') desiredFov = selectedFov

      camera.fov = THREE.MathUtils.lerp(camera.fov, desiredFov, 0.08)
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
      minDistance={overviewFraming.minDistance}
      maxDistance={overviewFraming.maxDistance}
      maxPolarAngle={Math.PI / 1.55}
      minPolarAngle={Math.PI / 5}
      autoRotate={isOverview}
      autoRotateSpeed={isMobile ? 0.18 : 0.28}
      rotateSpeed={inspecting ? 0.9 : 0.55}
      zoomSpeed={inspecting ? 1.1 : 0.65}
      dampingFactor={0.08}
      enableDamping
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  )
}
