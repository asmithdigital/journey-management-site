import React, { useState } from 'react'
import OpportunityCard from '../cards/OpportunityCard.jsx'
import InsightCard from '../cards/InsightCard.jsx'
import MetricChip from '../cards/MetricChip.jsx'
import EmotionCurve from './EmotionCurve.jsx'

/* ─── Data derivation helpers ──────────────────────────────── */

function simpleHash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h)
}

const STATUS_CYCLE = ['open', 'validated', 'in-progress', 'open', 'solved', 'open']

function deriveOpportunity(text, globalIdx, stageId) {
  const h = simpleHash(text)
  return {
    id: `${stageId}-opp-${globalIdx}`,
    title: text,
    status: STATUS_CYCLE[globalIdx % STATUS_CYCLE.length],
    businessValue: 20 + (simpleHash(text + 'bv') % 70),
    customerValue: 20 + (simpleHash(text + 'cv') % 70),
    stepsLinked: 1 + (globalIdx % 3),
    score: 30 + (h % 60),
    stageId,
  }
}

function derivePainPoint(text, index, stageId) {
  return {
    id: `${stageId}-pain-${index}`,
    text,
    type: 'pain',
    severity: 'high',
  }
}

const TOUCHPOINT_CATEGORIES = ['Branch', 'Online', 'Digital', 'App', 'Email', 'Phone', 'Post']

const STAGE_METRICS = [
  [{ name: 'Web Visits' }, { name: 'Bounce Rate' }],
  [{ name: 'Form Drop-off' }, { name: 'Completion Rate' }],
  [{ name: 'Quote Views' }, { name: 'Comparison Rate' }],
  [{ name: 'Conversion Rate' }, { name: 'CSAT' }],
]

/* ─── Swim lane label cell ─────────────────────────────────── */

function LaneLabel({ label, collapsed, onToggle, className = '' }) {
  return (
    <div className={`swim-lane-label-cell ${className}`}>
      <span className="swim-lane-label-text">{label}</span>
      <button
        className="swim-lane-collapse-btn"
        onClick={onToggle}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? '▸' : '▾'}
      </button>
    </div>
  )
}

/* ─── Detail Drawer ────────────────────────────────────────── */

