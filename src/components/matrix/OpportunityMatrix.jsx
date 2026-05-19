import React, { useState } from 'react'
import ScatterPlot from './ScatterPlot.jsx'

function simpleHash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h)
}

const STATUS_CYCLE = ['open', 'validated', 'in-progress', 'open', 'solved', 'open']

export function deriveOpportunitiesFromJourney(journey) {
  const opps = []
  let idx = 0
  ;(journey.stages || []).forEach(stage => {
    ;(stage.opportunities || []).forEach(text => {
      opps.push({
        id: `${journey.id}-${stage.id}-${idx}`,
        title: text,
        status: STATUS_CYCLE[idx % STATUS_CYCLE.length],
        businessValue: 20 + (simpleHash(text + 'bv') % 70),
        customerValue: 20 + (simpleHash(text + 'cv') % 70),
        stepsLinked: 1 + (idx % 3),
        score: 30 + (simpleHash(text) % 60),
        stageName: stage.name,
        journeyName: journey.name,
      })
      idx++
    })
  })
  return opps
}

export default function OpportunityMatrix({ journey, allJourneys }) {
  const [xAxis] = useState('businessValue')
  const [yAxis] = useState('customerValue')

  const opportunities = journey
    ? deriveOpportunitiesFromJourney(journey)
    : Object.values(allJourneys || {}).flatMap(j => deriveOpportunitiesFromJourney(j))

  return (
    <div className="matrix-view">
      {/* Controls bar */}
      <div className="matrix-controls">
        <div className="matrix-controls-left">
          <div className="matrix-axis-dropdown">
            <span className="matrix-dd-icon">✏</span>
            Customer Value
            <span className="matrix-dd-chevron">▾</span>
          </div>
          <span className="matrix-controls-sep">›</span>
          <div className="matrix-axis-dropdown">
            <span className="matrix-dd-icon">✏</span>
            Business Value
            <span className="matrix-dd-chevron">▾</span>
          </div>
          <span className="matrix-controls-sep">›</span>
          <div className="matrix-axis-dropdown">
            <span className="matrix-dd-icon">✏</span>
            Default
            <span className="matrix-dd-chevron">▾</span>
          </div>
          <span className="matrix-controls-sep">›</span>
          <div className="matrix-axis-dropdown">
            <span className="matrix-dd-icon">✏</span>
            By steps linked
            <span className="matrix-dd-chevron">▾</span>
          </div>
        </div>
        <div className="matrix-controls-right">
          <button className="matrix-ghost-btn">Reset</button>
          <button className="matrix-ghost-btn">Save view ▾</button>
        </div>
      </div>

      {/* Scatter plot */}
      <ScatterPlot opportunities={opportunities} xField={xAxis} yField={yAxis} />
    </div>
  )
}
