import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../App.jsx'
import TopBar from '../components/layout/TopBar.jsx'
import TabNav from '../components/shared/TabNav.jsx'
import JourneyMapView from '../components/journey/JourneyMapView.jsx'
import OpportunityMatrix from '../components/matrix/OpportunityMatrix.jsx'

function findAncestors(nodes, targetId, acc = []) {
  for (const node of nodes) {
    if (node.id === targetId) return acc
    if (node.children) {
      const result = findAncestors(node.children, targetId, [...acc, node])
      if (result !== null) return result
    }
  }
  return null
}

function findNode(nodes, targetId) {
  for (const node of nodes) {
    if (node.id === targetId) return node
    if (node.children) {
      const found = findNode(node.children, targetId)
      if (found) return found
    }
  }
  return null
}

function normalisePainPoint(pp, stageId, index) {
  if (typeof pp === 'string') {
    return { id: `${stageId}-pain-${index}`, text: pp, type: 'pain', severity: 'high', stageName: null }
  }
  return {
    id: pp.id, text: pp.description,
    source: pp.source, evidenceCount: pp.evidenceCount,
    type: pp.severity === 'high' ? 'pain' : pp.severity === 'medium' ? 'need' : 'gain',
    severity: pp.severity,
  }
}

/* ─── Insight detail panel ─────────────────────────────────────── */

