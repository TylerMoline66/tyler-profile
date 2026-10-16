import type { PlanetSection } from '../types'

type CompactPlanetLayout = Record<
  string,
  {
    position: [number, number, number]
    sizeScale: number
  }
>

// Compact ring for phones / portrait tablets — sits in the clear band under the hero.
const compactLayout: CompactPlanetLayout = {
  about: { position: [0, -0.4, -2.2], sizeScale: 0.72 },
  experience: { position: [-3.35, 2.35, -3], sizeScale: 0.64 },
  education: { position: [3.35, 2.35, -3], sizeScale: 0.62 },
  skills: { position: [0, 4.15, -3.8], sizeScale: 0.58 },
  projects: { position: [-3.0, -3.55, -2.6], sizeScale: 0.61 },
  contact: { position: [3.0, -3.55, -2.6], sizeScale: 0.56 },
}

export function applyCompactPlanetLayout(planet: PlanetSection): PlanetSection {
  const layout = compactLayout[planet.id]

  if (!layout) return planet

  return {
    ...planet,
    position: layout.position,
    size: planet.size * layout.sizeScale,
  }
}

/** @deprecated Use applyCompactPlanetLayout */
export const applyMobilePlanetLayout = applyCompactPlanetLayout
