import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../App.jsx'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function calcTrend(rounds, key, goodDir) {
  if (rounds.length < 2) return null
  const latest = rounds[rounds.length - 1].metrics[key]?.value
  const prev = rounds[rounds.length - 2].metrics[key]?.value
  if (latest == null || prev == null) return null
  const diff = latest - prev
  if (Math.abs(diff) < 0.01) return { arrow: '→', color: '#97A0AF' }
  const positive = goodDir === 'higher' ? diff > 0 : diff < 0
  return {
    arrow: diff > 0 ? '↑' : '↓',
    color: positive ? '#36B37E' : '#FF5630',
  }
}

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

function ProductCard({ product }) {
  const rounds = product.uxBenchmarks.rounds
  const latest = rounds[rounds.length - 1]
  const msatTrend = calcTrend(rounds, 'msat', 'higher')
  const tcTrend = calcTrend(rounds, 'taskCompletion', 'higher')
  const erTrend = calcTrend(rounds, 'errorRate', 'lower')

  return (
    <Link to={`/benchmarking/${product.id}`} className="bench-product-card">
      <div className="bench-product-top">
        <div className="bench-product-name">{product.name}</div>
        <div className="bench-product-desc">{product.description}</div>
      </div>
      <div className="bench-kpi-row">
        <div className="bench-kpi">
          <div className="bench-kpi-label">MSAT</div>
          <div className="bench-kpi-value-row">
            <span className="bench-kpi-big">{latest?.metrics.msat.value ?? '—'}</span>
            <span className="bench-kpi-unit">/5</span>
            {msatTrend && <span className="bench-kpi-arrow" style={{ color: msatTrend.color }}>{msatTrend.arrow}</span>}
          </div>
        </div>
        <div className="bench-kpi">
          <div className="bench-kpi-label">Task Completion</div>
          <div className="bench-kpi-value-row">
            <span className="bench-kpi-big">{latest?.metrics.taskCompletion.value ?? '—'}</span>
            <span className="bench-kpi-unit">%</span>
            {tcTrend && <span className="bench-kpi-arrow" style={{ color: tcTrend.color }}>{tcTrend.arrow}</span>}
          </div>
        </div>
        <div className="bench-kpi">
          <div className="bench-kpi-label">Error Rate</div>
          <div className="bench-kpi-value-row">
            <span className="bench-kpi-big">{latest?.metrics.errorRate.value ?? '—'}</span>
            <span className="bench-kpi-unit">%</span>
            {erTrend && <span className="bench-kpi-arrow" style={{ color: erTrend.color }}>{erTrend.arrow}</span>}
          </div>
        </div>
      </div>
      <div className="bench-product-footer">
        <span>{rounds.length} round{rounds.length !== 1 ? 's' : ''} · {product.chromeScans.length} scan{product.chromeScans.length !== 1 ? 's' : ''}</span>
        <span>Updated {formatDate(latest?.date)}</span>
      </div>
    </Link>
  )
}

export default function BenchmarkingDashboard() {
  const { benchmarking } = useData()
  const [methodologyOpen, setMethodologyOpen] = useState(false)

  if (!benchmarking) {
    return (
      <div className="bench-page">
        <div className="bench-page-hero">
          <h1 className="bench-page-heading">UX Benchmarking Dashboard</h1>
        </div>
        <div className="no-data-page"><h2>No benchmarking data available.</h2></div>
      </div>
    )
  }

  const { products, methodology } = benchmarking

  return (
    <div className="bench-page">
      <div className="bench-page-hero">
        <h1 className="bench-page-heading">UX Benchmarking Dashboard</h1>
        <p className="bench-page-subheading">
          Quantitative usability benchmarks and Chrome scan comparisons across digital products.
          Track longitudinal change, compare rounds, and identify UX drift.
        </p>
      </div>

      <div className="bench-page-section">
        <StatCallout methodology={methodology} />
      </div>

      <div className="bench-page-section">
        <div className="bench-section-eyebrow">Products</div>
        <div className="bench-product-grid">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>

      <div className="bench-page-section">
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
