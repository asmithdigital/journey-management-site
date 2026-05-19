import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useData } from '../App.jsx'
import TopBar from '../components/layout/TopBar.jsx'
import SummaryCards from '../components/shared/SummaryCards.jsx'
import TabNav from '../components/shared/TabNav.jsx'
import JourneyMapView from '../components/journey/JourneyMapView.jsx'
import OpportunityMatrix from '../components/matrix/OpportunityMatrix.jsx'
import InsightCard from '../components/cards/InsightCard.jsx'

function InsightsTab({ journey }) {
  const stages = [...(journey.stages || [])].sort((a, b) => a.order - b.order)
  const insights = journey.insights || []

  const allInsights = [
    ...insights.map(ins => ({
      ...ins,
      type: ins.severity === 'high' ? 'pain' : 'need',
      stageName: stages.find(s => s.id === ins.stage)?.name ?? ins.stage,
    })),
    ...stages.flatMap(stage =>
      (stage.painPoints || []).map((text, i) => ({
        id: `${stage.id}-pain-${i}`,
        text,
        type: 'pain',
        severity: 'high',
        stageName: stage.name,
      }))
    ),
  ]

  return (
    <div style={{ padding: '16px 20px', overflow: 'auto', flex: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {allInsights.map(ins => (
          <InsightCard key={ins.id} insight={ins} />
        ))}
        {allInsights.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', gridColumn: '1/-1' }}>
            No insights available for this journey.
          </div>
        )}
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

export default function JourneyMap() {
  const { journeyId } = useParams()
  const { index, journeys } = useData()
  const [activeTab, setActiveTab] = useState('journey')

  const journey = journeys[journeyId]
  const hierarchy = index?.hierarchy || []
  const parentNode = hierarchy.find(top => top.children?.some(c => c.id === journeyId))

  if (!journey) {
    const childNode = hierarchy.flatMap(top => top.children || []).find(c => c.id === journeyId)
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar journey={{ name: childNode?.name ?? journeyId }} parentName={parentNode?.name} />
        <div className="no-data-page">
          <h2>No data yet</h2>
          <p>Add a JSON file at <code>public/data/journeys/{journeyId}.json</code> to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar journey={journey} parentName={parentNode?.name} />
      <SummaryCards />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="journey-view-content">
        {activeTab === 'journey' && <JourneyMapView journey={journey} />}
        {activeTab === 'insights' && <InsightsTab journey={journey} />}
        {activeTab === 'opportunities' && <OpportunityMatrix journey={journey} />}
        {activeTab === 'solutions' && <PlaceholderTab label="Solutions" />}
        {activeTab === 'metrics' && <PlaceholderTab label="Metrics" />}
      </div>
    </div>
  )
}
