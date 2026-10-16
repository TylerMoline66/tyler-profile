import type { PlanetSection } from '../types'

type MobilePlanetLayout = Record<
  string,
  {
    position: [number, number, number]
    sizeScale: number
  }
>

// Tight mobile-only ring layout — all planets visible in portrait without zooming out.
const mobileLayout: MobilePlanetLayout = {
  about: { position: [0, -0.8, -2.5], sizeScale: 0.75 },
  experience: { position: [-3.6, 4.2, -3.2], sizeScale: 0.66 },
  education: { position: [3.6, 4.2, -3.2], sizeScale: 0.64 },
  skills: { position: [0, 6.5, -4.2], sizeScale: 0.6 },
  projects: { position: [-3.1, -5.4, -2.8], sizeScale: 0.63 },
  contact: { position: [3.1, -5.4, -2.8], sizeScale: 0.58 },
}

export function applyMobilePlanetLayout(planet: PlanetSection): PlanetSection {
  const layout = mobileLayout[planet.id]

  if (!layout) return planet

  return {
    ...planet,
    position: layout.position,
    size: planet.size * layout.sizeScale,
  }
}
