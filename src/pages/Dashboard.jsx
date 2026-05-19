import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../App.jsx'

export default function Dashboard() {
  const { index, journeys } = useData()

  const hierarchy = index?.hierarchy || []
  const metadata = index?.metadata || {}

  const journeyCount = Object.keys(journeys).length
  const insightCount = metadata.totalInsights ?? 0
  const stageCount = Object.values(journeys).reduce((acc, j) => acc + (j.stages?.length ?? 0), 0)

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div className="page-heading">Journey Management</div>
        <div className="page-subheading">Overview of all customer journeys and insights</div>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-card-number">{metadata.totalJourneys ?? journeyCount}</div>
          <div className="stat-card-label">Journeys</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-number">{insightCount}</div>
          <div className="stat-card-label">Insights</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-number">{stageCount}</div>
          <div className="stat-card-label">Stages mapped</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-number">{journeyCount}</div>
          <div className="stat-card-label">With data</div>
        </div>
      </div>

      {hierarchy.map(top => (
        <div key={top.id} className="journey-hierarchy-block">
          <Link to={`/journey/${top.id}`} className="journey-hierarchy-header" style={{ display: 'flex', textDecoration: 'none' }}>
            <div style={{ flex: 1 }}>
              <div className="journey-hierarchy-name">{top.name}</div>
              {top.description && (
                <div className="journey-hierarchy-desc">{top.description}</div>
              )}
            </div>
            {top.owner && (
              <div className="journey-hierarchy-owner">{top.owner}</div>
            )}
          </Link>

          <div className="journey-children-grid">
            {(top.children || []).map(child => {
              const hasData = !!journeys[child.id]
              return hasData ? (
                <Link
                  key={child.id}
                  to={`/journey/${child.id}`}
                  className="journey-child-card"
                >
                  <div className="journey-child-name">{child.name}</div>
                  <div className="journey-child-tag has-data">
                    {journeys[child.id].stages?.length ?? 0} stages · has data
                  </div>
                </Link>
              ) : (
                <div key={child.id} className="journey-child-card no-data">
                  <div className="journey-child-name">{child.name}</div>
                  <div className="journey-child-tag">no data yet</div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {metadata.lastUpdated && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
          Last updated {metadata.lastUpdated}
        </div>
      )}
    </div>
  )
}