function DetailDrawer({ item, type, onClose }) {
  if (!item) return null

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">{item.title ?? item.text}</div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        <div className="drawer-body">
          {type === 'opportunity' && (
            <>
              <div className="drawer-section">
                <div className="drawer-section-label">Status</div>
                <div className="drawer-section-content">
                  <span className={`status-tag ${item.status}`}>
                    {item.status === 'in-progress' ? 'In Progress' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="drawer-section">
                <div className="drawer-section-label">Description</div>
                <div className="drawer-section-content">{item.title}</div>
              </div>
              <div className="drawer-section">
                <div className="drawer-section-label">Scores</div>
                <div className="drawer-section-content">
                  Business Value: {item.businessValue} · Customer Value: {item.customerValue}
                </div>
              </div>
              <div className="drawer-section">
                <div className="drawer-section-label">Steps linked</div>
                <div className="drawer-section-content">{item.stepsLinked}</div>
              </div>
            </>
          )}
          {type === 'insight' && (
            <>
              <div className="drawer-section">
                <div className="drawer-section-label">Insight</div>
                <div className="drawer-section-content">{item.text}</div>
              </div>
              {item.source && (
                <div className="drawer-section">
                  <div className="drawer-section-label">Source</div>
                  <div className="drawer-section-content">{item.source}</div>
                </div>
              )}
              {item.severity && (
                <div className="drawer-section">
                  <div className="drawer-section-label">Severity</div>
                  <div className="drawer-section-content">
                    <span className={`insight-tag ${item.severity}`}>{item.severity}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Main component ───────────────────────────────────────── */

export default function JourneyMapView({ journey }) {
  const stages = [...(journey.stages || [])].sort((a, b) => a.order - b.order)
  const allInsights = journey.insights || []

  const [collapsed, setCollapsed] = useState({})
  const [drawer, setDrawer] = useState(null) // { item, type }

  function toggleLane(id) {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Build derived opportunities per stage (with a running global index)
  let oppGlobalIdx = 0
  const oppsByStage = stages.map(stage => {
    const list = (stage.opportunities || []).map(text => {
      const opp = deriveOpportunity(text, oppGlobalIdx, stage.id)
      oppGlobalIdx++
      return opp
    })
    return list
  })

  // Build insights per stage: structured insights + pain points
  const insightsByStage = stages.map(stage => {
    const structured = allInsights
      .filter(ins => ins.stage === stage.id)
      .map(ins => ({ ...ins, type: ins.severity === 'high' ? 'pain' : 'need' }))

    const painPoints = (stage.painPoints || []).map((text, i) => derivePainPoint(text, i, stage.id))

    // Deduplicate: prefer structured where they overlap
    return [...structured, ...painPoints]
  })

  // Touchpoint activity per stage
  const touchpointsByStage = stages.map(stage => {
    const tp = (stage.touchpoints || []).map(t => t.toLowerCase())
    return TOUCHPOINT_CATEGORIES.map(cat => {
      const active = tp.some(t =>
        t.includes(cat.toLowerCase()) ||
        (cat === 'Online' && (t.includes('web') || t.includes('website') || t.includes('comparison'))) ||
        (cat === 'Digital' && (t.includes('app') || t.includes('digital') || t.includes('online'))) ||
        (cat === 'Email' && t.includes('email')) ||
        (cat === 'Phone' && t.includes('phone')) ||
        (cat === 'Post' && t.includes('post'))
      )
      return { category: cat, active }
    })
  })

  const N = stages.length

  const openDrawer = (item, type) => setDrawer({ item, type })
  const closeDrawer = () => setDrawer(null)

  return (
    <>
      <div className="journey-canvas">
        <div className="phase-grid" style={{ '--phase-count': N }}>

          {/* ── Phase headers ─────────────────────────────── */}
          <div className="phase-header-corner">
            <span className="phase-corner-label">Phases</span>
            <span className="phase-corner-label">Steps</span>
          </div>
          {stages.map(stage => (
            <div key={stage.id} className="phase-header-cell">
              <div className="phase-header-top">
                <span className="phase-header-name">{stage.name}</span>
                <div className="phase-header-actions">
                  <button className="phase-header-action-btn" title="Sort">↕</button>
                  <button className="phase-header-action-btn" title="More">···</button>
                </div>
              </div>
              <div className="phase-header-steps">
                {(stage.actions || []).slice(0, 2).map((action, i) => (
                  <span key={i} className="phase-step-pill">
                    {action.length > 28 ? action.slice(0, 27) + '…' : action}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* ── Opportunities lane ────────────────────────── */}
          <LaneLabel
            label="Opportunities"
            collapsed={collapsed.opportunities}
            onToggle={() => toggleLane('opportunities')}
          />
          {stages.map((stage, si) => (
            <div key={stage.id} className="swim-lane-cell">
              {!collapsed.opportunities && oppsByStage[si].map(opp => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onClick={() => openDrawer(opp, 'opportunity')}
                />
              ))}
              {collapsed.opportunities && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {oppsByStage[si].length} opportunities
                </span>
              )}
            </div>
          ))}

          {/* ── Insights / Pain Points lane ───────────────── */}
          <LaneLabel
            label="Insights"
            collapsed={collapsed.insights}
            onToggle={() => toggleLane('insights')}
            className="insights-bg"
          />
          {stages.map((stage, si) => (
            <div key={stage.id} className="swim-lane-cell insights-bg">
              {!collapsed.insights && insightsByStage[si].map(ins => (
                <InsightCard
                  key={ins.id}
                  insight={ins}
                  onClick={() => openDrawer(ins, 'insight')}
                />
              ))}
              {collapsed.insights && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {insightsByStage[si].length} insights
                </span>
              )}
            </div>
          ))}

          {/* ── Emotion curve lane ────────────────────────── */}
          <LaneLabel
            label="Emotion"
            collapsed={collapsed.emotion}
            onToggle={() => toggleLane('emotion')}
            className="emotion-bg"
          />
          {/* Spans all phase columns */}
          <div
            className="swim-lane-cell emotion-bg"
            style={{ gridColumn: `2 / span ${N}`, padding: '8px 0' }}
          >
            {!collapsed.emotion && <EmotionCurve stages={stages} />}
            {collapsed.emotion && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '0 10px' }}>
                Emotion curve hidden
              </span>
            )}
          </div>

          {/* ── Metrics lane ──────────────────────────────── */}
          <LaneLabel
            label="Metrics"
            collapsed={collapsed.metrics}
            onToggle={() => toggleLane('metrics')}
            className="metrics-bg"
          />
          {stages.map((stage, si) => (
            <div key={stage.id} className="swim-lane-cell metrics-bg">
              {!collapsed.metrics && (
                <div className="metrics-chips">
                  {(STAGE_METRICS[si] || STAGE_METRICS[0]).map(m => (
                    <MetricChip key={m.name} name={m.name} value={null} />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* ── Solutions lane ────────────────────────────── */}
          <LaneLabel
            label="Solutions"
            collapsed={collapsed.solutions}
            onToggle={() => toggleLane('solutions')}
            className="solutions-bg"
          />
          {stages.map((stage, si) => {
            const total = oppsByStage[si].length
            const picked = Math.ceil(total * 0.4)
            const entry = total - picked
            return (
              <div key={stage.id} className="swim-lane-cell solutions-bg">
                {!collapsed.solutions && total > 0 && (
                  <div className="solutions-mini-panel">
                    <div className="solutions-panel-header">
                      <span className="solutions-panel-title">Opps by Status</span>
                      <button className="card-icon-btn">···</button>
                    </div>
                    <div className="solutions-legend">
                      <div className="solutions-legend-item">
                        <span className="solutions-legend-dot" style={{ background: '#8b5cf6' }} />
                        Picked
                      </div>
                      <div className="solutions-legend-item">
                        <span className="solutions-legend-dot" style={{ background: '#e5e7eb' }} />
                        Entry
                      </div>
                    </div>
                    <div className="solutions-bar-row">
                      <div className="solutions-bar-track">
                        <div
                          className="solutions-bar-fill"
                          style={{ width: `${(picked / total) * 100}%`, background: '#8b5cf6' }}
                        />
                      </div>
                      <span className="solutions-bar-count">{picked}</span>
                    </div>
                    <div className="solutions-bar-row">
                      <div className="solutions-bar-track">
                        <div
                          className="solutions-bar-fill"
                          style={{ width: `${(entry / total) * 100}%`, background: '#d1d5db' }}
                        />
                      </div>
                      <span className="solutions-bar-count">{entry}</span>
                    </div>
                  </div>
                )}
                {!collapsed.solutions && total === 0 && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>No opportunities</span>
                )}
              </div>
            )
          })}

          {/* ── Touchpoints matrix lane ───────────────────── */}
          <div className={`swim-lane-label-cell touchpoints-bg`} style={{ flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
              <span className="swim-lane-label-text">Touchpoints</span>
              <button
                className="swim-lane-collapse-btn"
                onClick={() => toggleLane('touchpoints')}
              >
                {collapsed.touchpoints ? '▸' : '▾'}
              </button>
            </div>
            {!collapsed.touchpoints && (
              <div className="touchpoints-label-col" style={{ marginTop: 8 }}>
                {TOUCHPOINT_CATEGORIES.map(cat => (
                  <div key={cat} className="touchpoint-label-item">{cat}</div>
                ))}
              </div>
            )}
          </div>
          {stages.map((stage, si) => (
            <div key={stage.id} className="swim-lane-cell touchpoints-bg">
              {!collapsed.touchpoints && (
                <div className="touchpoints-grid">
                  {touchpointsByStage[si].map(tp => (
                    <div key={tp.category} className="touchpoint-row">
                      <span className={`touchpoint-dot ${tp.active ? 'active' : 'inactive'}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

        </div>
      </div>

      {drawer && (
        <DetailDrawer
          item={drawer.item}
          type={drawer.type}
          onClose={closeDrawer}
        />
      )}
    </>
  )
}
