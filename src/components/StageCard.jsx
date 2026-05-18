import React from 'react'

const EMOTION_COLOURS = {
  1: '#8a2020',
  2: '#7a5200',
  3: '#72706a',
  4: 'rgba(10, 107, 84, 0.6)',
  5: '#0a6b54',
}

export default function StageCard({ stage }) {
  const emotionColour = EMOTION_COLOURS[stage.emotions?.score] || EMOTION_COLOURS[3]

  return (
    <div className="stage-card">
      <div className="stage-card-header">
        <div className="stage-card-name">{stage.name}</div>
        <div className="stage-order-label mono">#{stage.order}</div>
      </div>

      <div className="stage-card-body">
        {stage.touchpoints?.length > 0 && (
          <div>
            <div className="stage-section-label">Touchpoints</div>
            <div className="touchpoints-row">
              {stage.touchpoints.map((tp, i) => (
                <span key={i} className="touchpoint-pill">{tp}</span>
              ))}
            </div>
          </div>
        )}

        {stage.actions?.length > 0 && (
          <div>
            <div className="stage-section-label">Actions</div>
            <ul className="stage-list">
              {stage.actions.map((a, i) => (
                <li key={i} className="stage-list-item">{a}</li>
              ))}
            </ul>
          </div>
        )}

        {stage.thoughts?.length > 0 && (
          <div>
            <div className="stage-section-label">Thoughts</div>
            <ul className="stage-list">
              {stage.thoughts.map((t, i) => (
                <li key={i} className="stage-list-item italic">{t}</li>
              ))}
            </ul>
          </div>
        )}

        {stage.emotions && (
          <div>
            <div className="stage-section-label">Emotion</div>
            <div className="emotion-indicator">
              <span
                className="emotion-dot"
                style={{ backgroundColor: emotionColour }}
                aria-hidden="true"
              />
              <span className="emotion-label">{stage.emotions.label}</span>
              <span className="emotion-score mono">{stage.emotions.score}/5</span>
            </div>
          </div>
        )}

        {stage.painPoints?.length > 0 && (
          <div>
            <div className="stage-section-label">Pain Points</div>
            {stage.painPoints.map((p, i) => (
              <div key={i} className="pain-point-item">{p}</div>
            ))}
          </div>
        )}

        {stage.opportunities?.length > 0 && (
          <div>
            <div className="stage-section-label">Opportunities</div>
            {stage.opportunities.map((o, i) => (
              <div key={i} className="opportunity-item">{o}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
