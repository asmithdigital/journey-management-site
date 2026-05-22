import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../App.jsx'
import {
  ComposedChart, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const METRIC_CONFIG = {
  taskCompletion: { name: 'Task Completion', unit: '%',  good: 'higher' },
  timeOnTask:     { name: 'Time on Task',    unit: 's',  good: 'lower'  },
  errorRate:      { name: 'Error Rate',      unit: '%',  good: 'lower'  },
  msat:           { name: 'MSAT',            unit: '/5', good: 'higher' },
}

const SCAN_LABELS = {
  totalScreens:       'Screens',
  totalFormFields:    'Form fields',
  totalClicks:        'Min. clicks',
  frictionPoints:     'Friction points',
  accessibilityIssues:'A11y issues',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

/* ─── Statistical callout ──────────────────────────────────────── */

function StatCallout({ methodology }) {
  const [open, setOpen] = useState(false)
  const notes = methodology?.statisticalNotes || {}
  return (
    <div className="bench-callout">
      <button className="bench-callout-toggle" onClick={() => setOpen(o => !o)}>
        <span className="bench-callout-icon">ℹ</span>
        <span>Statistical notes</span>
        <span className="bench-callout-chevron">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="bench-callout-body">
          {[notes.confidenceInterval, notes.sampleSize, notes.significance, notes.longitudinal]
            .filter(Boolean)
            .map((note, i) => <p key={i}>{note}</p>)}
        </div>
      )}
    </div>
  )
}

/* ─── Line chart with CI band ──────────────────────────────────── */

