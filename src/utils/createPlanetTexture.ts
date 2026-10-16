import * as THREE from 'three'

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const value = Number.parseInt(normalized, 16)

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function mix(a: number, b: number, amount: number) {
  return a + (b - a) * amount
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
  return n - Math.floor(n)
}

function smoothNoise(x: number, y: number) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = x - x0
  const fy = y - y0
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)

  const a = hash(x0, y0)
  const b = hash(x0 + 1, y0)
  const c = hash(x0, y0 + 1)
  const d = hash(x0 + 1, y0 + 1)

  return mix(mix(a, b, ux), mix(c, d, ux), uy)
}

function fbm(x: number, y: number, octaves = 5) {
  let value = 0
  let amplitude = 0.5
  let frequency = 1
  let total = 0

  for (let i = 0; i < octaves; i += 1) {
    value += smoothNoise(x * frequency, y * frequency) * amplitude
    total += amplitude
    amplitude *= 0.5
    frequency *= 2
  }

  return value / total
}

function lighten(color: { r: number; g: number; b: number }, amount: number) {
  return {
    r: mix(color.r, 255, amount),
    g: mix(color.g, 255, amount),
    b: mix(color.b, 255, amount),
  }
}

function darken(color: { r: number; g: number; b: number }, amount: number) {
  return {
    r: mix(color.r, 0, amount),
    g: mix(color.g, 0, amount),
    b: mix(color.b, 0, amount),
  }
}

function blend(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  amount: number,
) {
  return {
    r: mix(a.r, b.r, amount),
    g: mix(a.g, b.g, amount),
    b: mix(a.b, b.b, amount),
  }
}

type SurfaceStyle = 'continents' | 'bands' | 'clouds' | 'craters' | 'ice' | 'storm'

function getSurfaceStyle(id: string): SurfaceStyle {
  switch (id) {
    case 'about':
      return 'continents'
    case 'experience':
      return 'bands'
    case 'education':
      return 'clouds'
    case 'skills':
      return 'ice'
    case 'projects':
      return 'storm'
    case 'contact':
      return 'craters'
    default:
      return 'continents'
  }
}

export function createPlanetTexture(id: string, baseColor: string, accentColor: string) {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return new THREE.CanvasTexture(canvas)
  }

  const base = hexToRgb(baseColor)
  const accent = hexToRgb(accentColor)
  const highlight = lighten(base, 0.35)
  const midtone = blend(base, accent, 0.35)
  const shadow = darken(accent, 0.25)
  const seed = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const style = getSurfaceStyle(id)
  const imageData = ctx.createImageData(size, size)

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size
      const v = y / size
      const latitude = Math.abs(v * 2 - 1)
      const warpX = u * 6 + seed * 0.13
      const warpY = v * 6 + seed * 0.07
      const warp = fbm(warpX, warpY, 3)

      let surface = 0.5
      let detail = 0

      if (style === 'continents') {
        const land = fbm(u * 4 + warp * 1.4, v * 3.2 + seed * 0.05, 6)
        const coast = fbm(u * 10 + seed * 0.2, v * 8, 4)
        surface = clamp((land - 0.48) * 2.4)
        detail = coast * 0.18
      } else if (style === 'bands') {
        const bands = Math.sin((v + warp * 0.08) * Math.PI * 10 + seed)
        const swirl = fbm(u * 3 + seed, v * 8, 4)
        surface = clamp(0.45 + bands * 0.28 + swirl * 0.18)
        detail = swirl * 0.12
      } else if (style === 'clouds') {
        const cloud = fbm(u * 5 + warp, v * 4 + seed * 0.1, 5)
        const haze = fbm(u * 2.2, v * 2.5 + seed, 3)
        surface = clamp(0.35 + cloud * 0.45)
        detail = haze * 0.2
      } else if (style === 'ice') {
        const ice = fbm(u * 3.5 + seed * 0.08, v * 3.5, 5)
        const cracks = fbm(u * 12, v * 12 + seed, 3)
        surface = clamp(0.55 + ice * 0.35)
        detail = cracks * 0.1
      } else if (style === 'storm') {
        const storm = fbm(u * 4.5 + warp * 2, v * 3.8 + seed * 0.15, 5)
        const streaks = Math.sin((u * 18 + storm * 4) * Math.PI) * 0.5 + 0.5
        surface = clamp(0.3 + storm * 0.5 + streaks * 0.15)
        detail = streaks * 0.12
      } else {
        const baseNoise = fbm(u * 3.5 + seed * 0.1, v * 3.5, 4)
        const craterField = fbm(u * 14 + seed, v * 14, 3)
        const crater = clamp(1 - Math.abs(craterField - 0.55) * 6)
        surface = clamp(0.4 + baseNoise * 0.35 + crater * 0.25)
        detail = crater * 0.15
      }

      const polarFade = clamp((latitude - 0.72) / 0.28)
      const softShade = 0.78 + surface * 0.22 - detail * 0.08
      const landMix = clamp(surface * 0.85 + detail)

      let color = blend(shadow, midtone, landMix)
      color = blend(color, highlight, clamp(surface * 0.45))
      color = blend(color, lighten(base, 0.55), polarFade * 0.35)

      // Gentle limb darkening for a more spherical read.
      const edge = Math.pow(1 - Math.abs(u * 2 - 1) * 0.15, 1.2)
      color = {
        r: color.r * softShade * edge,
        g: color.g * softShade * edge,
        b: color.b * softShade * edge,
      }

      const index = (y * size + x) * 4
      imageData.data[index] = Math.round(clamp(color.r, 0, 255))
      imageData.data[index + 1] = Math.round(clamp(color.g, 0, 255))
      imageData.data[index + 2] = Math.round(clamp(color.b, 0, 255))
      imageData.data[index + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // Soft atmospheric streaks / cloud wisps for polish.
  ctx.globalCompositeOperation = 'screen'
  for (let i = 0; i < 10; i += 1) {
    const y = (hash(seed + i, i * 3) * 0.7 + 0.15) * size
    const height = 8 + hash(seed + i * 7, i) * 28
    const alpha = 0.03 + hash(seed + i * 11, i * 5) * 0.05
    const gradient = ctx.createLinearGradient(0, y, size, y + height)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(0.35, `rgba(255, 255, 255, ${alpha})`)
    gradient.addColorStop(0.65, `rgba(255, 255, 255, ${alpha * 0.7})`)
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, y, size, height)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.anisotropy = 8
  texture.needsUpdate = true

  return texture
}
