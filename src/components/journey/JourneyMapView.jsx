import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import OpportunityCard from '../cards/OpportunityCard.jsx'
import InsightCard from '../cards/InsightCard.jsx'
import EmotionCurve from './EmotionCurve.jsx'

/* ─── Helpers ──────────────────────────────────────────────────── */

function simpleHash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h)
}

const STATUS_CYCLE = ['open', 'validated', 'in-progress', 'open', 'solved', 'open']
const IMPACT_BASE = { high: 76, medium: 50, low: 24 }
const EFFORT_BASE  = { low: 76, medium: 50, high: 24 }

function bandedValue(base, seed) {
  return Math.min(95, Math.max(5, base + (simpleHash(seed) % 14) - 7))
}

function deriveOpportunity(opp, globalIdx, stageId) {
  const isObj = typeof opp === 'object' && opp !== null
  const text   = isObj ? opp.description : opp
  const id     = isObj ? opp.id : `${stageId}-opp-${globalIdx}`
  const customerValue = isObj && opp.impact
    ? bandedValue(IMPACT_BASE[opp.impact] ?? 50, text + 'cv')
    : 20 + (simpleHash(text + 'cv') % 70)
  const businessValue = isObj && opp.effort
    ? bandedValue(EFFORT_BASE[opp.effort] ?? 50, text + 'bv')
    : 20 + (simpleHash(text + 'bv') % 70)
  return {
    id, title: text,
    impact: isObj ? opp.impact : null,
    effort: isObj ? opp.effort : null,
    status: STATUS_CYCLE[globalIdx % STATUS_CYCLE.length],
    businessValue, customerValue,
    stepsLinked: 1 + (globalIdx % 3),
    score: Math.round((customerValue + businessValue) / 2),
    stageId,
  }
}

function derivePainPoint(pp, index, stageId) {
  if (typeof pp === 'string') {
    return { id: `${stageId}-pain-${index}`, text: pp, type: 'pain', severity: 'high' }
  }
  return {
    id: pp.id, text: pp.description,
    source: pp.source, evidenceCount: pp.evidenceCount,
    type: pp.severity === 'high' ? 'pain' : pp.severity === 'medium' ? 'need' : 'gain',
    severity: pp.severity,
  }
}

const TOUCHPOINT_CATEGORIES = ['Branch', 'Online', 'Digital', 'App', 'Email', 'Phone', 'Post']
const STAGE_METRICS = [
  [{ name: 'Web Visits' }, { name: 'Bounce Rate' }],
  [{ name: 'Form Drop-off' }, { name: 'Completion Rate' }],
  [{ name: 'Quote Views' }, { name: 'Comparison Rate' }],
  [{ name: 'Conversion Rate' }, { name: 'CSAT' }],
]

const MONTHS = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']

const JOURNEY_METRIC_DATA = {
  'claims': [
    {
      id: 'nps', name: 'Net Promoter Score', icon: '◎', score: -12,
      series: [-15, -12, -8, -12, -10, -12],
      summary: 'NPS has been consistently negative, indicating more detractors than promoters. Long resolution times and unclear communication are the primary drivers.',
    },
  ],
  'quote-to-buy': [
    {
      id: 'nps', name: 'Net Promoter Score', icon: '◎', score: 45,
      series: [38, 40, 42, 44, 43, 45],
      summary: 'NPS shows a steady upward trend over the past 6 months, driven by simplification of the quote flow and improved comparison tools.',
    },
    {
      id: 'csat', name: 'Customer Satisfaction', icon: '★', score: 72,
      series: [65, 68, 70, 71, 72, 72],
      summary: 'CSAT has improved as the quote and purchase flow was streamlined, reducing average completion time by 40%.',
    },
  ],
}

function isInsightVisible(ins, typeFilters, severityFilters) {
  if (typeFilters.has('all') && severityFilters.size === 0) return true
  const typeOK = typeFilters.has('all') || typeFilters.has(ins.type)
  const sevOK = severityFilters.size === 0 || severityFilters.has(ins.severity ?? 'medium')
  return typeOK && sevOK
}

function showOpportunities(typeFilters) {
  return typeFilters.has('all') || typeFilters.has('opportunities')
}

/* ─── Swim lane label cell ─────────────────────────────────────── */

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

/* ─── Metric line chart (for panel) ───────────────────────────── */

