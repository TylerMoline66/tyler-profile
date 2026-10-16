import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import type { PlanetSection } from '../types'
import { useIsMobile } from '../hooks/useIsMobile'
import { useCompactLayout } from '../hooks/useCompactLayout'
import { applyCompactPlanetLayout } from '../data/mobilePlanetLayout'
import { Planet } from './Planet'
import { CameraRig, type FlightPhase } from './CameraRig'
import { SpaceEffects } from './SpaceEffects'
import { HyperspaceStreaks } from './HyperspaceStreaks'

interface SceneProps {
  planets: PlanetSection[]
  selectedPlanetId: string | null
  isOverview: boolean
  flightPhase: FlightPhase
  interactionReady: boolean
  onSelectPlanet: (id: string) => void
  onAlignComplete?: () => void
  onWarpComplete?: () => void
}

function SceneContent({
  planets,
  selectedPlanetId,
  isOverview,
  flightPhase,
  interactionReady,
  onSelectPlanet,
  onAlignComplete,
  onWarpComplete,
}: SceneProps) {
  const isMobile = useIsMobile()
  const compactLayout = useCompactLayout()
  const displayPlanets = useMemo(
    () =>
      planets.map((planet) =>
        compactLayout ? applyCompactPlanetLayout(planet) : planet,
      ),
    [compactLayout, planets],
  )
  const selectedPlanet =
    displayPlanets.find((p) => p.id === selectedPlanetId) ?? null
  const isWarping = flightPhase === 'warp'

  return (
    <>
      <ambientLight intensity={isWarping ? 0.22 : 0.38} />
      <directionalLight position={[10, 10, 5]} intensity={isWarping ? 0.9 : 1.35} />
      <pointLight position={[-10, -5, -10]} intensity={0.5} color="#6b8cff" />
      <pointLight position={[10, 5, 10]} intensity={0.4} color="#ff8c6b" />

      <Stars
        radius={140}
        depth={75}
        count={11000}
        factor={isWarping ? 4.6 : 3.8}
        saturation={0.35}
        fade
        speed={isWarping ? 8 : 0.65}
      />
      <SpaceEffects />
      <HyperspaceStreaks active={isWarping} />

      {displayPlanets.map((planet) => (
        <Planet
          key={planet.id}
          planet={planet}
          isSelected={selectedPlanetId === planet.id}
          isOverview={isOverview}
          isMobile={isMobile}
          onSelect={onSelectPlanet}
        />
      ))}

      <CameraRig
        planets={displayPlanets}
        selectedPlanet={selectedPlanet}
        isOverview={isOverview}
        isMobile={isMobile}
        compactLayout={compactLayout}
        flightPhase={flightPhase}
        interactionReady={interactionReady}
        onAlignComplete={onAlignComplete}
        onWarpComplete={onWarpComplete}
      />
    </>
  )
}

export function Scene(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 4, 20], fov: 42, near: 0.1, far: 220 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#050817' }}
    >
      <color attach="background" args={['#050817']} />
      <fog attach="fog" args={['#050817', 55, 160]} />
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  )
}