function MetricChart({ rounds, metricKey }) {
  const cfg = METRIC_CONFIG[metricKey] || { name: metricKey, unit: '', good: 'higher' }

  const data = rounds.map((r, i) => {
    const m = r.metrics[metricKey]
    return {
      name: `R${i + 1}`,
      label: r.label,
      value: m?.value ?? 0,
      lo:    m?.ci?.[0] ?? 0,
      delta: (m?.ci?.[1] ?? 0) - (m?.ci?.[0] ?? 0),
      hi:    m?.ci?.[1] ?? 0,
    }
  })

  function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    const d = data.find(d => d.name === label)
    const val = payload.find(p => p.dataKey === 'value')
    if (!val) return null
    return (
      <div style={{
        background: 'white', border: '1px solid #E4E7EB', borderRadius: 6,
        padding: '8px 10px', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <div style={{ fontWeight: 600, color: '#172B4D', marginBottom: 3, maxWidth: 200, lineHeight: 1.3 }}>
          {d?.label || label}
        </div>
        <div style={{ color: '#ea8600', fontWeight: 700, fontSize: 14 }}>
          {val.value}{cfg.unit}
        </div>
        {d && (
          <div style={{ color: '#97A0AF', fontSize: 11, marginTop: 2 }}>
            95% CI: [{d.lo}, {d.hi}]{cfg.unit}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bench-chart-card">
      <div className="bench-chart-title">
        {cfg.name}
        <span className="bench-chart-unit">&nbsp;{cfg.unit}</span>
        <span className="bench-chart-good">({cfg.good} is better)</span>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F4F5F7" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#97A0AF' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#97A0AF' }} width={36} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="lo"    stackId="ci" fill="transparent"            stroke="none" />
          <Area type="monotone" dataKey="delta" stackId="ci" fill="rgba(234,134,0,0.10)"  stroke="rgba(234,134,0,0.20)" strokeWidth={1} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#ea8600"
            strokeWidth={2.5}
            dot={{ fill: '#ea8600', r: 3, stroke: 'white', strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="bench-chart-ci-note">Shaded band = 95% CI</div>
    </div>
  )
}

/* ─── Round card ────────────────────────────────────────────────── */

function RoundCard({ round, prevRound, index }) {
  const [expanded, setExpanded] = useState(index === 0)

  function delta(key) {
    if (!prevRound) return null
    const diff = round.metrics[key].value - prevRound.metrics[key].value
    if (Math.abs(diff) < 0.005) return { text: '→', color: '#97A0AF' }
    const cfg = METRIC_CONFIG[key]
    const positive = cfg?.good === 'higher' ? diff > 0 : diff < 0
    const display = Number.isInteger(diff) ? diff : diff.toFixed(1)
    return {
      text: `${diff > 0 ? '+' : ''}${display}`,
      color: positive ? '#36B37E' : '#FF5630',
    }
  }

  return (
    <div className="bench-round-card">
      <button className="bench-round-header" onClick={() => setExpanded(o => !o)}>
        <div className="bench-round-header-left">
          <span className="bench-round-badge">R{index + 1}</span>
          <div>
            <div className="bench-round-label">{round.label}</div>
            <div className="bench-round-date">
              {formatDate(round.date)} · {round.participants} participants
            </div>
          </div>
        </div>
        <span className="bench-round-chevron">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <div className="bench-round-body">
          <div className="bench-round-metrics">
            {Object.entries(round.metrics).map(([key, data]) => {
              const cfg = METRIC_CONFIG[key]
              const d = delta(key)
              return (
                <div key={key} className="bench-round-metric">
                  <div className="bench-round-metric-name">{cfg?.name || key}</div>
                  <div className="bench-round-metric-value">
                    {data.value}{cfg?.unit || data.unit}
                    {d && (
                      <span style={{ fontSize: 11, color: d.color, marginLeft: 5, fontWeight: 600 }}>
                        {d.text}
                      </span>
                    )}
                  </div>
                  <div className="bench-round-metric-ci">
                    CI [{data.ci[0]}, {data.ci[1]}]
                  </div>
                </div>
              )
            })}
          </div>

          {round.notes && (
            <div className="bench-round-notes">{round.notes}</div>
          )}

          {round.significantFindings?.length > 0 && (
            <div className="bench-round-findings">
              <div className="bench-round-findings-title">Significant findings</div>
              <ul>
                {round.significantFindings.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Chrome scan card ──────────────────────────────────────────── */

function ScanCard({ scan, prevScan }) {
  const isBaseline = scan.type === 'baseline'

  return (
    <div className={`bench-scan-card${isBaseline ? ' bench-scan-baseline' : ' bench-scan-comparison'}`}>
      <div className="bench-scan-header">
        <div className="bench-scan-header-top">
          <span className={`bench-scan-type-badge ${scan.type}`}>
            {isBaseline ? 'Baseline' : 'Comparison'}
          </span>
          <span className="bench-scan-date">{formatDate(scan.date)}</span>
        </div>
        <div className="bench-scan-label">{scan.label}</div>
        {scan.comparedTo && (
          <div className="bench-scan-compared">Compared to: {scan.comparedTo}</div>
        )}
      </div>

      <div className="bench-scan-metrics">
        {Object.entries(scan.metrics).map(([key, val]) => {
          const prev = prevScan?.metrics?.[key]
          const diff = prev != null ? val - prev : null
          const positive = diff != null && diff < 0
          return (
            <div key={key} className="bench-scan-metric">
              <div className="bench-scan-metric-label">{SCAN_LABELS[key] || key}</div>
              <div className="bench-scan-metric-value">
                {val}
                {diff != null && diff !== 0 && (
                  <span style={{ fontSize: 10, color: positive ? '#36B37E' : '#FF5630', marginLeft: 4, fontWeight: 600 }}>
                    {diff > 0 ? '+' : ''}{diff}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {isBaseline && scan.findings?.length > 0 && (
        <div className="bench-scan-findings">
          <div className="bench-scan-findings-title">Findings</div>
          <ul>
            {scan.findings.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}

      {!isBaseline && scan.changes && (
        <div className="bench-scan-changes">
          {scan.changes.screensAdded?.length > 0 && (
            <div className="bench-change-group">
              <div className="bench-change-group-label">Screens added</div>
              {scan.changes.screensAdded.map((s, i) => (
                <div key={i} className="bench-change-item bench-change-added">+ {s}</div>
              ))}
            </div>
          )}
          {scan.changes.screensRemoved?.length > 0 && (
            <div className="bench-change-group">
              <div className="bench-change-group-label">Screens removed</div>
              {scan.changes.screensRemoved.map((s, i) => (
                <div key={i} className="bench-change-item bench-change-removed">− {s}</div>
              ))}
            </div>
          )}
          {scan.changes.newFeatures?.length > 0 && (
            <div className="bench-change-group">
              <div className="bench-change-group-label">New features</div>
              {scan.changes.newFeatures.map((f, i) => (
                <div key={i} className="bench-change-item bench-change-added">+ {f}</div>
              ))}
            </div>
          )}
          {scan.changes.resolvedFrictions?.length > 0 && (
            <div className="bench-change-group">
              <div className="bench-change-group-label">Resolved frictions</div>
              {scan.changes.resolvedFrictions.map((f, i) => (
                <div key={i} className="bench-change-item bench-change-resolved">✓ {f}</div>
              ))}
            </div>
          )}
          {scan.changes.newFrictions?.length > 0 && (
            <div className="bench-change-group">
              <div className="bench-change-group-label">New frictions</div>
              {scan.changes.newFrictions.map((f, i) => (
                <div key={i} className="bench-change-item bench-change-friction">⚠ {f}</div>
              ))}
            </div>
          )}
          {((scan.changes.fieldsAdded > 0) || (scan.changes.fieldsRemoved > 0)) && (
            <div className="bench-change-group">
              <div className="bench-change-group-label">Form fields</div>
              {scan.changes.fieldsAdded > 0 && (
                <div className="bench-change-item bench-change-added">+ {scan.changes.fieldsAdded} fields added</div>
              )}
              {scan.changes.fieldsRemoved > 0 && (
                <div className="bench-change-item bench-change-removed">− {scan.changes.fieldsRemoved} fields removed</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────────── */

export default function BenchmarkingDetail() {
  const { productId } = useParams()
  const { benchmarking } = useData()

  if (!benchmarking) {
    return (
      <div className="bench-page">
        <div className="no-data-page"><h2>Loading…</h2></div>
      </div>
    )
  }

  const product = benchmarking.products.find(p => p.id === productId)

  if (!product) {
    return (
      <div className="bench-page">
        <div className="bench-detail-topbar">
          <Link to="/benchmarking" className="bench-back-link">← Benchmarking</Link>
        </div>
        <div className="no-data-page">
          <h2>Product not found</h2>
          <p>No benchmarking data for: {productId}</p>
        </div>
      </div>
    )
  }

  const { uxBenchmarks, chromeScans } = product
  const rounds = uxBenchmarks.rounds

  return (
    <div className="bench-page">
      <div className="bench-detail-topbar">
        <Link to="/benchmarking" className="bench-back-link">← Benchmarking</Link>
      </div>

      <div className="bench-detail-header">
        <h1 className="bench-page-heading">{product.name}</h1>
        <p className="bench-page-subheading">{product.description}</p>
      </div>

      <div className="bench-page-section">
        <StatCallout methodology={benchmarking.methodology} />
      </div>

      {/* ── Section A: UX Benchmarking ─────────────────────── */}
      <div className="bench-section-block">
        <div className="bench-section-block-header">
          <h2 className="bench-section-block-title">UX Benchmarking Studies</h2>
          <span className="bench-section-block-meta">
            {rounds.length} round{rounds.length !== 1 ? 's' : ''} · {uxBenchmarks.testPlan.cadence}
          </span>
        </div>

        {/* Test plan */}
        <div className="bench-test-plan">
          <div className="bench-test-plan-heading">Test Plan</div>
          <div className="bench-test-plan-meta">
            <span>{uxBenchmarks.testPlan.participantsPerRound} participants/round</span>
            <span className="bench-dot">·</span>
            <span>{uxBenchmarks.testPlan.platform}</span>
            <span className="bench-dot">·</span>
            <span>{uxBenchmarks.testPlan.cadence}</span>
          </div>
          <ol className="bench-task-list">
            {uxBenchmarks.testPlan.tasks.map((task, i) => (
              <li key={i} className="bench-task-item">{task}</li>
            ))}
          </ol>
          {uxBenchmarks.testPlan.notes && (
            <div className="bench-test-plan-note">⚠ {uxBenchmarks.testPlan.notes}</div>
          )}
        </div>

        {/* Metric charts */}
        {rounds.length > 0 && (
          <div className="bench-charts-grid">
            {Object.keys(METRIC_CONFIG).map(key => (
              <MetricChart key={key} rounds={rounds} metricKey={key} />
            ))}
          </div>
        )}

        {/* Round history */}
        {rounds.length > 0 && (
          <div className="bench-rounds-section">
            <div className="bench-subsection-heading">Round History</div>
            <div className="bench-rounds-list">
              {rounds.map((round, i) => (
                <RoundCard
                  key={round.id}
                  round={round}
                  prevRound={i > 0 ? rounds[i - 1] : null}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Section B: Chrome Scans ─────────────────────────── */}
      <div className="bench-section-block">
        <div className="bench-section-block-header">
          <h2 className="bench-section-block-title">Chrome Scan Comparisons</h2>
          <span className="bench-section-block-meta">
            {chromeScans.length} scan{chromeScans.length !== 1 ? 's' : ''}
          </span>
        </div>

        {chromeScans.length === 0 ? (
          <div style={{ padding: '20px 0', color: '#97A0AF', fontSize: 13 }}>
            No Chrome scans recorded yet for this product.
          </div>
        ) : (
          <div className="bench-scan-list">
            {chromeScans.map((scan, i) => {
              const prevScan = scan.comparedTo
                ? chromeScans.find(s => s.id === scan.comparedTo)
                : null
              return <ScanCard key={scan.id} scan={scan} prevScan={prevScan} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}