function InsightDetailPanel({ item, onClose }) {
  if (!item) return null
  const TYPE_BADGE = {
    pain:        { background: '#FF5630', color: 'white' },
    need:        { background: '#0052CC', color: 'white' },
    gain:        { background: '#36B37E', color: 'white' },
    observation: { background: '#6554C0', color: 'white' },
  }
  const badge = TYPE_BADGE[item.type] ?? { background: '#5E6C84', color: 'white' }
  const typeLabel = item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Insight'

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <span className="insight-tag" style={{ ...badge, marginRight: 8, flexShrink: 0 }}>
            {typeLabel}
          </span>
          <div className="drawer-title" style={{ flex: 1 }}>{item.text}</div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        <div className="drawer-body">
          <div className="drawer-section">
            <div className="drawer-section-label">Full text</div>
            <div className="drawer-section-content" style={{ lineHeight: 1.7 }}>{item.text}</div>
          </div>
          {item.severity && (
            <div className="drawer-section">
              <div className="drawer-section-label">Severity</div>
              <div className="drawer-section-content">
                <span className={`insight-tag ${item.severity}`}>{item.severity}</span>
              </div>
            </div>
          )}
          {item.source && (
            <div className="drawer-section">
              <div className="drawer-section-label">Source</div>
              <div className="drawer-section-content">{item.source}</div>
            </div>
          )}
          {item.evidenceCount && (
            <div className="drawer-section">
              <div className="drawer-section-label">Evidence</div>
              <div className="drawer-section-content">{item.evidenceCount} sources</div>
            </div>
          )}
          {item.stageName && (
            <div className="drawer-section">
              <div className="drawer-section-label">Stage</div>
              <div className="drawer-section-content">{item.stageName}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Insights tab — table list (Fix 3) ────────────────────────── */

const TYPE_DOT_COLOR = {
  pain:        '#FF5630',
  need:        '#0052CC',
  gain:        '#36B37E',
  observation: '#6554C0',
}

function InsightsTab({ journey }) {
  const [selected, setSelected] = useState(null)

  const stages = [...(journey.stages || [])].sort((a, b) => a.order - b.order)
  const insights = journey.insights || []

  const allInsights = [
    ...insights.map(ins => ({
      ...ins,
      text: ins.description ?? ins.text,
      type: ins.severity === 'high' ? 'pain' : ins.severity === 'medium' ? 'need' : 'gain',
    })),
    ...stages.flatMap(stage =>
      (stage.painPoints || []).map((pp, i) => ({
        ...normalisePainPoint(pp, stage.id, i),
        stageName: stage.name,
      }))
    ),
  ]

  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {allInsights.length === 0 ? (
        <div style={{ padding: '24px 20px', fontSize: 13, color: 'var(--text-muted)' }}>
          No insights available for this journey.
        </div>
      ) : (
        <div className="insights-list-wrap">
          <div className="insights-list-header">
            <span className="ilc-dot" />
            <span className="ilc-text">Insight</span>
            <span className="ilc-sev">Severity</span>
            <span className="ilc-src">Source</span>
            <span className="ilc-ev">Evidence</span>
          </div>
          {allInsights.map(ins => (
            <div
              key={ins.id}
              className="insights-list-row"
              onClick={() => setSelected(ins)}
            >
              <span className="ilc-dot">
                <span
                  className="insights-type-dot"
                  style={{ background: TYPE_DOT_COLOR[ins.type] ?? '#C1C7D0' }}
                />
              </span>
              <span className="ilc-text insights-list-text">{ins.text}</span>
              <span className="ilc-sev">
                {ins.severity && (
                  <span className={`insight-tag ${ins.severity}`} style={{ fontSize: 10 }}>
                    {ins.severity}
                  </span>
                )}
              </span>
              <span className="ilc-src insights-list-meta">{ins.source ?? '—'}</span>
              <span className="ilc-ev insights-list-meta">
                {ins.evidenceCount ? `${ins.evidenceCount} src` : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
      {selected && <InsightDetailPanel item={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

/* ─── Changelog tab ────────────────────────────────────────────── */

function ChangelogTab({ journey }) {
  const entries = [...(journey.changelog || [])].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div style={{ padding: '16px 20px', overflow: 'auto', flex: 1 }}>
      {entries.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No changelog entries yet.</div>
      )}
      <div className="changelog-entries">
        {entries.map((entry, i) => (
          <div key={i} className="changelog-entry">
            <div className="changelog-entry-date">
              {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-AU', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </div>
            <div className="changelog-entry-body">
              <div className="changelog-entry-top">
                <span className={`changelog-type-badge changelog-type-${entry.type}`}>{entry.type}</span>
              </div>
              <div className="changelog-entry-desc">{entry.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Placeholder tab ──────────────────────────────────────────── */

function PlaceholderTab({ label }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{label} view coming soon</span>
    </div>
  )
}

/* ─── Parent Journey View ──────────────────────────────────────── */

const STATUS_DOT_COLORS = {
  validated:     '#36B37E',
  'in-progress': '#FF991F',
  discovery:     '#6554C0',
  open:          '#C1C7D0',
}

function ParentChildCard({ node, journeys }) {
  const jData = journeys[node.id]
  const dotColor = STATUS_DOT_COLORS[jData?.status] ?? '#C1C7D0'

  const content = (
    <>
      <div className="parent-child-card-name">
        {node.name}
        {jData?.status && (
          <span className="parent-child-status-dot" style={{ background: dotColor }} />
        )}
      </div>
      {jData ? (
        <div className="parent-child-card-meta">
          {jData.stages?.length ?? 0} stages · {jData.insights?.length ?? 0} insights
        </div>
      ) : (
        <div className="parent-child-card-meta" style={{ color: '#C1C7D0' }}>No data yet</div>
      )}
      {jData?.status && (
        <span className={`status-tag ${jData.status}`} style={{ fontSize: 10, marginTop: 4, cursor: 'default' }}>
          {jData.status === 'in-progress' ? 'In Progress' : jData.status.charAt(0).toUpperCase() + jData.status.slice(1)}
        </span>
      )}
    </>
  )

  if (jData) {
    return <Link to={`/journey/${node.id}`} className="parent-child-card">{content}</Link>
  }
  return <div className="parent-child-card no-data">{content}</div>
}

function ParentChildGroup({ node, journeys }) {
  if (node.children && node.children.length > 0) {
    return (
      <div className="parent-child-group">
        <div className="parent-child-group-label">{node.name}</div>
        <div className="parent-child-grid">
          {node.children.map(child => (
            <ParentChildCard key={child.id} node={child} journeys={journeys} />
          ))}
        </div>
      </div>
    )
  }
  return <ParentChildCard node={node} journeys={journeys} />
}

function ParentJourneyView({ hierarchyNode, journeys, ancestors }) {
  const children = hierarchyNode.children || []
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar journey={{ name: hierarchyNode.name }} ancestors={ancestors} />
      <div className="parent-journey-view">
        <div className="parent-journey-header">
          <div className="parent-journey-name">{hierarchyNode.name}</div>
          {hierarchyNode.description && (
            <div className="parent-journey-desc">{hierarchyNode.description}</div>
          )}
          {hierarchyNode.owner && (
            <div className="parent-journey-owner">Owner: {hierarchyNode.owner}</div>
          )}
        </div>
        <div className="parent-journey-section-label">Nested Journeys</div>
        <div className="parent-top-grid">
          {children.map(child => (
            <ParentChildGroup key={child.id} node={child} journeys={journeys} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Main JourneyMap page ─────────────────────────────────────── */

export default function JourneyMap() {
  const { journeyId } = useParams()
  const { index, journeys } = useData()

  const [activeTab, setActiveTab] = useState('journey')
  const [typeFilters, setTypeFilters] = useState(new Set(['all']))
  const [severityFilters, setSeverityFilters] = useState(new Set())

  const journey = journeys[journeyId]
  const hierarchy = index?.hierarchy || []
  const ancestors = findAncestors(hierarchy, journeyId) ?? []
  const hierarchyNode = findNode(hierarchy, journeyId)

  const childJourneys = useMemo(() =>
    (hierarchyNode?.children || []).map(child => ({
      id: child.id,
      name: child.name,
      status: journeys[child.id]?.status,
      stagesCount: journeys[child.id]?.stages?.length ?? 0,
      insightsCount: journeys[child.id]?.insights?.length ?? 0,
      hasData: !!journeys[child.id],
    })),
  [hierarchyNode, journeys])

  const insightCount = useMemo(() => {
    if (!journey) return null
    const isFiltered = !typeFilters.has('all') || severityFilters.size > 0
    if (!isFiltered) return null
    const stages = [...(journey.stages || [])].sort((a, b) => a.order - b.order)
    const allIns = [
      ...(journey.insights || []).map(ins => ({
        type: ins.severity === 'high' ? 'pain' : ins.severity === 'medium' ? 'need' : 'gain',
        severity: ins.severity,
      })),
      ...stages.flatMap(stage =>
        (stage.painPoints || []).map(pp => ({
          type: typeof pp === 'string' ? 'pain' : (pp.severity === 'high' ? 'pain' : pp.severity === 'medium' ? 'need' : 'gain'),
          severity: typeof pp === 'string' ? 'high' : pp.severity,
        }))
      ),
    ]
    return allIns.filter(ins => {
      const typeOK = typeFilters.has('all') || typeFilters.has(ins.type)
      const sevOK = severityFilters.size === 0 || severityFilters.has(ins.severity ?? 'medium')
      return typeOK && sevOK
    }).length
  }, [journey, typeFilters, severityFilters])

  const oppCount = useMemo(() => {
    if (!journey) return null
    const isFiltered = !typeFilters.has('all') || severityFilters.size > 0
    if (!isFiltered) return null
    if (!typeFilters.has('all') && !typeFilters.has('opportunities')) return 0
    return [...(journey.stages || [])].reduce((acc, s) => acc + (s.opportunities || []).length, 0)
  }, [journey, typeFilters, severityFilters])

  // Conditional returns after all hooks
  if (!journey && hierarchyNode?.children?.length > 0) {
    return (
      <ParentJourneyView
        hierarchyNode={hierarchyNode}
        journeys={journeys}
        ancestors={ancestors}
      />
    )
  }

  if (!journey) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar
          journey={{ name: hierarchyNode?.name ?? journeyId }}
          ancestors={ancestors}
        />
        <div className="no-data-page">
          <h2>No data yet</h2>
          <p>Add a JSON file at <code>public/data/journeys/{journeyId}.json</code> to get started.</p>
        </div>
      </div>
    )
  }

  function toggleTypeFilter(type) {
    if (type === 'all') {
      setTypeFilters(new Set(['all']))
      return
    }
    setTypeFilters(prev => {
      const next = new Set(prev)
      next.delete('all')
      if (next.has(type)) {
        next.delete(type)
        if (next.size === 0) next.add('all')
      } else {
        next.add(type)
      }
      return next
    })
  }

  function toggleSeverityFilter(sev) {
    setSeverityFilters(prev => {
      const next = new Set(prev)
      if (next.has(sev)) next.delete(sev)
      else next.add(sev)
      return next
    })
  }

  const filterProps = activeTab === 'journey'
    ? { typeFilters, severityFilters, onTypeToggle: toggleTypeFilter, onSeverityToggle: toggleSeverityFilter }
    : null

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar journey={journey} ancestors={ancestors} />
      <TabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        insightCount={insightCount}
        oppCount={oppCount}
        filterProps={filterProps}
      />
      <div className="journey-view-content">
        {activeTab === 'journey' && (
          <JourneyMapView
            journey={journey}
            filters={{ typeFilters, severityFilters }}
            onTabChange={setActiveTab}
            childJourneys={childJourneys}
          />
        )}
        {activeTab === 'insights' && <InsightsTab journey={journey} />}
        {activeTab === 'opportunities' && <OpportunityMatrix journey={journey} />}
        {activeTab === 'solutions' && <PlaceholderTab label="Solutions" />}
        {activeTab === 'metrics' && <PlaceholderTab label="Metrics" />}
        {activeTab === 'changelog' && <ChangelogTab journey={journey} />}
      </div>
    </div>
  )
}