function MetricLineChart({ series, width = 316, height = 110 }) {
  if (!series || series.length === 0) return null
  const PAD = { top: 12, right: 8, bottom: 28, left: 36 }
  const W = width - PAD.left - PAD.right
  const H = height - PAD.top - PAD.bottom
  const min = Math.min(...series)
  const max = Math.max(...series)
  const range = max - min || 1

  const pts = series.map((v, i) => ({
    x: PAD.left + (i / (series.length - 1)) * W,
    y: PAD.top + (1 - (v - min) / range) * H,
    v,
  }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

  const gridYValues = [min, Math.round((min + max) / 2), max]

  return (
    <svg width={width} height={height} style={{ display: 'block', width: '100%' }}>
      {gridYValues.map((v, i) => {
        const gy = PAD.top + (1 - (v - min) / range) * H
        return (
          <g key={i}>
            <line x1={PAD.left} y1={gy} x2={PAD.left + W} y2={gy} stroke="#E4E7EB" strokeWidth={1} strokeDasharray="3 3" />
            <text x={PAD.left - 4} y={gy + 4} textAnchor="end" fontSize={9} fill="#97A0AF">{v}</text>
          </g>
        )
      })}
      {MONTHS.slice(0, series.length).map((m, i) => {
        const gx = PAD.left + (i / (series.length - 1)) * W
        return (
          <text key={m} x={gx} y={height - 6} textAnchor="middle" fontSize={9} fill="#97A0AF">{m}</text>
        )
      })}
      <path d={linePath} fill="none" stroke="#0052CC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="white" stroke="#0052CC" strokeWidth={2} />
      ))}
    </svg>
  )
}

/* ─── Metric Panel (Part 9) ────────────────────────────────────── */

function MetricPanel({ metric, onClose }) {
  if (!metric) return null
  const scoreColor = metric.score != null && metric.score < 0 ? '#FF5630' : '#36B37E'

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">{metric.name}</div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        <div className="drawer-body">
          {metric.score != null ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: scoreColor, lineHeight: 1, marginBottom: 4 }}>
                  {metric.score > 0 ? `+${metric.score}` : metric.score}
                </div>
                <div style={{ fontSize: 11, color: '#5E6C84' }}>Current score · Last 6 months</div>
              </div>
              {metric.series && (
                <div className="drawer-section">
                  <div className="drawer-section-label">Trend</div>
                  <MetricLineChart series={metric.series} />
                </div>
              )}
              {metric.summary && (
                <div className="drawer-section">
                  <div className="drawer-section-label">Summary</div>
                  <div className="drawer-section-content">{metric.summary}</div>
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 13, color: '#5E6C84', textAlign: 'center', paddingTop: 40 }}>
              No data available for this metric.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Detail Drawer (Part 10) ──────────────────────────────────── */

