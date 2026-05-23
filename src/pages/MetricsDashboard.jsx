import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../App.jsx'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatQuarterDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    month: 'short', year: 'numeric',
  })
}

function calcTrend(rounds, key, goodDir) {
  if (rounds.length < 2) return null
  const latest = rounds[rounds.length - 1].metrics[key]?.value
  const prev = rounds[rounds.length - 2].metrics[key]?.value
  if (latest == null || prev == null) return null
  const diff = latest - prev
  if (Math.abs(diff) < 0.01) return { arrow: '→', color: '#5E6C84' }
  const positive = goodDir === 'higher' ? diff > 0 : diff < 0
  return {
    arrow: diff > 0 ? '↑' : '↓',
    color: positive ? '#36B37E' : '#FF5630',
  }
}

/* ─── Tiny Sparkline SVG ─────────────────────────────────────── */

function Sparkline({ data, color = '#ea8600', width = 64, height = 24 }) {
  if (!data || data.length < 2) return null
  const vals = data.map(d => d.value)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width={width} height={height} style={{ display: 'block', flexShrink: 0 }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ─── Section header bar ─────────────────────────────────────── */

function SectionHeader({ color, label, icon, count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      borderLeft: `4px solid ${color}`,
      paddingLeft: 12, marginBottom: 16,
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>{label}</div>
        {count != null && (
          <div style={{ fontSize: 11, color: '#5E6C84', marginTop: 1 }}>
            {count} metric{count !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Source badge ───────────────────────────────────────────── */

function SourceBadge({ color, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: `${color}18`,
      border: `1px solid ${color}40`,
      borderRadius: 4,
      padding: '2px 7px',
      fontSize: 10,
      fontWeight: 700,
      color: color,
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      {label}
    </span>
  )
}

/* ─── Data uploads table ─────────────────────────────────────── */

function DataUploadsTable({ uploads }) {
  if (!uploads || uploads.length === 0) return null
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: '#5E6C84', marginBottom: 8,
      }}>
        Data uploads
      </div>
      <div style={{
        border: '1px solid #E4E7EB', borderRadius: 6, overflow: 'hidden',
      }}>
        {uploads.map((u, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: 12,
              padding: '8px 12px',
              borderBottom: i < uploads.length - 1 ? '1px solid #F4F5F7' : 'none',
              cursor: 'pointer',
              transition: 'background 0.1s',
              fontSize: 12,
              alignItems: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F8F9FA'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#172B4D' }}>{u.label}</div>
              <div style={{ color: '#5E6C84', fontSize: 11 }}>{u.date}</div>
            </div>
            <div style={{ color: '#42526E' }}>{u.source}</div>
            <div style={{ color: '#0052CC', fontSize: 11, fontWeight: 600 }}>View →</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Member Research card ───────────────────────────────────── */

function MemberResearchCard({ metric, label }) {
  const rounds = metric.rounds
  const latest = rounds[rounds.length - 1]
  const prev = rounds[rounds.length - 2]
  const diff = prev ? latest.value - prev.value : null
  const isNps = label === 'NPS'
  const prefix = isNps && latest.value > 0 ? '+' : ''

  const uploads = rounds.map((r, i) => ({
    label: `${label} — ${formatQuarterDate(r.date)}`,
    date: formatDate(r.date),
    source: 'Qualtrics export',
  }))

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E4E7EB',
      borderLeft: '3px solid #0052CC',
      borderRadius: 8,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#5E6C84', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            {metric.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#0052CC', lineHeight: 1 }}>
              {prefix}{latest.value}
            </span>
            {diff != null && (
              <span style={{ fontSize: 12, fontWeight: 700, color: diff > 0 ? '#36B37E' : '#FF5630' }}>
                {diff > 0 ? '+' : ''}{diff}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#5E6C84', marginTop: 2 }}>
            {latest.sample.toLocaleString()} respondents · {formatQuarterDate(latest.date)}
          </div>
        </div>
        <Sparkline data={rounds.map(r => ({ value: r.value }))} color="#0052CC" width={72} height={32} />
      </div>
      <SourceBadge color="#0052CC" label="Member Research · Qualtrics" />
      <DataUploadsTable uploads={uploads} />
    </div>
  )
}

/* ─── UX Benchmarking product card ──────────────────────────── */

function UXProductCard({ product }) {
  const rounds = product.uxBenchmarks.rounds
  const latest = rounds[rounds.length - 1]
  const msatTrend = calcTrend(rounds, 'msat', 'higher')
  const tcTrend = calcTrend(rounds, 'taskCompletion', 'higher')
  const erTrend = calcTrend(rounds, 'errorRate', 'lower')

  const uploads = rounds.map((r, i) => ({
    label: `${r.label}`,
    date: formatDate(r.date),
    source: 'Claude Code upload',
  }))

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E4E7EB',
      borderLeft: '3px solid #ea8600',
      borderRadius: 8,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <Link to={`/metrics-dashboard/${product.id}`} style={{ textDecoration: 'none' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', marginBottom: 2 }}>{product.name}</div>
        <div style={{ fontSize: 11, color: '#5E6C84' }}>{product.description}</div>
      </Link>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5E6C84', marginBottom: 2 }}>MSAT</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#ea8600', lineHeight: 1 }}>{latest?.metrics.msat.value ?? '—'}</span>
            <span style={{ fontSize: 11, color: '#C1C7D0' }}>/5</span>
            {msatTrend && <span style={{ fontSize: 13, fontWeight: 700, color: msatTrend.color }}>{msatTrend.arrow}</span>}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5E6C84', marginBottom: 2 }}>Completion</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#ea8600', lineHeight: 1 }}>{latest?.metrics.taskCompletion.value ?? '—'}</span>
            <span style={{ fontSize: 11, color: '#C1C7D0' }}>%</span>
            {tcTrend && <span style={{ fontSize: 13, fontWeight: 700, color: tcTrend.color }}>{tcTrend.arrow}</span>}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5E6C84', marginBottom: 2 }}>Error Rate</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#ea8600', lineHeight: 1 }}>{latest?.metrics.errorRate.value ?? '—'}</span>
            <span style={{ fontSize: 11, color: '#C1C7D0' }}>%</span>
            {erTrend && <span style={{ fontSize: 13, fontWeight: 700, color: erTrend.color }}>{erTrend.arrow}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SourceBadge color="#ea8600" label="UX Benchmarking · Claude Code upload" />
        <span style={{ fontSize: 11, color: '#5E6C84' }}>
          {rounds.length} round{rounds.length !== 1 ? 's' : ''} · {formatDate(latest?.date)}
        </span>
      </div>

      <DataUploadsTable uploads={uploads} />
    </div>
  )
}

/* ─── Analytics overview card ────────────────────────────────── */

function AnalyticsProductCard({ productId, productData, productName }) {
  const stages = productData.stages
  const stageKeys = Object.keys(stages)

  const highlights = stageKeys.flatMap(stageId => {
    const stage = stages[stageId]
    return Object.entries(stage.metrics).map(([key, m]) => {
      const latest = m.data[m.data.length - 1]
      const prev = m.data[m.data.length - 2]
      const trend = prev ? latest.value - prev.value : 0
      const improving = m.good === 'higher' ? trend >= 0 : trend <= 0
      return {
        stageId, metricKey: key, name: m.name, unit: m.unit,
        value: latest.value, trend, improving, good: m.good,
        data: m.data,
      }
    })
  }).slice(0, 4)

  const uploads = stageKeys.slice(0, 6).map((stageId, i) => ({
    label: `${productName} — ${stageId} analytics`,
    date: 'May 2026',
    source: 'Google Analytics API',
  }))

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E4E7EB',
      borderLeft: '3px solid #00897B',
      borderRadius: 8,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', marginBottom: 2 }}>{productName}</div>
        <div style={{ fontSize: 11, color: '#5E6C84' }}>{stageKeys.length} stages tracked</div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {highlights.map((h, i) => (
          <div key={i} style={{ minWidth: 110 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5E6C84', marginBottom: 2 }}>
              {h.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#00897B', lineHeight: 1 }}>
                {h.value}{h.unit}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: h.improving ? '#36B37E' : '#FF5630' }}>
                {h.trend > 0 ? '↑' : h.trend < 0 ? '↓' : '→'}
              </span>
              <Sparkline data={h.data} color="#00897B" width={44} height={20} />
            </div>
          </div>
        ))}
      </div>

      <SourceBadge color="#00897B" label="Analytics · Google Analytics" />
      <DataUploadsTable uploads={uploads} />
    </div>
  )
}

/* ─── Statistical callout ────────────────────────────────────── */

function StatCallout({ methodology }) {
  const [open, setOpen] = useState(false)
  const notes = methodology?.statisticalNotes || {}
  return (
    <div className="bench-callout">
      <button className="bench-callout-toggle" onClick={() => setOpen(o => !o)}>
        <span className="bench-callout-icon">ℹ</span>
        <span>Statistical notes — confidence intervals, sample size &amp; longitudinal rules</span>
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

/* ─── Main page ──────────────────────────────────────────────── */

export default function MetricsDashboard() {
  const { benchmarking } = useData()
  const [methodologyOpen, setMethodologyOpen] = useState(false)

  if (!benchmarking) {
    return (
      <div className="bench-page">
        <div className="bench-page-hero">
          <h1 className="bench-page-heading">Metrics Dashboard</h1>
        </div>
        <div className="no-data-page"><h2>No metrics data available.</h2></div>
      </div>
    )
  }

  const { products, methodology, memberResearch, insuranceNps, analytics } = benchmarking

  const analyticsProducts = [
    { id: 'qtb-home-insurance', name: 'Quote to Buy — Home Insurance' },
    { id: 'my-account', name: 'My Account — Policy Management' },
    { id: 'claims', name: 'Claims' },
    { id: 'renewals', name: 'Renewals' },
  ].filter(p => analytics?.[p.id])

  return (
    <div className="bench-page">
      <div className="bench-page-hero">
        <h1 className="bench-page-heading">Metrics Dashboard</h1>
        <p className="bench-page-subheading">
          All product and journey metrics in one place — UX benchmarking, member research, and analytics.
          Three data sources, one view.
        </p>
      </div>

      {/* ── Section 1: Member Research ──────────────────────── */}
      <div className="bench-page-section" style={{ paddingTop: 24 }}>
        <SectionHeader
          color="#0052CC"
          icon="◉"
          label="Member Research Metrics"
          count={memberResearch ? Object.keys(memberResearch).length + (insuranceNps ? 1 : 0) : 0}
        />
        <div style={{ fontSize: 11, color: '#5E6C84', marginBottom: 16 }}>
          Organisation-wide member sentiment metrics. Source: Qualtrics quarterly surveys.
        </div>
        <div className="metrics-dash-grid metrics-dash-grid--blue">
          {memberResearch && Object.entries(memberResearch).map(([key, metric]) => (
            <MemberResearchCard
              key={key}
              metric={metric}
              label={key.toUpperCase()}
            />
          ))}
          {insuranceNps && (
            <MemberResearchCard metric={insuranceNps} label="Insurance NPS" />
          )}
        </div>
      </div>

      {/* ── Section 2: UX Benchmarking ──────────────────────── */}
      <div className="bench-page-section" style={{ paddingTop: 28 }}>
        <SectionHeader
          color="#ea8600"
          icon="▣"
          label="UX Benchmarking"
          count={products.length}
        />
        <div style={{ fontSize: 11, color: '#5E6C84', marginBottom: 16 }}>
          Quantitative usability benchmarks across digital products. Source: UserTesting.com, uploaded via Claude Code.
        </div>

        <StatCallout methodology={methodology} />

        <div className="metrics-dash-grid metrics-dash-grid--amber" style={{ marginTop: 16 }}>
          {products.map(p => <UXProductCard key={p.id} product={p} />)}
        </div>
      </div>

      {/* ── Section 3: Analytics Overview ───────────────────── */}
      {analyticsProducts.length > 0 && (
        <div className="bench-page-section" style={{ paddingTop: 28 }}>
          <SectionHeader
            color="#00897B"
            icon="▤"
            label="Analytics Overview"
            count={analyticsProducts.length}
          />
          <div style={{ fontSize: 11, color: '#5E6C84', marginBottom: 16 }}>
            Stage-level digital analytics across products. Source: Google Analytics.
          </div>
          <div className="metrics-dash-grid metrics-dash-grid--teal">
            {analyticsProducts.map(p => (
              <AnalyticsProductCard
                key={p.id}
                productId={p.id}
                productData={analytics[p.id]}
                productName={p.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Methodology ─────────────────────────────────────── */}
      <div className="bench-page-section" style={{ paddingTop: 28, paddingBottom: 28 }}>
        <button
          className="bench-methodology-toggle"
          onClick={() => setMethodologyOpen(o => !o)}
        >
          <span>Methodology &amp; rules</span>
          <span className="bench-methodology-chevron">{methodologyOpen ? '▾' : '▸'}</span>
        </button>
        {methodologyOpen && (
          <div className="bench-methodology-body">
            <div className="bench-methodology-block">
              <h3 className="bench-methodology-heading">UX Benchmarking rules</h3>
              <ul className="bench-methodology-list">
                {methodology.uxBenchmarking.rules.map((rule, i) => <li key={i}>{rule}</li>)}
              </ul>
            </div>
            <div className="bench-methodology-block">
              <h3 className="bench-methodology-heading">Metrics</h3>
              {Object.entries(methodology.uxBenchmarking.metrics).map(([key, m]) => (
                <div key={key} className="bench-methodology-metric-row">
                  <strong>{m.name}</strong> ({m.unit}) — {m.description}. Good = {m.good}.
                </div>
              ))}
            </div>
            <div className="bench-methodology-block">
              <h3 className="bench-methodology-heading">Chrome scanning</h3>
              <p>{methodology.chromeScanning.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
