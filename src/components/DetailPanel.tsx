import type { CSSProperties } from 'react'
import type { PlanetSection } from '../types'

interface DetailPanelProps {
  planet: PlanetSection
  onBack: () => void
}

export function DetailPanel({ planet, onBack }: DetailPanelProps) {
  const { content } = planet

  return (
    <div
      className="detail-panel"
      style={{ '--planet-color': planet.color } as CSSProperties}
    >
      <button className="detail-panel__back" onClick={onBack} type="button">
        ← Back to galaxy
      </button>

      <div className="detail-panel__header">
        <div
          className="detail-panel__orb"
          style={{ background: `radial-gradient(circle at 30% 30%, ${planet.color}, ${planet.emissive})` }}
        />
        <div>
          <h2 className="detail-panel__title">{content.headline}</h2>
          <p className="detail-panel__summary">{content.summary}</p>
        </div>
      </div>

      <div className="detail-panel__items">
        {content.items.map((item) => (
          <div key={item.title} className="detail-panel__item">
            <h3 className="detail-panel__item-title">{item.title}</h3>
            {item.subtitle && (
              <p className="detail-panel__item-subtitle">{item.subtitle}</p>
            )}
            {item.description && (
              <p className="detail-panel__item-desc">{item.description}</p>
            )}
            {item.tags && (
              <div className="detail-panel__tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="detail-panel__tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
