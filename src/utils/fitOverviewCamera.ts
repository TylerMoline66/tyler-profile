import * as THREE from 'three'
import type { PlanetSection } from '../types'

export interface OverviewFraming {
  position: THREE.Vector3
  target: THREE.Vector3
  fov: number
  minDistance: number
  maxDistance: number
}

interface FitOptions {
  /** Vertical field of view in degrees */
  fov?: number
  /** Fraction of viewport height reserved for the hero title (top) */
  topUi?: number
  /** Fraction of viewport height reserved at the bottom */
  bottomUi?: number
  /** Fraction of viewport width reserved on each side */
  sideUi?: number
  /** Extra world-space clearance above each planet for labels */
  labelClearance?: number
  compact?: boolean
}

/**
 * Frame all planets inside the clear viewport region below the hero title.
 * Uses the canvas aspect ratio so mobile, tablet, and desktop all get a full view.
 */
export function computeOverviewFraming(
  planets: PlanetSection[],
  aspect: number,
  options: FitOptions = {},
): OverviewFraming {
  const compact = Boolean(options.compact)
  const fov = options.fov ?? (compact ? 58 : 42)
  const topUi = options.topUi ?? (compact ? 0.28 : 0.2)
  const bottomUi = options.bottomUi ?? (compact ? 0.08 : 0.06)
  const sideUi = options.sideUi ?? (compact ? 0.08 : 0.05)
  const labelClearance = options.labelClearance ?? (compact ? 1.35 : 2.4)

  const box = new THREE.Box3()
  const point = new THREE.Vector3()

  for (const planet of planets) {
    const [x, y, z] = planet.position
    const r = planet.size
    box.expandByPoint(point.set(x - r, y - r, z - r))
    box.expandByPoint(point.set(x + r, y + r + labelClearance, z + r))
  }

  if (box.isEmpty()) {
    return {
      position: new THREE.Vector3(0, compact ? 0.5 : 4, compact ? 19.5 : 20),
      target: new THREE.Vector3(0, 0, compact ? -3 : 0),
      fov,
      minDistance: compact ? 11 : 9,
      maxDistance: compact ? 30 : 32,
    }
  }

  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const halfW = Math.max(size.x, 0.01) * 0.5 * 1.1
  const halfH = Math.max(size.y, 0.01) * 0.5 * 1.1

  const vFov = THREE.MathUtils.degToRad(fov)
  const tanHalf = Math.tan(vFov / 2)
  const usableH = Math.max(0.38, 1 - topUi - bottomUi)
  const usableW = Math.max(0.55, 1 - sideUi * 2)
  const safeAspect = Math.max(aspect, 0.45)

  const distForHeight = halfH / (tanHalf * usableH)
  const distForWidth = halfW / (tanHalf * safeAspect * usableW)
  const distance = Math.max(distForHeight, distForWidth, compact ? 13 : 16)

  // Safe-zone midpoint in NDC (top = +1). Hero reserves the top, so this sits below center.
  const safeTop = 1 - 2 * topUi
  const safeBottom = -1 + 2 * bottomUi
  const midSafeNdcY = (safeTop + safeBottom) / 2

  // Look slightly above the cluster so planets project into the clear band under the title.
  const target = center.clone()
  target.y = center.y - midSafeNdcY * tanHalf * distance

  const position = target.clone().add(new THREE.Vector3(0, distance * 0.06, distance))

  return {
    position,
    target,
    fov,
    minDistance: distance * 0.7,
    maxDistance: distance * 1.9,
  }
}
