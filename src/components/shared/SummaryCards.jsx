import React, { useState } from 'react'

const DEFAULT_CARDS = [
  { id: 'nps', label: 'Net Promoter Score (demo)' },
  { id: 'csat', label: 'Customer Satisfaction' },
]

export default function SummaryCards() {
  const [dismissed, setDismissed] = useState({})

  const visible = DEFAULT_CARDS.filter(c => !dismissed[c.id])
  if (visible.length === 0) return null

  return (
    <div className="summary-cards-bar">
      {visible.map(card => (
        <div key={card.id} className="summary-card">
          <span className="summary-card-label">{card.label}</span>
          <span className="summary-card-value">--</span>
          <button
            className="summary-card-close"
            onClick={() => setDismissed(d => ({ ...d, [card.id]: true }))}
            title="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
