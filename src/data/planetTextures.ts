export interface PlanetTextureConfig {
  surface: string
  clouds?: string
  cloudOpacity?: number
  cloudSpeed?: number
  tint?: string
  roughness?: number
  metalness?: number
}

// Real planetary maps from Solar System Scope (CC BY 4.0)
// https://www.solarsystemscope.com/textures/
export const planetTextureConfigs: Record<string, PlanetTextureConfig> = {
  about: {
    surface: '/textures/earth.jpg',
    clouds: '/textures/clouds.jpg',
    cloudOpacity: 0.42,
    cloudSpeed: 0.08,
    tint: '#8ec5ff',
    roughness: 0.68,
    metalness: 0.05,
  },
  experience: {
    surface: '/textures/jupiter.jpg',
    clouds: '/textures/clouds.jpg',
    cloudOpacity: 0.28,
    cloudSpeed: 0.12,
    tint: '#ffb07a',
    roughness: 0.74,
    metalness: 0.04,
  },
  education: {
    surface: '/textures/neptune.jpg',
    clouds: '/textures/clouds.jpg',
    cloudOpacity: 0.35,
    cloudSpeed: 0.1,
    tint: '#c4a1ff',
    roughness: 0.7,
    metalness: 0.06,
  },
  skills: {
    surface: '/textures/earth.jpg',
    clouds: '/textures/clouds.jpg',
    cloudOpacity: 0.38,
    cloudSpeed: 0.09,
    tint: '#7dffb5',
    roughness: 0.66,
    metalness: 0.05,
  },
  projects: {
    surface: '/textures/mars.jpg',
    clouds: '/textures/clouds.jpg',
    cloudOpacity: 0.3,
    cloudSpeed: 0.11,
    tint: '#ff8fb4',
    roughness: 0.78,
    metalness: 0.03,
  },
  contact: {
    surface: '/textures/venus.jpg',
    clouds: '/textures/clouds.jpg',
    cloudOpacity: 0.4,
    cloudSpeed: 0.07,
    tint: '#ffe08a',
    roughness: 0.62,
    metalness: 0.08,
  },
}

export const TEXTURE_ATTRIBUTION =
  'Planet textures by Solar System Scope (CC BY 4.0)'
