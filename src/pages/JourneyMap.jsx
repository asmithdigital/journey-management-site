import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../App.jsx'
import TopBar from '../components/layout/TopBar.jsx'
import TabNav from '../components/shared/TabNav.jsx'
import JourneyMapView from '../components/journey/JourneyMapView.jsx'
import OpportunityMatrix from '../components/matrix/OpportunityMatrix.jsx'
import InsightCard from '../components/cards/InsightCard.jsx'

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

/* ─── Insights tab ─────────────────────────────────────────────── */

function InsightsTab({ journey }) {
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
    <div style={{ padding: '16px 20px', overflow: 'auto', flex: 1 }}>
      {allInsights.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No insights available for this journey.</div>
      )}
      <div className="insights-tab-list">
        {allInsights.map(ins => (
          <InsightCard key={ins.id} insight={ins} />
        ))}
      </div>
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

/* ─── Filter bar (Parts 7 & 8) ─────────────────────────────────── */

const TYPE_PILLS = [
  { id: 'all', label: 'All' },
  { id: 'pain', label: 'Pain' },
  { id: 'need', label: 'Need' },
  { id: 'gain', label: 'Gain' },
  { id: 'observation', label: 'Observation' },
  { id: 'opportunities', label: 'Opportunities' },
]

const SEVERITY_PILLS = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
]

const TYPE_ACTIVE_STYLE = {
  all:           { background: '#172B4D', color: 'white', borderColor: '#172B4D' },
  pain:          { background: '#FF5630', color: 'white', borderColor: '#FF5630' },
  need:          { background: '#0052CC', color: 'white', borderColor: '#0052CC' },
  gain:          { background: '#36B37E', color: 'white', borderColor: '#36B37E' },
  observation:   { background: '#6554C0', color: 'white', borderColor: '#6554C0' },
  opportunities: { background: '#6554C0', color: 'white', borderColor: '#6554C0' },
}

const SEV_ACTIVE_STYLE = {
  high:   { background: '#FFEBE6', color: '#BF2600', borderColor: '#FFBDAD' },
  medium: { background: '#FFF0B3', color: '#5E4701', borderColor: '#FFE380' },
  low:    { background: '#E3FCEF', color: '#006644', borderColor: '#ABF5D1' },
}

function FilterBar({ typeFilters, severityFilters, onTypeToggle, onSeverityToggle }) {
  return (
    <div className="filter-bar">
      <span className="filter-bar-label">Filter</span>
      <div className="filter-bar-pills">
        {TYPE_PILLS.map(pill => {
          const isActive = typeFilters.has(pill.id)
          return (
            <button
              key={pill.id}
              className={`filter-pill${isActive ? ' active' : ''}`}
              style={isActive ? (TYPE_ACTIVE_STYLE[pill.id] ?? {}) : {}}
              onClick={() => onTypeToggle(pill.id)}
            >
              {pill.label}
            </button>
          )
        })}
      </div>
      <div className="filter-bar-divider" />
      <span className="filter-bar-label">Severity</span>
      <div className="filter-bar-pills">
        {SEVERITY_PILLS.map(pill => {
          const isActive = severityFilters.has(pill.id)
          return (
            <button
              key={pill.id}
              className={`filter-pill${isActive ? ' active' : ''}`}
              style={isActive ? (SEV_ACTIVE_STYLE[pill.id] ?? {}) : {}}
              onClick={() => onSeverityToggle(pill.id)}
            >
              {pill.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Parent Journey View (Part 1 — no data, has children) ──────── */

const STATUS_DOT_COLORS = {
  validated:     '#36B37E',
  'in-progress': '#FF991F',
  discovery:     '#6554C0',
  open:          '#C1C7D0',
}

const ACCENT_COLORS_PARENT = ['#0052CC', '#6554C0', '#36B37E', '#FF991F', '#00B8D9']

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

  // ALL hooks must be declared before any conditional return
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

  // Compute badge counts for TabNav (Part 11) — must be declared before early returns
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

  // Conditional returns AFTER all hooks
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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar journey={journey} ancestors={ancestors} />
      <TabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        insightCount={insightCount}
        oppCount={oppCount}
      />
      {activeTab === 'journey' && (
        <FilterBar
          typeFilters={typeFilters}
          severityFilters={severityFilters}
          onTypeToggle={toggleTypeFilter}
          onSeverityToggle={toggleSeverityFilter}
        />
      )}
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
