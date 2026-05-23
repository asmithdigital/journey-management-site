import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import OpportunityCard from '../cards/OpportunityCard.jsx'
import InsightCard from '../cards/InsightCard.jsx'
import EmotionCurve from './EmotionCurve.jsx'
import { useData } from '../../App.jsx'

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

function MetricLineChart({ series, labels, width = 316, height = 110, color = '#0052CC' }) {
  if (!series || series.length === 0) return null
  const PAD = { top: 12, right: 8, bottom: 28, left: 36 }
  const W = width - PAD.left - PAD.right
  const H = height - PAD.top - PAD.bottom
  const min = Math.min(...series)
  const max = Math.max(...series)
  const range = max - min || 1

  const pts = series.map((v, i) => ({
    x: PAD.left + (i / Math.max(series.length - 1, 1)) * W,
    y: PAD.top + (1 - (v - min) / range) * H,
    v,
  }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const gridYValues = [min, Math.round((min + max) / 2), max]
  const xLabels = labels || MONTHS.slice(0, series.length)

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
      {xLabels.map((lbl, i) => {
        const gx = PAD.left + (i / Math.max(series.length - 1, 1)) * W
        return (
          <text key={i} x={gx} y={height - 6} textAnchor="middle" fontSize={9} fill="#97A0AF">{lbl}</text>
        )
      })}
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="white" stroke={color} strokeWidth={2} />
      ))}
    </svg>
  )
}

/* ─── Metric type constants ────────────────────────────────────── */

const METRIC_TYPES = {
  UX_BENCH: {
    color: '#ea8600',
    bgColor: '#FFF4E0',
    borderColor: '#F5C07D',
    sourceLabel: 'UX Benchmarking · Claude Code upload',
    icon: '▣',
  },
  MEMBER_RESEARCH: {
    color: '#0052CC',
    bgColor: '#EAF0FF',
    borderColor: '#B3D4FF',
    sourceLabel: 'Member Research · Qualtrics',
    icon: '◉',
  },
  ANALYTICS: {
    color: '#00897B',
    bgColor: '#E0F2F1',
    borderColor: '#80CBC4',
    sourceLabel: 'Analytics · Google Analytics',
    icon: '▤',
  },
}

/* ─── Derive metric cards from benchmarking data ───────────────── */

const BM_METRIC_CONFIG = {
  msat:           { name: 'MSAT',           icon: '★', unit: '/5'  },
  taskCompletion: { name: 'Task Completion', icon: '✓', unit: '%'   },
  errorRate:      { name: 'Error Rate',      icon: '⚠', unit: '%'   },
  timeOnTask:     { name: 'Time on Task',    icon: '⏱', unit: 's'   },
}

function deriveBenchmarkMetrics(product) {
  const rounds = product.uxBenchmarks.rounds
  if (!rounds.length) return []
  const latest = rounds[rounds.length - 1]
  return Object.entries(latest.metrics).map(([key, data]) => {
    const cfg = BM_METRIC_CONFIG[key] || { name: key, icon: '▣', unit: data.unit || '' }
    return {
      id: key,
      name: cfg.name,
      icon: cfg.icon,
      score: data.value,
      unit: cfg.unit,
      series: rounds.map(r => r.metrics[key]?.value ?? 0),
      labels: rounds.map(r => `R${r.id.replace(/^r-?pre\d+$/, 'pre').replace(/^r(\d+)$/, 'R$1')}`),
      latestCI: data.ci,
      rounds: rounds.map(r => ({
        label: r.label,
        date: r.date,
        value: r.metrics[key]?.value ?? 0,
        ci: r.metrics[key]?.ci,
      })),
      productId: product.id,
      metricType: 'UX_BENCH',
      summary: `Based on ${rounds.length} benchmark round${rounds.length !== 1 ? 's' : ''} on ${product.name}.`,
    }
  })
}

/* ─── Derive member research metrics ───────────────────────────── */

