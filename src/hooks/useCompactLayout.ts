import { useEffect, useState } from 'react'

/**
 * Compact planet arrangement for phones and portrait tablets.
 * Wide landscape tablets/desktops keep the full spread.
 */
const COMPACT_QUERY =
  '(max-width: 900px), ((max-width: 1200px) and (orientation: portrait))'

export function useCompactLayout() {
  const [compact, setCompact] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(COMPACT_QUERY).matches : false,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_QUERY)
    const update = () => setCompact(mediaQuery.matches)

    update()
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return compact
}
