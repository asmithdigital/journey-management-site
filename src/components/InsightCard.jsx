import React from 'react'
import SeverityBadge from './SeverityBadge.jsx'

export default function InsightCard({ insight, stages }) {
  const stage = stages?.find(s => s.id === insight.stage)

  return (
    <div className="insight-card">
      <div className="insight-card-top">
        {stage && (
          <span className="insight-stage-tag">{stage.name}</span>
        )}
        <SeverityBadge severity={insight.severity} />
      </div>
      <p className="insight-text">{insight.text}</p>
      <div className="insight-footer">
        <span className="insight-source">{insight.source}</span>
        {insight.recurrence != null && insight.totalParticipants != null && (
          <span className="insight-recurrence mono">
            {insight.recurrence}/{insight.totalParticipants} participants
          </span>
        )}
      </div>
    </div>
  )
}
