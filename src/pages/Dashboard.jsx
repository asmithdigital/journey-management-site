import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../App.jsx'

const STATUS_DOT_COLOR = {
  validated:     '#36B37E',
  'in-progress': '#FF991F',
  discovery:     '#6554C0',
  open:          '#C1C7D0',
}

const ACCENT_COLORS = [
  '#0052CC', '#6554C0', '#36B37E', '#FF991F',
  '#00B8D9', '#FF5630', '#0747A6', '#403294',
]

function JourneyCard({ node, journeys, accent }) {
  const jData = journeys[node.id]
  const dotColor = STATUS_DOT_COLOR[jData?.status] ?? '#C1C7D0'

  const content = (
    <>
      <div className="journey-child-name-row">
        <span className="journey-child-name">{node.name}</span>
        {jData?.status && (
          <span className="journey-child-status-dot" style={{ background: dotColor }} />
        )}
      </div>
      {jData ? (
        <div className="journey-child-tag has-data">
          {jData.stages?.length ?? 0} stages · {jData.insights?.length ?? 0} insights
        </div>
      ) : (
        <div className="journey-child-tag">no data yet</div>
      )}
    </>
  )

  if (jData) {
    return <Link to={`/journey/${node.id}`} className="journey-child-card">{content}</Link>
  }
  return <div className="journey-child-card no-data">{content}</div>
}

function JourneyChildrenSection({ nodes, journeys }) {
  return nodes.map(node => {
    if (node.children && node.children.length > 0) {
      return (
        <div key={node.id} className="journey-sub-group">
          <div className="journey-sub-group-header">{node.name}</div>
          <div className="journey-children-grid journey-sub-grid">
            {node.children.map(child => (
              <JourneyCard key={child.id} node={child} journeys={journeys} />
            ))}
          </div>
        </div>
      )
    }
    return <JourneyCard key={node.id} node={node} journeys={journeys} />
  })
}

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

      {hierarchy.map((top, i) => (
        <div
          key={top.id}
          className="journey-hierarchy-block"
          style={{ borderLeft: `4px solid ${ACCENT_COLORS[i % ACCENT_COLORS.length]}` }}
        >
          <div className="journey-hierarchy-header">
            <div style={{ flex: 1 }}>
              <div className="journey-hierarchy-name">{top.name}</div>
              {top.description && (
                <div className="journey-hierarchy-desc">{top.description}</div>
              )}
            </div>
            {top.owner && (
              <div className="journey-hierarchy-owner">{top.owner}</div>
            )}
          </div>

          <div className="journey-children-grid">
            <JourneyChildrenSection nodes={top.children || []} journeys={journeys} />
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
