import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const PERSONA_COLORS = ['#0052CC', '#6554C0', '#36B37E', '#FF991F', '#00B8D9']

const PERSONAS = [
  {
    id: 'sarah-mitchell',
    initials: 'SM',
    name: 'Sarah Mitchell',
    age: 42,
    location: 'Regional SA',
    tagline: 'Long-term RAA member managing family policies',
    description: `Sarah has been an RAA member for 15 years and holds car, home, and contents insurance. She manages renewals and policy changes for her entire household and expects everything to work seamlessly online. She's comfortable with technology but frustrated when digital processes don't match the level of service she expects from a trusted brand. Sarah is most likely to make a claim and most affected by renewal pricing.`,
    linkedJourneys: [
      { id: 'my-account', name: 'My Account' },
      { id: 'renewals', name: 'Renewals' },
      { id: 'claims', name: 'Claims' },
    ],
  },
  {
    id: 'james-cooper',
    initials: 'JC',
    name: 'James Cooper',
    age: 28,
    location: 'Adelaide Metro',
    tagline: 'First-time insurance buyer, highly price sensitive',
    description: `James recently bought his first car and is getting insurance for the first time. He's comparing multiple providers and is highly price sensitive. He expects a fast, transparent digital experience and will abandon the quote flow if it becomes too complex or asks for too much information upfront. James relies heavily on comparison sites and reads reviews before committing.`,
    linkedJourneys: [
      { id: 'quote-to-buy', name: 'Quote to Buy' },
    ],
  },
  {
    id: 'priya-sharma',
    initials: 'PS',
    name: 'Priya Sharma',
    age: 35,
    location: 'Adelaide CBD',
    tagline: 'Mid-career professional with multiple policies',
    description: `Priya holds car and home insurance with RAA and has made two claims in the past three years. She values transparency and clear communication above all else — particularly when it comes to understanding why her premium has changed and what she's actually covered for. She prefers digital self-service but will call when the stakes feel high. Priya is most frustrated by opaque premium increases.`,
    linkedJourneys: [
      { id: 'insurance', name: 'Insurance' },
      { id: 'renewals', name: 'Renewals' },
      { id: 'claims', name: 'Claims' },
    ],
  },
  {
    id: 'tom-lisa-chen',
    initials: 'TC',
    name: 'Tom & Lisa Chen',
    age: null,
    ageRange: '33 & 31',
    location: 'Adelaide Hills',
    tagline: 'Young family reassessing cover for bushfire risk',
    description: `Tom (33) and Lisa (31) recently moved to the Adelaide Hills and need to reassess their insurance coverage to account for bushfire risk. They approach insurance decisions together and want clear, jargon-free explanations of what each policy covers. They're time-poor and prefer to complete everything online rather than via phone. Both are digitally confident but new to home insurance.`,
    linkedJourneys: [
      { id: 'quote-to-buy', name: 'Quote to Buy' },
      { id: 'my-account', name: 'My Account' },
    ],
  },
]

function PersonaPanel({ persona, colorIndex, onClose }) {
  const color = PERSONA_COLORS[colorIndex % PERSONA_COLORS.length]
  const metaSub = persona.ageRange
    ? `${persona.ageRange} · ${persona.location}`
    : persona.age
    ? `${persona.age} · ${persona.location}`
    : persona.location

  return (
    <div className="detail-panel-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <div className="detail-panel-header">
          <div className="detail-panel-header-top">
            <div className="persona-panel-initials" style={{ background: color }}>
              {persona.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="detail-panel-title">{persona.name}</div>
              <div className="persona-panel-sub">{metaSub}</div>
            </div>
            <button className="drawer-close" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="detail-panel-body" style={{ paddingTop: 0 }}>
          <div className="drawer-section">
            <div className="drawer-section-label">About</div>
            <div className="drawer-section-content" style={{ lineHeight: 1.7 }}>
              {persona.description}
            </div>
          </div>

          <div className="drawer-section">
            <div className="drawer-section-label">Linked Journeys</div>
            <div className="persona-linked-cards">
              {persona.linkedJourneys.map(j => (
                <Link
                  key={j.id}
                  to={`/journey/${j.id}`}
                  className="detail-linked-card"
                  onClick={onClose}
                >
                  <div className="detail-linked-card-name">{j.name}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="drawer-section">
            <div className="drawer-section-label">Linked Insights</div>
            <div className="detail-empty-state">No insights linked yet</div>
            <button className="detail-add-btn" style={{ marginTop: 8 }}>+ Link insight</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Personas() {
  const [selected, setSelected] = useState(null)
  const [selectedIdx, setSelectedIdx] = useState(0)

  return (
    <div className="global-page">
      <div className="global-page-header">
        <div className="page-heading">Personas</div>
        <div className="page-subheading">Key customer personas across journeys</div>
      </div>

      <div className="persona-grid">
        {PERSONAS.map((p, i) => {
          const color = PERSONA_COLORS[i % PERSONA_COLORS.length]
          const meta = p.ageRange
            ? `${p.ageRange} · ${p.location}`
            : p.age
            ? `${p.age} · ${p.location}`
            : p.location
          return (
            <div
              key={p.id}
              className="persona-card"
              onClick={() => { setSelected(p); setSelectedIdx(i) }}
            >
              <div className="persona-initials" style={{ background: color }}>{p.initials}</div>
              <div className="persona-card-name">{p.name}</div>
              <div className="persona-card-meta">{meta}</div>
              <div className="persona-card-tagline">{p.tagline}</div>
              <div className="persona-linked-tags">
                {p.linkedJourneys.map(j => (
                  <span key={j.id} className="persona-journey-tag">{j.name}</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selected && (
        <PersonaPanel
          persona={selected}
          colorIndex={selectedIdx}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
