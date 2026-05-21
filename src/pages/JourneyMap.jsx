import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useData } from '../App.jsx'
import TopBar from '../components/layout/TopBar.jsx'
import SummaryCards from '../components/shared/SummaryCards.jsx'
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
    return {
      id: `${stageId}-pain-${index}`,
      text: pp,
      type: 'pain',
      severity: 'high',
      stageName: null,
    }
  }
  return {
    id: pp.id,
    text: pp.description,
    source: pp.source,
    evidenceCount: pp.evidenceCount,
    type: pp.severity === 'high' ? 'pain' : pp.severity === 'medium' ? 'need' : 'gain',
    severity: pp.severity,
  }
}

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
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          No insights available for this journey.
        </div>
      )}
      <div className="insights-tab-list">
        {allInsights.map(ins => (
          <InsightCard key={ins.id} insight={ins} />
        ))}
      </div>
    </div>
  )
}

function PlaceholderTab({ label }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{label} view coming soon</span>
    </div>
  )
}

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

export default function JourneyMap() {
  const { journeyId } = useParams()
  const { index, journeys } = useData()
  const [activeTab, setActiveTab] = useState('journey')

  const journey = journeys[journeyId]
  const hierarchy = index?.hierarchy || []
  const ancestors = findAncestors(hierarchy, journeyId) ?? []
  const hierarchyNode = findNode(hierarchy, journeyId)

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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar journey={journey} ancestors={ancestors} />
      <SummaryCards />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="journey-view-content">
        {activeTab === 'journey' && <JourneyMapView journey={journey} />}
        {activeTab === 'insights' && <InsightsTab journey={journey} />}
        {activeTab === 'opportunities' && <OpportunityMatrix journey={journey} />}
        {activeTab === 'solutions' && <PlaceholderTab label="Solutions" />}
        {activeTab === 'metrics' && <PlaceholderTab label="Metrics" />}
        {activeTab === 'changelog' && <ChangelogTab journey={journey} />}
      </div>
    </div>
  )
}
