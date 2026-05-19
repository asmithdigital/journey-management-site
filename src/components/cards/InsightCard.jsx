import React from 'react'

export default function InsightCard({ insight, onClick }) {
  const { text, type, severity, source, recurrence, totalParticipants } = insight

  const tagType = type ?? (severity === 'high' ? 'pain' : severity === 'medium' ? 'need' : 'gain')
  const tagLabel = {
    pain: 'Pain',
    need: 'Need',
    gain: 'Gain',
    observation: 'Observation',
    high: 'Pain',
    medium: 'Need',
    low: 'Gain',
  }[tagType] ?? 'Insight'

  const linkedCount = recurrence && totalParticipants
    ? `${recurrence}:${totalParticipants}`
    : null

  return (
    <div className="insight-card" onClick={onClick}>
      <div className="insight-card-top">
        <span className={`insight-tag ${tagType}`}>{tagLabel} ▾</span>
        {linkedCount && (
          <span className="insight-link-badge">
            <span style={{ opacity: 0.5 }}>⛓</span> {linkedCount}
          </span>
        )}
        <div className="insight-card-actions">
          <button className="card-icon-btn" onClick={e => e.stopPropagation()}>···</button>
        </div>
      </div>

      <div className="insight-card-text">{text}</div>

      {source && (
        <div className="insight-card-footer">
          <span style={{ opacity: 0.6 }}>◷</span>
          <span>{source}</span>
        </div>
      )}
    </div>
  )
}
