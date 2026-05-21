import React from 'react'

const TYPE_STYLE = {
  pain:        { background: '#FFF5F5', borderLeft: '3px solid #FF5630' },
  need:        { background: '#F0F5FF', borderLeft: '3px solid #0052CC' },
  gain:        { background: '#F0FFF4', borderLeft: '3px solid #36B37E' },
  observation: { background: '#F8F5FF', borderLeft: '3px solid #6554C0' },
}

export default function InsightCard({ insight, onClick }) {
  const { description, text, type, severity, source, recurrence, totalParticipants, evidenceCount } = insight

  const displayText = description ?? text

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
    : evidenceCount
    ? `${evidenceCount} sources`
    : null

  const cardStyle = TYPE_STYLE[tagType] ?? {}

  return (
    <div className="insight-card" style={cardStyle} onClick={onClick}>
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

      <div className="insight-card-text">{displayText}</div>

      {source && (
        <div className="insight-card-footer">
          <span style={{ opacity: 0.6 }}>◷</span>
          <span>{source}</span>
        </div>
      )}
    </div>
  )
}
