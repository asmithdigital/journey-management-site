import React from 'react'

export default function OpportunityCard({ opportunity, onClick }) {
  const { title, status, score, businessValue, customerValue, impact, effort } = opportunity

  const statusLabel = {
    'open': 'Open',
    'validated': 'Validated',
    'in-progress': 'In Progress',
    'solved': 'Solved',
  }[status] ?? 'Open'

  return (
    <div
      className="opportunity-card"
      style={{ background: '#F8F5FF', borderLeft: '3px solid #6554C0' }}
      onClick={onClick}
    >
      <div className="opp-card-top">
        <span className={`status-tag ${status}`}>
          {statusLabel} <span className="tag-chevron">▾</span>
        </span>
        <div className="opp-card-actions">
          <button className="card-icon-btn" onClick={e => e.stopPropagation()} title="Open">↗</button>
          <button className="card-icon-btn" onClick={e => e.stopPropagation()} title="More">···</button>
        </div>
      </div>

      <div className="opp-card-title">{title}</div>

      {(impact || effort) && (
        <div className="opp-impact-effort">
          {impact && <span className={`impact-tag impact-${impact}`}>{impact} impact</span>}
          {effort && <span className={`effort-tag effort-${effort}`}>{effort} effort</span>}
        </div>
      )}

      <div className="opp-card-score-row">
        <div className="score-bar-track">
          <div className="score-bar-fill" style={{ width: `${score}%` }} />
        </div>
        <span className="score-pct-label">{score}%</span>
      </div>

      <div className="opp-card-meta">
        <span className="card-meta-label">Activity</span>
        <div className="card-meta-scores">
          <span className="card-meta-score">⚡ {businessValue}%</span>
          <span className="card-meta-score">◎ {customerValue}%</span>
        </div>
      </div>
    </div>
  )
}
