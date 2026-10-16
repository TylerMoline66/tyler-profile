/** Resolve a public asset path under Vite's configured base (needed for GitHub Pages). */
export function assetUrl(path: string) {
  const base = import.meta.env.BASE_URL
  const clean = path.replace(/^\//, '')
  return `${base}${clean}`
}