function deriveMemberResearchMetrics(memberResearch, insuranceNps, journeyId) {
  const metrics = []
  if (memberResearch) {
    Object.entries(memberResearch).forEach(([key, metric]) => {
      if (metric.journeyId !== journeyId) return
      const rounds = metric.rounds
      const latest = rounds[rounds.length - 1]
      const isNps = key === 'nps'
      metrics.push({
        id: `mr-${key}`,
        name: metric.name,
        icon: METRIC_TYPES.MEMBER_RESEARCH.icon,
        score: latest.value,
        unit: isNps ? '' : '%',
        series: rounds.map(r => r.value),
        labels: rounds.map(r => r.date.slice(0, 7)),
        metricType: 'MEMBER_RESEARCH',
        summary: `${metric.name} from ${rounds.length} quarterly Qualtrics survey rounds. Latest sample: ${latest.sample?.toLocaleString()} respondents.`,
      })
    })
  }
  if (insuranceNps && insuranceNps.journeyId === journeyId) {
    const rounds = insuranceNps.rounds
    const latest = rounds[rounds.length - 1]
    metrics.push({
      id: 'mr-ins-nps',
      name: insuranceNps.name,
      icon: METRIC_TYPES.MEMBER_RESEARCH.icon,
      score: latest.value,
      unit: '',
      series: rounds.map(r => r.value),
      labels: rounds.map(r => r.date.slice(0, 7)),
      metricType: 'MEMBER_RESEARCH',
      summary: `Insurance NPS from ${rounds.length} quarterly Qualtrics survey rounds. Latest sample: ${latest.sample?.toLocaleString()} respondents.`,
    })
  }
  return metrics
}

/* ─── Tiny sparkline ────────────────────────────────────────────── */

function TinySparkline({ data, color, width = 40, height = 16 }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 2) + 1
    const y = (height - 2) - ((v - min) / range) * (height - 4) + 1
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width={width} height={height} style={{ display: 'inline-block', flexShrink: 0 }}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─── Metric Panel ─────────────────────────────────────────────── */

