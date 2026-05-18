import React, { useState } from 'react'
import { useData } from '../App.jsx'
import SeverityBadge from '../components/SeverityBadge.jsx'

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 }

export default function OpportunityMatrix() {
  const { journeys } = useData()
  const [filterJourney, setFilterJourney] = useState('all')
  const [filterType, setFilterType] = useState('both')
  const [selectedRow, setSelectedRow] = useState(null)

  const allRows = []

  Object.values(journeys).forEach(journey => {
    ;(journey.stages || []).forEach(stage => {
      if (filterType !== 'opportunities') {
        ;(stage.painPoints || []).forEach(text => {
          allRows.push({
            id: `${journey.id}-${stage.id}-pain-${text.slice(0, 20)}`,
            text,
            type: 'pain-point',
            journeyId: journey.id,
            journeyName: journey.name,
            stageName: stage.name,
            severity: deriveSeverity(text, journey.insights, stage.id),
          })
        })
      }
      if (filterType !== 'pain-points') {
        ;(stage.opportunities || []).forEach(text => {
          allRows.push({
            id: `${journey.id}-${stage.id}-opp-${text.slice(0, 20)}`,
            text,
            type: 'opportunity',
            journeyId: journey.id,
            journeyName: journey.name,
            stageName: stage.name,
            severity: 'medium',
          })
        })
      }
    })
  })

  function deriveSeverity(text, insights, stageId) {
    const stageInsights = (insights || []).filter(i => i.stage === stageId)
    if (stageInsights.some(i => i.severity === 'high')) return 'high'
    if (stageInsights.some(i => i.severity === 'medium')) return 'medium'
    return 'low'
  }

  const filtered = allRows
    .filter(r => filterJourney === 'all' || r.journeyId === filterJourney)
    .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 2) - (SEVERITY_ORDER[b.severity] ?? 2))

  const journeyOptions = Object.values(journeys)

  return (
    <div className="page-container">
      <h1 className="page-heading">Opportunity Matrix</h1>
      <p className="page-subheading">
        All pain points and opportunities across every journey, sorted by severity.
      </p>

      <div className="filter-bar">
        <select
          className="filter-select"
          value={filterJourney}
          onChange={e => setFilterJourney(e.target.value)}
          aria-label="Filter by journey"
        >
          <option value="all">All Journeys</option>
          {journeyOptions.map(j => (
            <option key={j.id} value={j.id}>{j.name}</option>
          ))}
        </select>

        <div className="toggle-group" role="group" aria-label="Filter by type">
          {[
            { value: 'both', label: 'Both' },
            { value: 'pain-points', label: 'Pain Points' },
            { value: 'opportunities', label: 'Opportunities' },
          ].map(opt => (
            <button
              key={opt.value}
              className={`toggle-btn${filterType === opt.value ? ' active' : ''}`}
              onClick={() => setFilterType(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {filtered.length} items
        </span>
      </div>

      <div className="matrix-table-wrap">
        <table className="matrix-table">
          <thead>
            <tr>
              <th style={{ width: '45%' }}>Item</th>
              <th>Type</th>
              <th>Journey</th>
              <th>Stage</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '32px 16px' }}>
                  No items match the current filters.
                </td>
              </tr>
            )}
            {filtered.map(row => (
              <tr
                key={row.id}
                className={selectedRow === row.id ? 'selected' : ''}
                onClick={() => setSelectedRow(selectedRow === row.id ? null : row.id)}
              >
                <td>{row.text}</td>
                <td>
                  <span className={`type-tag ${row.type}`}>
                    {row.type === 'pain-point' ? 'Pain Point' : 'Opportunity'}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  {row.journeyName}
                </td>
                <td className="stage-cell">{row.stageName}</td>
                <td>
                  <SeverityBadge severity={row.severity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
