import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const TYPE_BADGE = {
  pain:        { background: '#FF5630', color: 'white' },
  need:        { background: '#0052CC', color: 'white' },
  gain:        { background: '#36B37E', color: 'white' },
  observation: { background: '#6554C0', color: 'white' },
  opportunity: { background: '#6554C0', color: 'white' },
}

const OWNERS = ['Sarah Chen', 'Marcus Webb', 'Priya Patel', 'Jordan Liu']
const STATUSES = ['Open', 'Assumption', 'In Discussion', 'Validated', 'Solved']
const PERSONAS = ['None', 'Sarah Mitchell', 'James Cooper', 'Priya Sharma', 'Tom & Lisa Chen']
const PANEL_TABS = ['Details', 'Quotes', 'Journeys', 'Opportunities', 'Solutions']

function ImpactSlider({ value, onChange }) {
  const steps = [-2, -1, 0, 1, 2]
  return (
    <div className="impact-slider">
      {steps.map(v => (
        <button
          key={v}
          className={`impact-dot${value === v ? ' impact-dot-active' : ''}`}
          onClick={() => onChange(v)}
          title={v > 0 ? `+${v}` : String(v)}
        >
          <span className="impact-dot-label">{v > 0 ? `+${v}` : String(v)}</span>
        </button>
      ))}
    </div>
  )
}

export default function DetailPanel({ item, onClose, journeys }) {
  const [stack, setStack] = useState([item])
  const [activeTab, setActiveTab] = useState('Details')
  const [owner, setOwner] = useState(OWNERS[0])
  const [impact, setImpact] = useState(0)
  const [status, setStatus] = useState('Open')
  const [persona, setPersona] = useState('None')

  const current = stack[stack.length - 1]
  const canGoBack = stack.length > 1

  function popItem() {
    setStack(prev => prev.slice(0, -1))
    setActiveTab('Details')
  }

  const badge = TYPE_BADGE[current.type] ?? { background: '#5E6C84', color: 'white' }
  const typeLabel = current.type
    ? current.type.charAt(0).toUpperCase() + current.type.slice(1)
    : 'Insight'

  const linkedJourney = journeys && current.journeyId ? journeys[current.journeyId] : null
  const displayText = current.text || current.title || current.name || ''

  return (
    <div className="detail-panel-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>

        <div className="detail-panel-header">
          <div className="detail-panel-header-top">
            {canGoBack && (
              <button className="detail-panel-back" onClick={popItem}>← Back</button>
            )}
            <span className="insight-tag" style={{ ...badge, flexShrink: 0, marginRight: 8 }}>
              {typeLabel}
            </span>
            <div className="detail-panel-title">{displayText}</div>
            <button className="drawer-close" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="detail-taxonomy">
          <div className="taxonomy-row">
            <span className="taxonomy-label">Owner</span>
            <select className="taxonomy-select" value={owner} onChange={e => setOwner(e.target.value)}>
              {OWNERS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="taxonomy-row">
            <span className="taxonomy-label">Experience Impact</span>
            <ImpactSlider value={impact} onChange={setImpact} />
          </div>
          <div className="taxonomy-row">
            <span className="taxonomy-label">Status</span>
            <select className="taxonomy-select" value={status} onChange={e => setStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="taxonomy-row">
            <span className="taxonomy-label">Persona</span>
            <select className="taxonomy-select" value={persona} onChange={e => setPersona(e.target.value)}>
              {PERSONAS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          {current.journeyId && (
            <div className="taxonomy-row">
              <span className="taxonomy-label">Journey</span>
              <Link
                to={`/journey/${current.journeyId}`}
                className="taxonomy-link"
                onClick={onClose}
              >
                {current.journeyName || current.journeyId}
              </Link>
            </div>
          )}
        </div>

        <div className="detail-panel-tabs">
          {PANEL_TABS.map(tab => (
            <button
              key={tab}
              className={`detail-panel-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="detail-panel-body">
          {activeTab === 'Details' && (
            <div className="detail-tab-content">
              <div className="drawer-section">
                <div className="drawer-section-label">Description</div>
                <div className="drawer-section-content" style={{ lineHeight: 1.7 }}>{displayText || '—'}</div>
              </div>
              {current.source && (
                <div className="drawer-section">
                  <div className="drawer-section-label">Source</div>
                  <div className="drawer-section-content">{current.source}</div>
                </div>
              )}
              {current.evidenceCount != null && (
                <div className="drawer-section">
                  <div className="drawer-section-label">Evidence</div>
                  <div className="drawer-section-content">{current.evidenceCount} sources</div>
                </div>
              )}
              {current.severity && (
                <div className="drawer-section">
                  <div className="drawer-section-label">Severity</div>
                  <div className="drawer-section-content">
                    <span className={`insight-tag ${current.severity}`}>{current.severity}</span>
                  </div>
                </div>
              )}
              {current.stageName && (
                <div className="drawer-section">
                  <div className="drawer-section-label">Stage</div>
                  <div className="drawer-section-content">{current.stageName}</div>
                </div>
              )}
              <div className="drawer-section">
                <div className="drawer-section-label">Attachments</div>
                <div className="drawer-section-content detail-placeholder">No attachments</div>
              </div>
              <div className="drawer-section">
                <div className="drawer-section-label">Links</div>
                <div className="drawer-section-content detail-placeholder">No links</div>
              </div>
              <div className="drawer-section">
                <div className="drawer-section-label">Comments</div>
                <div className="drawer-section-content detail-placeholder">No comments yet</div>
              </div>
            </div>
          )}

          {activeTab === 'Quotes' && (
            <div className="detail-tab-content">
              <div className="detail-empty-state">No quotes yet</div>
              <button className="detail-add-btn">+ Add quote</button>
            </div>
          )}

          {activeTab === 'Journeys' && (
            <div className="detail-tab-content">
              {current.journeyId ? (
                <Link
                  to={`/journey/${current.journeyId}`}
                  className="detail-linked-card"
                  onClick={onClose}
                >
                  <div className="detail-linked-card-name">{current.journeyName || current.journeyId}</div>
                  {linkedJourney && (
                    <div className="detail-linked-card-meta">
                      {linkedJourney.stages?.length ?? 0} stages · {linkedJourney.insights?.length ?? 0} insights
                    </div>
                  )}
                </Link>
              ) : (
                <div className="detail-empty-state">No journeys linked</div>
              )}
            </div>
          )}

          {activeTab === 'Opportunities' && (
            <div className="detail-tab-content">
              <div className="detail-empty-state">No linked opportunities</div>
              <button className="detail-add-btn">+ Link opportunity</button>
            </div>
          )}

          {activeTab === 'Solutions' && (
            <div className="detail-tab-content">
              <div className="detail-empty-state">No linked solutions</div>
              <button className="detail-add-btn">+ Link solution</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