function MetricPanel({ metric, onClose }) {
  if (!metric) return null
  const typeKey = metric.metricType || 'UX_BENCH'
  const typeCfg = METRIC_TYPES[typeKey] || METRIC_TYPES.UX_BENCH
  const hasUnit = !!metric.unit
  const isNeg = !hasUnit && metric.score != null && metric.score < 0
  const scoreColor = isNeg ? '#FF5630' : typeCfg.color
  const prefix = !hasUnit && metric.score > 0 ? '+' : ''

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header" style={{ borderBottom: `2px solid ${typeCfg.color}` }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 6 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: typeCfg.bgColor, border: `1px solid ${typeCfg.borderColor}`,
                borderRadius: 4, padding: '2px 7px',
                fontSize: 10, fontWeight: 700, color: typeCfg.color,
                letterSpacing: '0.04em', whiteSpace: 'nowrap',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: typeCfg.color, display: 'inline-block' }} />
                {typeCfg.sourceLabel}
              </span>
            </div>
            <div className="drawer-title">{metric.name}</div>
          </div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        <div className="drawer-body">
          {metric.score != null ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: scoreColor, lineHeight: 1, marginBottom: 4 }}>
                  {prefix}{metric.score}{metric.unit || ''}
                </div>
                <div style={{ fontSize: 11, color: '#5E6C84' }}>
                  {metric.latestCI
                    ? `95% CI: [${metric.latestCI[0]}, ${metric.latestCI[1]}]${metric.unit || ''}`
                    : 'Current score · Last 6 months'}
                </div>
              </div>

              {metric.series && (
                <div className="drawer-section">
                  <div className="drawer-section-label">Trend</div>
                  <MetricLineChart series={metric.series} labels={metric.labels} color={typeCfg.color} />
                </div>
              )}

              {metric.rounds && metric.rounds.length > 0 && (
                <div className="drawer-section">
                  <div className="drawer-section-label">All rounds</div>
                  {metric.rounds.map((r, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      padding: '7px 0',
                      borderBottom: i < metric.rounds.length - 1 ? '1px solid #F4F5F7' : 'none',
                    }}>
                      <div>
                        <div style={{ fontSize: 12, color: '#172B4D', fontWeight: 600, lineHeight: 1.4 }}>
                          {r.label}
                        </div>
                        <div style={{ fontSize: 11, color: '#5E6C84' }}>{r.date}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>
                          {r.value}{metric.unit || ''}
                        </div>
                        {r.ci && (
                          <div style={{ fontSize: 10, color: '#5E6C84' }}>
                            CI [{r.ci[0]}, {r.ci[1]}]
                          </div>
                        )}
                        {r.sample && (
                          <div style={{ fontSize: 10, color: '#5E6C84' }}>
                            n={r.sample?.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {metric.summary && (
                <div className="drawer-section">
                  <div className="drawer-section-label">Summary</div>
                  <div className="drawer-section-content" style={{ color: '#42526E' }}>{metric.summary}</div>
                </div>
              )}

              <div style={{ paddingTop: 16, marginTop: 8, borderTop: '1px solid #E4E7EB' }}>
                <Link
                  to={metric.productId ? `/metrics-dashboard/${metric.productId}` : '/metrics-dashboard'}
                  onClick={onClose}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    color: typeCfg.color, fontSize: 13, fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  View in Metrics Dashboard →
                </Link>
              </div>
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

/* ─── Analytics chip panel ─────────────────────────────────────── */

function AnalyticsPanel({ chip, onClose }) {
  if (!chip) return null
  const typeCfg = METRIC_TYPES.ANALYTICS
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header" style={{ borderBottom: `2px solid ${typeCfg.color}` }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 6 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: typeCfg.bgColor, border: `1px solid ${typeCfg.borderColor}`,
                borderRadius: 4, padding: '2px 7px',
                fontSize: 10, fontWeight: 700, color: typeCfg.color,
                letterSpacing: '0.04em',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: typeCfg.color, display: 'inline-block' }} />
                {typeCfg.sourceLabel}
              </span>
            </div>
            <div className="drawer-title">{chip.name}</div>
          </div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        <div className="drawer-body">
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: typeCfg.color, lineHeight: 1, marginBottom: 4 }}>
              {chip.latestValue}{chip.unit}
            </div>
            <div style={{ fontSize: 11, color: '#5E6C84' }}>Latest · {chip.data[chip.data.length - 1]?.date}</div>
          </div>

          <div className="drawer-section">
            <div className="drawer-section-label">Monthly trend</div>
            {chip.data && (
              <MetricLineChart
                series={chip.data.map(d => d.value)}
                labels={chip.data.map(d => d.date)}
                color={typeCfg.color}
              />
            )}
          </div>

          <div className="drawer-section">
            <div className="drawer-section-label">All data points</div>
            {(chip.data || []).map((d, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: i < chip.data.length - 1 ? '1px solid #F4F5F7' : 'none',
              }}>
                <div style={{ fontSize: 12, color: '#42526E', fontWeight: 500 }}>{d.date}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>{d.value}{chip.unit}</div>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: 16, marginTop: 8, borderTop: '1px solid #E4E7EB' }}>
            <Link
              to="/metrics-dashboard"
              onClick={onClose}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                color: typeCfg.color, fontSize: 13, fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              View in Metrics Dashboard →
            </Link>
          </div>
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

/* ─── Metric Card ──────────────────────────────────────────────── */

function MetricCard({ metric, onClick }) {
  const typeKey = metric.metricType || 'UX_BENCH'
  const typeCfg = METRIC_TYPES[typeKey] || METRIC_TYPES.UX_BENCH
  const hasUnit = !!metric.unit
  const isNeg = !hasUnit && metric.score != null && metric.score < 0
  const scoreColor = isNeg ? '#FF5630' : typeCfg.color
  const prefix = !hasUnit && metric.score > 0 ? '+' : ''
  return (
    <div
      className="metric-card"
      onClick={onClick}
      style={{ borderLeft: `3px solid ${typeCfg.color}` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div className="metric-card-icon" style={{ color: typeCfg.color }}>{metric.icon}</div>
        <span style={{
          fontSize: 9, fontWeight: 700, color: typeCfg.color, textTransform: 'uppercase',
          letterSpacing: '0.04em', opacity: 0.8,
        }}>
          {typeKey === 'UX_BENCH' ? 'UX' : typeKey === 'MEMBER_RESEARCH' ? 'Research' : 'Analytics'}
        </span>
      </div>
      <div className="metric-card-name">{metric.name}</div>
      {metric.score != null ? (
        <div
          className="metric-card-score"
          style={{ color: scoreColor, fontSize: hasUnit ? 18 : 24 }}
        >
          {prefix}{metric.score}{metric.unit || ''}
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

/* ─── Executive Summary row for parent journeys ─────────────────── */

function ExecSummary({ journey, childJourneys, allJourneys, accentColor = '#0052CC' }) {
  const stages = journey.stages || []

  const totalPainPoints = stages.reduce((acc, s) => acc + (s.painPoints || []).length, 0) +
    (journey.insights?.filter(i => i.severity === 'high').length || 0) +
    childJourneys.reduce((acc, c) => {
      const j = allJourneys[c.id]
      if (!j) return acc
      return acc + (j.stages || []).reduce((a, s) => a + (s.painPoints || []).length, 0)
    }, 0)

  const totalOpps = stages.reduce((acc, s) => acc + (s.opportunities || []).length, 0) +
    childJourneys.reduce((acc, c) => {
      const j = allJourneys[c.id]
      if (!j) return acc
      return acc + (j.stages || []).reduce((a, s) => a + (s.opportunities || []).length, 0)
    }, 0)

  const totalInsights = (journey.insights?.length || 0) +
    childJourneys.reduce((acc, c) => acc + (allJourneys[c.id]?.insights?.length || 0), 0)

  const allStagesWithEmotion = stages.filter(s => s.emotions?.score != null)
  const avgEmotion = allStagesWithEmotion.length > 0
    ? (allStagesWithEmotion.reduce((a, s) => a + s.emotions.score, 0) / allStagesWithEmotion.length).toFixed(1)
    : null

  const worstStage = allStagesWithEmotion.length > 0
    ? allStagesWithEmotion.reduce((a, b) => a.emotions.score < b.emotions.score ? a : b)
    : null

  const stats = [
    { label: 'Pain Points', value: totalPainPoints, color: '#FF5630' },
    { label: 'Opportunities', value: totalOpps, color: accentColor },
    { label: 'Insights', value: totalInsights, color: '#6554C0' },
    ...(avgEmotion != null ? [{ label: 'Avg Emotion', value: `${avgEmotion}/10`, color: '#42526E' }] : []),
    ...(worstStage != null ? [{ label: 'Worst Stage', value: worstStage.name, color: '#FF5630', small: true }] : []),
  ]

  return (
    <div className="exec-summary-row">
      {stats.map((s, i) => (
        <div key={i} className="exec-summary-card" style={{ borderTop: `3px solid ${s.color}` }}>
          <div className="exec-summary-label">{s.label}</div>
          <div className="exec-summary-value" style={{ color: s.color, fontSize: s.small ? 14 : undefined }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function JourneyMapView({ journey, filters = {}, onTabChange, childJourneys = [] }) {
  const typeFilters = filters.typeFilters ?? new Set(['all'])
  const severityFilters = filters.severityFilters ?? new Set()

  const stages = [...(journey.stages || [])].sort((a, b) => a.order - b.order)
  const allInsights = journey.insights || []

  const [collapsed, setCollapsed] = useState({})
  const [drawer, setDrawer] = useState(null)
  const [metricPanel, setMetricPanel] = useState(null)
  const [analyticsPanel, setAnalyticsPanel] = useState(null)

  const { benchmarking, journeys: allJourneys } = useData()

  const isTopLevel = childJourneys.length > 0

  const bmProduct = benchmarking?.products?.find(p => p.journey === journey.id)
  const uxMetrics = bmProduct
    ? deriveBenchmarkMetrics(bmProduct)
    : JOURNEY_METRIC_DATA[journey.id] ?? (journey.metrics || [])

  const memberResearchMetrics = isTopLevel
    ? deriveMemberResearchMetrics(benchmarking?.memberResearch, benchmarking?.insuranceNps, journey.id)
    : []

  const journeyMetrics = [...uxMetrics, ...memberResearchMetrics]

  const analyticsData = benchmarking?.analytics?.[bmProduct?.id] || null

  function toggleLane(id) {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
  }

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

  const nestedPhaseMap = journey.nestedJourneyPhaseMap || {}
  const stageIdxMap = {}
  stages.forEach((s, i) => { stageIdxMap[s.id] = i })
  const nestedCards = childJourneys.map(child => {
    const phaseIds = nestedPhaseMap[child.id] || []
    const idxs = phaseIds.map(id => stageIdxMap[id]).filter(v => v !== undefined).sort((a, b) => a - b)
    const colStart = idxs.length > 0 ? idxs[0] + 1 : null
    const colSpan = idxs.length > 0 ? (idxs[idxs.length - 1] - idxs[0] + 1) : 1
    return { child, colStart, colSpan }
  })

  const openDrawer = (item, type) => setDrawer({ item, type })
  const closeDrawer = () => setDrawer(null)

  return (
    <>
      <div className="journey-canvas">

        {/* ── Executive Summary (Part 12, top-level only) ───── */}
        {isTopLevel && (
          <ExecSummary
            journey={journey}
            childJourneys={childJourneys}
            allJourneys={allJourneys || {}}
            accentColor="#0052CC"
          />
        )}

        {/* ── Metric cards row ──────────────────────────────── */}
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

          {/* ── Nested Journeys lane (before emotion) ────── */}
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
                style={{ gridColumn: `2 / span ${N}`, padding: 8 }}
              >
                {!collapsed.nested && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${N}, 1fr)`,
                    gap: 6,
                    height: '100%',
                  }}>
                    {nestedCards.map(({ child, colStart, colSpan }) =>
                      colStart !== null ? (
                        <div key={child.id} style={{ gridColumn: `${colStart} / span ${colSpan}` }}>
                          <NestedJourneyCard child={child} />
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </>
          )}

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

          {/* ── Analytics swim lane ───────────────────────── */}
          <LaneLabel
            label="Analytics"
            collapsed={collapsed.analytics}
            onToggle={() => toggleLane('analytics')}
            className="analytics-bg"
          />
          {stages.map((stage, si) => {
            const stageAnalytics = analyticsData?.stages?.[stage.id]
            const chips = stageAnalytics
              ? Object.entries(stageAnalytics.metrics).map(([key, m]) => {
                  const latest = m.data[m.data.length - 1]
                  const prev = m.data[m.data.length - 2]
                  const trend = prev ? latest.value - prev.value : 0
                  const improving = m.good === 'higher' ? trend >= 0 : trend <= 0
                  return {
                    key, name: m.name, unit: m.unit, latestValue: latest.value,
                    trend, improving, good: m.good, data: m.data,
                  }
                })
              : []
            return (
              <div key={stage.id} className="swim-lane-cell analytics-bg">
                {!collapsed.analytics && chips.length > 0 && (
                  <div className="analytics-chips">
                    {chips.map(chip => (
                      <div
                        key={chip.key}
                        className="analytics-chip"
                        onClick={() => setAnalyticsPanel(chip)}
                      >
                        <div className="analytics-chip-name">{chip.name}</div>
                        <div className="analytics-chip-value-row">
                          <span className="analytics-chip-value">
                            {chip.latestValue}{chip.unit}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: chip.improving ? '#36B37E' : '#FF5630' }}>
                            {chip.trend > 0 ? '↑' : chip.trend < 0 ? '↓' : '→'}
                          </span>
                          <TinySparkline
                            data={chip.data.map(d => d.value)}
                            color={chip.improving ? '#36B37E' : '#FF5630'}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!collapsed.analytics && chips.length === 0 && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>No analytics</span>
                )}
              </div>
            )
          })}

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

      {analyticsPanel && (
        <AnalyticsPanel chip={analyticsPanel} onClose={() => setAnalyticsPanel(null)} />
      )}
    </>
  )
}
