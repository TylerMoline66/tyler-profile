import type { CSSProperties } from 'react'
import { Html } from '@react-three/drei'

interface PlanetLabelProps {
  name: string
  tagline: string
  color: string
  size: number
  hovered: boolean
  isMobile: boolean
}

export function PlanetLabel({ name, tagline, color, size, hovered, isMobile }: PlanetLabelProps) {
  return (
    <Html
      position={[0, size + (isMobile ? 1.15 : 2.1), 0]}
      center
      distanceFactor={isMobile ? 2.05 : 1.3}
      style={{ pointerEvents: 'none' }}
    >
      <div
        className={`planet-label ${isMobile ? 'planet-label--mobile' : 'planet-label--desktop'} ${hovered ? 'planet-label--hovered' : ''}`}
        style={{ '--planet-color': color } as CSSProperties}
      >
        <span className="planet-label__name">{name}</span>
        {!isMobile && <span className="planet-label__tagline">{tagline}</span>}
      </div>
    </Html>
  )
}
