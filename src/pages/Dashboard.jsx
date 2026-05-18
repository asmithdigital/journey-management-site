import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../App.jsx'

export default function Dashboard() {
  const { index, journeys } = useData()

  const metadata = index?.metadata || {}
  const hierarchy = index?.hierarchy || []

  const highSeverityCount = Object.values(journeys).reduce((total, journey) => {
    return total + (journey.insights || []).filter(i => i.severity === 'high').length
  }, 0)

  const recentlyUpdated = Object.values(journeys)
    .filter(j => j.lastUpdated)
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))

  const knownJourneyIds = Object.keys(journeys)

  return (
    <div className="page-container">
      <h1 className="page-heading">Journey Management</h1>
      <p className="page-subheading">
        Insurance customer lifecycle — CX &amp; Product research library
      </p>

      <div className="stat-cards-row">
        <div className="stat-card">
          <div className="stat-card-number">{metadata.totalJourneys || '—'}</div>
          <div className="stat-card-label">Total Journeys</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-number">{metadata.totalInsights || '—'}</div>
          <div className="stat-card-label">Total Insights</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-number" style={{ color: 'var(--color-red)' }}>
            {highSeverityCount}
          </div>
          <div className="stat-card-label">High Severity Insights</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-number" style={{ fontSize: 22, paddingTop: 6 }}>
            {metadata.lastUpdated || '—'}
          </div>
          <div className="stat-card-label">Last Updated</div>
        </div>
      </div>

      <div className="section hierarchy-section">
        <h2 className="section-heading">Journey Hierarchy</h2>
        {hierarchy.map(top => (
          <div key={top.id} className="hierarchy-top">
            <div className="hierarchy-top-header">
              <div>
                <div className="hierarchy-top-name">{top.name}</div>
                <div className="hierarchy-top-desc">{top.description}</div>
              </div>
              <div className="hierarchy-top-owner">{top.owner}</div>
            </div>
            <div className="hierarchy-children">
              {(top.children || []).map(child => {
                const hasData = knownJourneyIds.includes(child.id)
                if (hasData) {
                  return (
                    <Link
                      key={child.id}
                      to={`/journey/${child.id}`}
                      className="hierarchy-child-card"
                    >
                      <div className="hierarchy-child-name">{child.name}</div>
                      <div className="hierarchy-child-tag has-data">View journey →</div>
                    </Link>
                  )
                }
                return (
                  <div key={child.id} className="hierarchy-child-card no-data">
                    <div className="hierarchy-child-name">{child.name}</div>
                    <div className="hierarchy-child-tag">No data yet</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {recentlyUpdated.length > 0 && (
        <div className="section">
          <h2 className="section-heading">Recently Updated</h2>
          <div className="recently-updated-list">
            {recentlyUpdated.map(journey => (
              <Link
                key={journey.id}
                to={`/journey/${journey.id}`}
                className="recently-updated-item"
              >
                <span className="recently-updated-name">{journey.name}</span>
                <span className="recently-updated-owner">{journey.owner}</span>
                <span className={`status-badge ${journey.status}`}>{journey.status}</span>
                <span className="recently-updated-date">{journey.lastUpdated}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