function DetailDrawer({ item, type, onClose, onViewInsightsTab }) {
  if (!item) return null

  const TYPE_LABEL = { pain: 'Pain', need: 'Need', gain: 'Gain', observation: 'Observation' }
  const TYPE_STYLE = {
    pain:        { background: '#FF5630', color: 'white' },
    need:        { background: '#0052CC', color: 'white' },
    gain:        { background: '#36B37E', color: 'white' },
    observation: { background: '#6554C0', color: 'white' },
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          {type === 'insight' && item.type && (
            <span
              className="insight-tag"
              style={{ ...TYPE_STYLE[item.type], marginRight: 8, flexShrink: 0 }}
            >
              {TYPE_LABEL[item.type] ?? item.type}
            </span>
          )}
          {type === 'opportunity' && (
            <span className={`status-tag ${item.status}`} style={{ marginRight: 8, flexShrink: 0 }}>
              {item.status === 'in-progress' ? 'In Progress' : (item.status?.charAt(0).toUpperCase() + item.status?.slice(1))}
            </span>
          )}
          <div className="drawer-title" style={{ flex: 1 }}>
            {type === 'insight' ? (item.text ?? item.title) : item.title}
          </div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        <div className="drawer-body">
          {type === 'insight' && (
            <>
              <div className="drawer-section">
                <div className="drawer-section-label">Full text</div>
                <div className="drawer-section-content" style={{ lineHeight: 1.7 }}>
                  {item.text ?? item.description}
                </div>
              </div>
              {item.severity && (
                <div className="drawer-section">
                  <div className="drawer-section-label">Severity</div>
                  <div className="drawer-section-content">
                    <span className={`insight-tag ${item.severity}`}>{item.severity}</span>
                  </div>
                </div>
              )}
              {item.source && (
                <div className="drawer-section">
                  <div className="drawer-section-label">Source</div>
                  <div className="drawer-section-content">{item.source}</div>
                </div>
              )}
              {item.evidenceCount && (
                <div className="drawer-section">
                  <div className="drawer-section-label">Evidence</div>
                  <div className="drawer-section-content">{item.evidenceCount} sources</div>
                </div>
              )}
              {onViewInsightsTab && (
                <button
                  className="drawer-tab-link"
                  onClick={() => { onClose(); onViewInsightsTab() }}
                >
                  View in Insights tab →
                </button>
              )}
            </>
          )}
          {type === 'opportunity' && (
            <>
              <div className="drawer-section">
                <div className="drawer-section-label">Description</div>
                <div className="drawer-section-content" style={{ lineHeight: 1.7 }}>{item.title}</div>
              </div>
              {(item.impact || item.effort) && (
                <div className="drawer-section">
                  <div className="drawer-section-label">Impact / Effort</div>
                  <div className="drawer-section-content" style={{ display: 'flex', gap: 6 }}>
                    {item.impact && <span className={`impact-tag impact-${item.impact}`}>{item.impact} impact</span>}
                    {item.effort && <span className={`effort-tag effort-${item.effort}`}>{item.effort} effort</span>}
                  </div>
                </div>
              )}
              <div className="drawer-section">
                <div className="drawer-section-label">Status</div>
                <div className="drawer-section-content">
                  <span className={`status-tag ${item.status}`}>
                    {item.status === 'in-progress' ? 'In Progress' : item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                  </span>
                </div>
              </div>
              <div className="drawer-section">
                <div className="drawer-section-label">Scores</div>
                <div className="drawer-section-content">
                  <div>Business Value: <strong>{item.businessValue}%</strong></div>
                  <div style={{ marginTop: 4 }}>Customer Value: <strong>{item.customerValue}%</strong></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Metric Card (Part 4) ─────────────────────────────────────── */

function MetricCard({ metric, onClick }) {
  const scoreColor = metric.score != null && metric.score < 0 ? '#FF5630' : '#172B4D'
  return (
    <div className="metric-card" onClick={onClick}>
      <div className="metric-card-icon">{metric.icon}</div>
      <div className="metric-card-name">{metric.name}</div>
      {metric.score != null ? (
        <div className="metric-card-score" style={{ color: scoreColor }}>
          {metric.score > 0 ? `+${metric.score}` : metric.score}
        </div>
      ) : (
        <div className="metric-card-nodata">No data</div>
      )}
    </div>
  )
}

/* ─── Nested Journey Cards (Part 1) ────────────────────────────── */

function NestedJourneyCard({ child }) {
  const statusColors = {
    validated:   { dot: '#36B37E', bg: '#E3FCEF', text: '#006644' },
    'in-progress': { dot: '#FF991F', bg: '#DEEBFF', text: '#0747A6' },
    discovery:   { dot: '#6554C0', bg: '#EAE6FF', text: '#403294' },
    open:        { dot: '#C1C7D0', bg: '#F4F5F7', text: '#42526E' },
  }
  const sc = statusColors[child.status] ?? statusColors.open

  return (
    <Link to={`/journey/${child.id}`} className="nested-journey-card">
      <div className="nested-journey-card-top">
        <span className="nested-journey-card-name">{child.name}</span>
        {child.status && (
          <span className="nested-journey-status-dot" style={{ background: sc.dot }} />
        )}
      </div>
      {child.hasData ? (
        <div className="nested-journey-card-meta">
          {child.stagesCount} stages · {child.insightsCount} insights
        </div>
      ) : (
        <div className="nested-journey-card-meta" style={{ color: '#C1C7D0' }}>No data yet</div>
      )}
      {child.status && (
        <span
          className="nested-journey-status-badge"
          style={{ background: sc.bg, color: sc.text }}
        >
          {child.status === 'in-progress' ? 'In Progress' : child.status.charAt(0).toUpperCase() + child.status.slice(1)}
        </span>
      )}
    </Link>
  )
}

/* ─── Main component ───────────────────────────────────────────── */

export default function JourneyMapView({ journey, filters = {}, onTabChange, childJourneys = [] }) {
  const typeFilters = filters.typeFilters ?? new Set(['all'])
  const severityFilters = filters.severityFilters ?? new Set()

  const stages = [...(journey.stages || [])].sort((a, b) => a.order - b.order)
  const allInsights = journey.insights || []

  const [collapsed, setCollapsed] = useState({})
  const [drawer, setDrawer] = useState(null)
  const [metricPanel, setMetricPanel] = useState(null)

  function toggleLane(id) {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const journeyMetrics = JOURNEY_METRIC_DATA[journey.id] ?? (journey.metrics || [])

  let oppGlobalIdx = 0
  const oppsByStage = stages.map(stage => {
    const list = (stage.opportunities || []).map(opp => {
      const derived = deriveOpportunity(opp, oppGlobalIdx, stage.id)
      oppGlobalIdx++
      return derived
    })
    return list
  })

  const insightsByStage = stages.map(stage => {
    const structured = allInsights
      .filter(ins => ins.stage === stage.id)
      .map(ins => ({
        ...ins,
        text: ins.description ?? ins.text,
        type: ins.severity === 'high' ? 'pain' : ins.severity === 'medium' ? 'need' : 'gain',
      }))
    const painPoints = (stage.painPoints || []).map((pp, i) => derivePainPoint(pp, i, stage.id))
    return [...structured, ...painPoints]
  })

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
  const oppVisible = showOpportunities(typeFilters)

  const openDrawer = (item, type) => setDrawer({ item, type })
  const closeDrawer = () => setDrawer(null)

  return (
    <>
      <div className="journey-canvas">

        {/* ── Metric cards row (Part 4) ─────────────────────── */}
        {journeyMetrics.length > 0 && (
          <div className="metric-cards-row">
            {journeyMetrics.map(m => (
              <MetricCard key={m.id} metric={m} onClick={() => setMetricPanel(m)} />
            ))}
          </div>
        )}

        <div className="phase-grid" style={{ '--phase-count': N }}>

          {/* ── Phase headers ─────────────────────────────── */}
          <div className="phase-header-corner">
            <span className="phase-corner-label">Phases / Steps</span>
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

          {/* ── Emotion curve lane (FIRST — Part 2) ──────── */}
          <LaneLabel
            label="Emotion"
            collapsed={collapsed.emotion}
            onToggle={() => toggleLane('emotion')}
            className="emotion-bg"
          />
          <div
            className="swim-lane-cell emotion-bg"
            style={{ gridColumn: `2 / span ${N}`, padding: '16px 0' }}
          >
            {!collapsed.emotion && <EmotionCurve stages={stages} />}
            {collapsed.emotion && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '0 10px' }}>
                Emotion curve hidden
              </span>
            )}
          </div>

          {/* ── Insights / Pain Points lane ───────────────── */}
          <LaneLabel
            label="Insights"
            collapsed={collapsed.insights}
            onToggle={() => toggleLane('insights')}
            className="insights-bg"
          />
          {stages.map((stage, si) => {
            const visible = insightsByStage[si].filter(ins => isInsightVisible(ins, typeFilters, severityFilters))
            return (
              <div key={stage.id} className="swim-lane-cell insights-bg">
                {!collapsed.insights && visible.map(ins => (
                  <InsightCard
                    key={ins.id}
                    insight={ins}
                    onClick={() => openDrawer(ins, 'insight')}
                  />
                ))}
                {!collapsed.insights && visible.length === 0 && insightsByStage[si].length > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Filtered out</span>
                )}
                {collapsed.insights && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {insightsByStage[si].length} insights
                  </span>
                )}
              </div>
            )
          })}

          {/* ── Opportunities lane ────────────────────────── */}
          <LaneLabel
            label="Opportunities"
            collapsed={collapsed.opportunities}
            onToggle={() => toggleLane('opportunities')}
          />
          {stages.map((stage, si) => (
            <div key={stage.id} className="swim-lane-cell">
              {!collapsed.opportunities && oppVisible && oppsByStage[si].map(opp => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onClick={() => openDrawer(opp, 'opportunity')}
                />
              ))}
              {!collapsed.opportunities && !oppVisible && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Filtered out</span>
              )}
              {collapsed.opportunities && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {oppsByStage[si].length} opportunities
                </span>
              )}
            </div>
          ))}

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
                    <div key={m.name} className="metric-chip">
                      <div className="metric-chip-name">{m.name}</div>
                      <div className="metric-chip-nodata">No data</div>
                    </div>
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
                        <div className="solutions-bar-fill" style={{ width: `${(picked / total) * 100}%`, background: '#8b5cf6' }} />
                      </div>
                      <span className="solutions-bar-count">{picked}</span>
                    </div>
                    <div className="solutions-bar-row">
                      <div className="solutions-bar-track">
                        <div className="solutions-bar-fill" style={{ width: `${(entry / total) * 100}%`, background: '#d1d5db' }} />
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
          <div className="swim-lane-label-cell touchpoints-bg" style={{ flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
              <span className="swim-lane-label-text">Touchpoints</span>
              <button className="swim-lane-collapse-btn" onClick={() => toggleLane('touchpoints')}>
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

          {/* ── Nested Journeys lane (Part 1) ─────────────── */}
          {childJourneys.length > 0 && (
            <>
              <LaneLabel
                label="Nested Journeys"
                collapsed={collapsed.nested}
                onToggle={() => toggleLane('nested')}
                className="nested-bg"
              />
              <div
                className="swim-lane-cell nested-bg"
                style={{ gridColumn: `2 / span ${N}` }}
              >
                {!collapsed.nested && (
                  <div className="nested-journeys-cards">
                    {childJourneys.map(child => (
                      <NestedJourneyCard key={child.id} child={child} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>

      {drawer && (
        <DetailDrawer
          item={drawer.item}
          type={drawer.type}
          onClose={closeDrawer}
          onViewInsightsTab={onTabChange ? () => onTabChange('insights') : null}
        />
      )}

      {metricPanel && (
        <MetricPanel metric={metricPanel} onClose={() => setMetricPanel(null)} />
      )}
    </>
  )
}
