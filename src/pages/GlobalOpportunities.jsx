import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../App.jsx'
import { deriveOpportunitiesFromJourney } from '../components/matrix/OpportunityMatrix.jsx'
import DetailPanel from '../components/shared/DetailPanel.jsx'

const IMPACT_COLORS = {
  high:   { bg: '#FFEBE6', text: '#BF2600' },
  medium: { bg: '#FFF0B3', text: '#172B4D' },
  low:    { bg: '#F4F5F7', text: '#5E6C84' },
}

const EFFORT_COLORS = {
  low:    { bg: '#E3FCEF', text: '#006644' },
  medium: { bg: '#FFF0B3', text: '#172B4D' },
  high:   { bg: '#FFEBE6', text: '#BF2600' },
}

const STATUS_COLORS = {
  open:          { bg: '#F4F5F7', text: '#5E6C84' },
  validated:     { bg: '#E3FCEF', text: '#006644' },
  'in-progress': { bg: '#FFF0B3', text: '#172B4D' },
  solved:        { bg: '#EAF0FF', text: '#0052CC' },
}

const IMPACT_ORDER = { high: 0, medium: 1, low: 2 }

function Badge({ value, colors, fallback = '—' }) {
  if (!value || !colors[value]) return <span className="global-meta-cell">{fallback}</span>
  const { bg, text } = colors[value]
  const label = value === 'in-progress'
    ? 'In Progress'
    : value.charAt(0).toUpperCase() + value.slice(1)
  return <span className="global-badge" style={{ background: bg, color: text }}>{label}</span>
}

function SortArrow({ sortBy, col, sortDir }) {
  if (sortBy !== col) return <span className="sort-arrow inactive">↕</span>
  return <span className="sort-arrow">{sortDir === 'asc' ? '↑' : '↓'}</span>
}

export default function GlobalOpportunities() {
  const { journeys } = useData()
  const [journeyFilter, setJourneyFilter] = useState('all')
  const [impactFilter, setImpactFilter] = useState('all')
  const [effortFilter, setEffortFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('score')
  const [sortDir, setSortDir] = useState('desc')
  const [selected, setSelected] = useState(null)

  const allOpps = useMemo(() =>
    Object.entries(journeys).flatMap(([journeyId, journey]) =>
      deriveOpportunitiesFromJourney(journey).map(opp => ({
        ...opp,
        journeyId,
        journeyName: journey.name || journeyId,
        type: 'opportunity',
        text: opp.title,
      }))
    ),
  [journeys])

  const journeyNames = useMemo(() => {
    const names = {}
    Object.entries(journeys).forEach(([id, j]) => { names[id] = j.name || id })
    return names
  }, [journeys])

  const filtered = useMemo(() => {
    let rows = allOpps
    if (journeyFilter !== 'all') rows = rows.filter(r => r.journeyId === journeyFilter)
    if (impactFilter !== 'all') rows = rows.filter(r => r.impact === impactFilter)
    if (effortFilter !== 'all') rows = rows.filter(r => r.effort === effortFilter)
    if (statusFilter !== 'all') rows = rows.filter(r => r.status === statusFilter)
    return [...rows].sort((a, b) => {
      let cmp = 0
      if (sortBy === 'score') cmp = (a.score ?? 0) - (b.score ?? 0)
      else if (sortBy === 'journey') cmp = a.journeyName.localeCompare(b.journeyName)
      else if (sortBy === 'impact') cmp = (IMPACT_ORDER[a.impact] ?? 1) - (IMPACT_ORDER[b.impact] ?? 1)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [allOpps, journeyFilter, impactFilter, effortFilter, statusFilter, sortBy, sortDir])

  function toggleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir(col === 'score' ? 'desc' : 'asc') }
  }

  return (
    <div className="global-page">
      <div className="global-page-header">
        <div className="page-heading">Opportunities</div>
        <div className="page-subheading">
          {allOpps.length} opportunities across {Object.keys(journeys).length} journeys
        </div>
      </div>

      <div className="global-filters">
        <div className="global-filter-group">
          <label className="global-filter-label">Journey</label>
          <select className="global-filter-select" value={journeyFilter} onChange={e => setJourneyFilter(e.target.value)}>
            <option value="all">All journeys</option>
            {Object.entries(journeyNames).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        <div className="global-filter-group">
          <label className="global-filter-label">Impact</label>
          <select className="global-filter-select" value={impactFilter} onChange={e => setImpactFilter(e.target.value)}>
            <option value="all">All impact</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="global-filter-group">
          <label className="global-filter-label">Effort</label>
          <select className="global-filter-select" value={effortFilter} onChange={e => setEffortFilter(e.target.value)}>
            <option value="all">All effort</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="global-filter-group">
          <label className="global-filter-label">Status</label>
          <select className="global-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All status</option>
            <option value="open">Open</option>
            <option value="validated">Validated</option>
            <option value="in-progress">In Progress</option>
            <option value="solved">Solved</option>
          </select>
        </div>
      </div>

      <div className="global-table-scroll">
        <div className="global-table global-opp-table">
          <div className="global-table-head">
            <span className="gtc-opp-title">Opportunity</span>
            <span className="gtc-opp-journey" onClick={() => toggleSort('journey')} style={{ cursor: 'pointer' }}>
              Journey <SortArrow sortBy={sortBy} col="journey" sortDir={sortDir} />
            </span>
            <span className="gtc-opp-impact" onClick={() => toggleSort('impact')} style={{ cursor: 'pointer' }}>
              Impact <SortArrow sortBy={sortBy} col="impact" sortDir={sortDir} />
            </span>
            <span className="gtc-opp-effort">Effort</span>
            <span className="gtc-opp-status">Status</span>
            <span className="gtc-opp-score" onClick={() => toggleSort('score')} style={{ cursor: 'pointer' }}>
              Score <SortArrow sortBy={sortBy} col="score" sortDir={sortDir} />
            </span>
            <span className="gtc-opp-cv">C.Value</span>
            <span className="gtc-opp-bv">B.Value</span>
          </div>

          {filtered.length === 0 ? (
            <div className="global-table-empty">No opportunities match the current filters.</div>
          ) : (
            filtered.map(opp => (
              <div key={opp.id} className="global-table-row" onClick={() => setSelected(opp)}>
                <span className="gtc-opp-title global-text-cell">{opp.title}</span>
                <span className="gtc-opp-journey">
                  <Link
                    to={`/journey/${opp.journeyId}`}
                    className="global-journey-link"
                    onClick={e => e.stopPropagation()}
                  >
                    {opp.journeyName}
                  </Link>
                </span>
                <span className="gtc-opp-impact"><Badge value={opp.impact} colors={IMPACT_COLORS} /></span>
                <span className="gtc-opp-effort"><Badge value={opp.effort} colors={EFFORT_COLORS} /></span>
                <span className="gtc-opp-status"><Badge value={opp.status} colors={STATUS_COLORS} /></span>
                <span className="gtc-opp-score global-meta-cell">{opp.score ?? '—'}</span>
                <span className="gtc-opp-cv global-meta-cell">{Math.round(opp.customerValue)}</span>
                <span className="gtc-opp-bv global-meta-cell">{Math.round(opp.businessValue)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {selected && (
        <DetailPanel item={selected} onClose={() => setSelected(null)} journeys={journeys} />
      )}
    </div>
  )
}
