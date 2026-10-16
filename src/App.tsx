import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { planets, profileMeta } from './data/profile'
import { TEXTURE_ATTRIBUTION } from './data/planetTextures'
import { Scene } from './components/Scene'
import { DetailPanel } from './components/DetailPanel'
import { useIsMobile } from './hooks/useIsMobile'
import type { FlightPhase } from './components/CameraRig'

function App() {
  const isMobile = useIsMobile()
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [flightPhase, setFlightPhase] = useState<FlightPhase>('idle')
  const isOverview = selectedPlanetId === null
  const selectedPlanet = planets.find((p) => p.id === selectedPlanetId)

  useEffect(() => {
    if (!selectedPlanetId) {
      setShowDetails(false)
      setFlightPhase('idle')
      return
    }

    setShowDetails(false)
    setFlightPhase('align')
  }, [selectedPlanetId])

  const handleAlignComplete = useCallback(() => {
    setFlightPhase('warp')
  }, [])

  const handleWarpComplete = useCallback(() => {
    setFlightPhase('arrived')
    // Brief settle before opening the panel / enabling orbit, avoids a handoff hitch.
    window.setTimeout(() => setShowDetails(true), 160)
  }, [])

  function handleBackToGalaxy() {
    setShowDetails(false)
    setFlightPhase('idle')
    setSelectedPlanetId(null)
  }

  const captionLabel = flightPhase === 'align' ? 'Locking course' : 'Hyperspace'
  const showFlightUi = Boolean(selectedPlanet && !showDetails)

  return (
    <div className={`app ${isMobile ? 'app--mobile' : 'app--desktop'}`}>
      <Scene
        planets={planets}
        selectedPlanetId={selectedPlanetId}
        isOverview={isOverview}
        flightPhase={flightPhase}
        interactionReady={showDetails}
        onSelectPlanet={setSelectedPlanetId}
        onAlignComplete={handleAlignComplete}
        onWarpComplete={handleWarpComplete}
      />

      {isOverview && (
        <header className="hero">
          <p className="hero__eyebrow">Portfolio</p>
          <h1 className="hero__name">{profileMeta.name}</h1>
          <p className="hero__title">{profileMeta.title}</p>
          <p className="hero__hint">{profileMeta.tagline}</p>
        </header>
      )}

      {showFlightUi && (
        <>
          {flightPhase === 'warp' && (
            <div className="hyperspace-overlay" aria-hidden="true" />
          )}
          <div
            className={`warp-caption ${flightPhase === 'align' ? 'warp-caption--align' : 'warp-caption--warp'}`}
            style={{ '--planet-color': selectedPlanet!.color } as CSSProperties}
          >
            <span>{captionLabel}</span>
            <strong>{selectedPlanet!.name}</strong>
          </div>
        </>
      )}

      {selectedPlanet && showDetails && (
        <>
          <DetailPanel
            planet={selectedPlanet}
            onBack={handleBackToGalaxy}
          />
          <p className="inspect-hint">Drag to orbit · Pinch / scroll to zoom</p>
        </>
      )}

      {isOverview && (
        <p className="texture-credit">{TEXTURE_ATTRIBUTION}</p>
      )}
    </div>
  )
}

export default App
