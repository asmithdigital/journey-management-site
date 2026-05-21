import React from 'react'
import { useData } from '../App.jsx'

const METRIC_DATA = {
  claims: {
    nps: {
      score: -12,
      series: [-15, -12, -8, -12, -10, -12],
      labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    },
  },
  'quote-to-buy': {
    nps: {
      score: 45,
      series: [38, 40, 42, 44, 43, 45],
      labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    },
    csat: {
      score: 72,
      series: [68, 70, 71, 72, 72, 72],
      labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    },
  },
}

function MiniLineChart({ series, positive }) {
  const W = 128
  const H = 44
  const PAD = 4
  const min = Math.min(...series) - 4
  const max = Math.max(...series) + 4
  const range = max - min || 1
  const pts = series.map((v, i) => {
    const x = PAD + (i / (series.length - 1)) * (W - PAD * 2)
    const y = PAD + ((max - v) / range) * (H - PAD * 2)
    return [x, y]
  })
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const color = positive ? '#36B37E' : '#FF5630'

  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={2.5} fill={color} />
      ))}
    </svg>
  )
}

function MetricCard({ journeyName, metricType, data }) {
  if (!data) {
    return (
      <div className="global-metric-card no-data">
        <div className="global-metric-card-journey">{journeyName}</div>
        <div className="global-metric-card-nodata">No data</div>
      </div>
    )
  }

  const { score, series } = data
  const isNPS = metricType === 'nps'
  const positive = isNPS ? score >= 0 : score >= 60
  const scoreLabel = isNPS && score > 0 ? `+${score}` : String(score)

  return (
    <div className={`global-metric-card${positive ? ' positive' : ' negative'}`}>
      <div className="global-metric-card-journey">{journeyName}</div>
      <div className="global-metric-card-score" style={{ color: positive ? '#36B37E' : '#FF5630' }}>
        {scoreLabel}
      </div>
      <MiniLineChart series={series} positive={positive} />
    </div>
  )
}

function MetricSection({ title, metricKey, journeyList }) {
  return (
    <div className="global-metric-section">
      <div className="global-metric-section-label">{title}</div>
      <div className="global-metric-cards">
        {journeyList.map(({ journeyId, journeyName }) => (
          <MetricCard
            key={journeyId}
            journeyName={journeyName}
            metricType={metricKey}
            data={METRIC_DATA[journeyId]?.[metricKey] ?? null}
          />
        ))}
      </div>
    </div>
  )
}

export default function GlobalMetrics() {
  const { journeys } = useData()
  const journeyList = Object.entries(journeys).map(([id, j]) => ({
    journeyId: id,
    journeyName: j.name || id,
  }))

  return (
    <div className="global-page">
      <div className="global-page-header">
        <div className="page-heading">Metrics</div>
        <div className="page-subheading">Aggregate metrics across all journeys</div>
      </div>

      <MetricSection title="Net Promoter Score (NPS)" metricKey="nps" journeyList={journeyList} />
      <MetricSection title="Customer Satisfaction (CSAT)" metricKey="csat" journeyList={journeyList} />
    </div>
  )
}
