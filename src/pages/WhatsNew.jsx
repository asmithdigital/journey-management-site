import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../App.jsx'

function TypeBadge({ type }) {
  return <span className={`changelog-type-badge changelog-type-${type}`}>{type}</span>
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function groupByMonth(entries) {
  const groups = {}
  for (const entry of entries) {
    const [year, month] = entry.date.split('-')
    const key = `${year}-${month}`
    if (!groups[key]) groups[key] = { label: formatMonthLabel(year, month), entries: [] }
    groups[key].entries.push(entry)
  }
  return Object.values(groups)
}

function formatMonthLabel(year, month) {
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
  })
}

export default function WhatsNew() {
  const { index, journeys } = useData()

  const journeyNameMap = {}
  function collectNames(nodes) {
    for (const node of nodes) {
      journeyNameMap[node.id] = node.name
      if (node.children) collectNames(node.children)
    }
  }
  collectNames(index?.hierarchy || [])

  const allEntries = []

  // Index-level changelog (no journey link)
  for (const entry of index?.changelog || []) {
    allEntries.push({ ...entry, source: 'workspace' })
  }

  // Per-journey changelogs
  for (const [id, journey] of Object.entries(journeys)) {
    for (const entry of journey.changelog || []) {
      allEntries.push({
        ...entry,
        journeyId: id,
        journeyName: journey.name || journeyNameMap[id] || id,
      })
    }
  }

  allEntries.sort((a, b) => b.date.localeCompare(a.date))

  const groups = groupByMonth(allEntries)

  return (
    <div className="whats-new-page">
      <div className="page-header">
        <div className="page-heading">What's New</div>
        <div className="page-subheading">Recent updates across all journeys and the workspace</div>
      </div>

      {groups.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 24 }}>
          No changelog entries yet.
        </div>
      )}

      {groups.map(group => (
        <div key={group.label} className="changelog-month-group">
          <div className="changelog-month-heading">{group.label}</div>
          <div className="changelog-entries">
            {group.entries.map((entry, i) => (
              <div key={i} className="changelog-entry">
                <div className="changelog-entry-date">{formatDate(entry.date)}</div>
                <div className="changelog-entry-body">
                  <div className="changelog-entry-top">
                    <TypeBadge type={entry.type} />
                    {entry.journeyId ? (
                      <Link to={`/journey/${entry.journeyId}`} className="changelog-journey-link">
                        {entry.journeyName}
                      </Link>
                    ) : (
                      <span className="changelog-workspace-label">Workspace</span>
                    )}
                  </div>
                  <div className="changelog-entry-desc">{entry.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
