export interface ProfileItem {
  title: string
  subtitle?: string
  description?: string
  tags?: string[]
}

export interface PlanetSection {
  id: string
  name: string
  tagline: string
  color: string
  emissive: string
  position: [number, number, number]
  size: number
  hasRings?: boolean
  rotationSpeed?: number
  content: {
    headline: string
    summary: string
    items: ProfileItem[]
  }
}

export type ViewMode = 'overview' | 'planet'
