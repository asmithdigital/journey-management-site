import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PERSONAS, PERSONA_COLORS } from '../data/personas'

function PersonaPanel({ persona, colorIndex, onClose }) {
  const color = PERSONA_COLORS[colorIndex % PERSONA_COLORS.length]
  const ageDisplay = persona.ageRange ? persona.ageRange : persona.age ? `${persona.age}` : ''
  const metaSub = [ageDisplay, persona.location].filter(Boolean).join(' · ')

  return (
    <div className="detail-panel-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <div className="detail-panel-header">
          <div className="detail-panel-header-top">
            <img
              src={persona.photo}
              alt={persona.name}
              className="persona-panel-avatar"
              style={{ borderColor: color }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="detail-panel-title">{persona.name}</div>
              <div className="persona-panel-sub">{metaSub}</div>
              {persona.occupation && (
                <div className="persona-panel-occupation">{persona.occupation}</div>
              )}
            </div>
            <button className="drawer-close" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="detail-panel-body" style={{ paddingTop: 0 }}>
          {persona.quote && (
            <div className="persona-quote-block">"{persona.quote}"</div>
          )}

          <div className="drawer-section">
            <div className="drawer-section-label">Profile</div>
            <div className="persona-attr-grid">
              {persona.memberSince && (
                <div className="persona-attr-item">
                  <div className="persona-attr-label">Member since</div>
                  <div className="persona-attr-value">{persona.memberSince}</div>
                </div>
              )}
              {persona.familyStatus && (
                <div className="persona-attr-item">
                  <div className="persona-attr-label">Family status</div>
                  <div className="persona-attr-value">{persona.familyStatus}</div>
                </div>
              )}
              {persona.digitalConfidence && (
                <div className="persona-attr-item">
                  <div className="persona-attr-label">Digital confidence</div>
                  <div className="persona-attr-value">{persona.digitalConfidence}</div>
                </div>
              )}
              {persona.preferredChannel && (
                <div className="persona-attr-item">
                  <div className="persona-attr-label">Preferred channel</div>
                  <div className="persona-attr-value">{persona.preferredChannel}</div>
                </div>
              )}
              {persona.products && persona.products.length > 0 && (
                <div className="persona-attr-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="persona-attr-label">RAA Products</div>
                  <div className="persona-attr-value">{persona.products.join(', ')}</div>
                </div>
              )}
            </div>
          </div>

          {persona.goals && persona.goals.length > 0 && (
            <div className="drawer-section">
              <div className="drawer-section-label">Goals</div>
              <div className="persona-section-items">
                {persona.goals.map((g, i) => (
                  <div key={i} className="persona-section-item persona-section-item-green">{g}</div>
                ))}
              </div>
            </div>
          )}

          {persona.frustrations && persona.frustrations.length > 0 && (
            <div className="drawer-section">
              <div className="drawer-section-label">Frustrations</div>
              <div className="persona-section-items">
                {persona.frustrations.map((f, i) => (
                  <div key={i} className="persona-section-item persona-section-item-red">{f}</div>
                ))}
              </div>
            </div>
          )}

          {persona.behaviours && persona.behaviours.length > 0 && (
            <div className="drawer-section">
              <div className="drawer-section-label">Behaviours</div>
              <div className="persona-section-items">
                {persona.behaviours.map((b, i) => (
                  <div key={i} className="persona-section-item persona-section-item-blue">{b}</div>
                ))}
              </div>
            </div>
          )}

          {persona.scenarios && persona.scenarios.length > 0 && (
            <div className="drawer-section">
              <div className="drawer-section-label">Scenarios</div>
              <div className="persona-section-items">
                {persona.scenarios.map((s, i) => (
                  <div key={i} className="persona-scenario-item">
                    <div className="persona-scenario-title">{s.title}</div>
                    <div className="persona-scenario-desc">{s.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="drawer-section">
            <div className="drawer-section-label">Linked Journeys</div>
            <div className="persona-linked-tags">
              {persona.linkedJourneys.map(j => (
                <Link
                  key={j.id}
                  to={`/journey/${j.id}`}
                  className="persona-journey-tag"
                  style={{ textDecoration: 'none' }}
                  onClick={onClose}
                >
                  {j.name}
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
        <div className="page-subheading">Key customer personas across RAA journeys</div>
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
              <div className="persona-card-avatar-wrap">
                <img
                  src={p.photo}
                  alt={p.name}
                  className="persona-card-avatar"
                  style={{ borderColor: color }}
                />
              </div>
              <div className="persona-card-name">{p.name}</div>
              <div className="persona-card-meta">{meta}</div>
              {p.occupation && (
                <div className="persona-card-occupation">{p.occupation}</div>
              )}
              {p.quote && (
                <div className="persona-card-quote">
                  "{p.quote.length > 90 ? p.quote.slice(0, 89) + '…' : p.quote}"
                </div>
              )}
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
