import React from 'react'
import { useParams } from 'react-router-dom'
import { useData } from '../App.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'
import StageCard from '../components/StageCard.jsx'
import InsightCard from '../components/InsightCard.jsx'

const EMOTION_COLOURS = {
  1: '#8a2020',
  2: '#7a5200',
  3: '#72706a',
  4: 'rgba(10, 107, 84, 0.6)',
  5: '#0a6b54',
}

function EmotionChart({ stages }) {
  const sorted = [...stages].sort((a, b) => a.order - b.order)
  const W = Math.max(sorted.length * 160, 400)
  const H = 160
  const PAD = { top: 20, right: 40, bottom: 48, left: 40 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const xStep = chartW / Math.max(sorted.length - 1, 1)
  const yScale = score => chartH - ((score - 1) / 4) * chartH

  const points = sorted.map((stage, i) => ({
    x: PAD.left + i * xStep,
    y: PAD.top + yScale(stage.emotions?.score ?? 3),
    score: stage.emotions?.score ?? 3,
    label: stage.name,
    colour: EMOTION_COLOURS[stage.emotions?.score ?? 3],
  }))

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
    .join(' ')

  return (
    <div className="emotion-chart-wrap">
      <div className="emotion-chart-title">Emotion Journey</div>
      <svg
        width={W}
        height={H}
        style={{ display: 'block', minWidth: W }}
        aria-label="Emotion journey line chart"
      >
        {[1, 2, 3, 4, 5].map(score => {
          const y = PAD.top + yScale(score)
          return (
            <g key={score}>
              <line
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                stroke="#e8e4d8"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={9}
                fill="var(--color-text-muted)"
                fontFamily="JetBrains Mono, monospace"
              >
                {score}
              </text>
            </g>
          )
        })}

        <path
          d={pathD}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={7} fill={p.colour} />
            <text
              x={p.x}
              y={H - 6}
              textAnchor="middle"
              fontSize={10}
              fill="var(--color-text-muted)"
              fontFamily="DM Sans, sans-serif"
            >
              {p.label.length > 16 ? p.label.slice(0, 15) + '…' : p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export default function JourneyMap() {
  const { journeyId } = useParams()
  const { index, journeys } = useData()

  const journey = journeys[journeyId]

  const hierarchy = index?.hierarchy || []
  const parentNode = hierarchy.find(top =>
    top.children?.some(c => c.id === journeyId)
  )

  if (!journey) {
    const childNode = hierarchy
      .flatMap(top => top.children || [])
      .find(c => c.id === journeyId)

    return (
      <div className="page-container">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: parentNode?.name || 'Journey', href: '/' },
            { label: childNode?.name || journeyId },
          ]}
        />
        <div className="no-data-state">
          <strong>No data yet</strong>
          This journey hasn't been mapped yet. Add a JSON file to{' '}
          <code>public/data/journeys/{journeyId}.json</code> to get started.
        </div>
      </div>
    )
  }

  const stages = (journey.stages || []).sort((a, b) => a.order - b.order)
  const insights = journey.insights || []
  const useScrollRow = stages.length <= 4

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    parentNode ? { label: parentNode.name, href: '/' } : null,
    { label: journey.name },
  ].filter(Boolean)

  return (
    <div className="page-container">
      <Breadcrumb items={breadcrumbItems} />

      <div className="metadata-bar">
        <div className="metadata-item">
          <span className="metadata-label">Owner</span>
          <span className="metadata-value">{journey.owner}</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">Status</span>
          <span className={`status-badge ${journey.status}`}>{journey.status}</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">Updated</span>
          <span className="metadata-value">{journey.lastUpdated}</span>
        </div>
      </div>

      <h1 className="page-heading" style={{ marginBottom: 12 }}>{journey.name}</h1>

      {journey.summary && (
        <div className="journey-summary">{journey.summary}</div>
      )}

      <div className="section">
        <h2 className="section-heading">
          Journey Stages
          <span className="count-badge">{stages.length}</span>
        </h2>

        {useScrollRow ? (
          <div className="stages-scroll-row">
            {stages.map(stage => (
              <StageCard key={stage.id} stage={stage} />
            ))}
          </div>
        ) : (
          <div className="stages-stack">
            {stages.map(stage => (
              <StageCard key={stage.id} stage={stage} />
            ))}
          </div>
        )}
      </div>

      {stages.length > 0 && <EmotionChart stages={stages} />}

      {insights.length > 0 && (
        <div className="section">
          <h2 className="section-heading">
            Insights
            <span className="count-badge">{insights.length}</span>
          </h2>
          <div className="insights-grid">
            {insights.map(insight => (
              <InsightCard key={insight.id} insight={insight} stages={stages} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
