import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../App.jsx'
import DetailPanel from '../components/shared/DetailPanel.jsx'

const TYPE_DOT_COLOR = {
  pain:        '#FF5630',
  need:        '#0052CC',
  gain:        '#36B37E',
  observation: '#6554C0',
}

const SEV_ORDER = { high: 0, medium: 1, low: 2 }

function insightType(severity) {
  if (severity === 'high') return 'pain'
  if (severity === 'medium') return 'need'
  return 'gain'
}

function normalizeInsights(journeys) {
  return Object.entries(journeys).flatMap(([journeyId, journey]) => {
    const journeyName = journey.name || journeyId

    const topLevel = (journey.insights || []).map(ins => ({
      id: ins.id,
      text: ins.description ?? ins.text ?? '',
      type: insightType(ins.severity),
      severity: ins.severity ?? 'medium',
      source: ins.source ?? null,
      evidenceCount: ins.evidenceCount ?? null,
      journeyId,
      journeyName,
      status: 'open',
    }))

    const stagePPs = (journey.stages || []).flatMap((stage, _si) =>
      (stage.painPoints || []).map((pp, pi) => {
        if (typeof pp === 'string') {
          return {
            id: `${journeyId}-${stage.id}-pp-${pi}`,
            text: pp,
            type: 'pain',
            severity: 'high',
            source: null,
            evidenceCount: null,
            journeyId,
            journeyName,
            status: 'open',
          }
        }
        return {
          id: pp.id ?? `${journeyId}-${stage.id}-pp-${pi}`,
          text: pp.description ?? pp.text ?? '',
          type: insightType(pp.severity),
          severity: pp.severity ?? 'medium',
          source: pp.source ?? null,
          evidenceCount: pp.evidenceCount ?? null,
          journeyId,
          journeyName,
          status: 'open',
        }
      })
    )

    return [...topLevel, ...stagePPs]
  })
}

function SortArrow({ sortBy, col, sortDir }) {
  if (sortBy !== col) return <span className="sort-arrow inactive">↕</span>
  return <span className="sort-arrow">{sortDir === 'asc' ? '↑' : '↓'}</span>
}

export default function GlobalInsights() {
  const { journeys } = useData()
  const [typeFilter, setTypeFilter] = useState('all')
  const [journeyFilter, setJourneyFilter] = useState('all')
  const [sortBy, setSortBy] = useState('severity')
  const [sortDir, setSortDir] = useState('asc')
  const [selected, setSelected] = useState(null)

  const allInsights = useMemo(() => normalizeInsights(journeys), [journeys])

  const journeyNames = useMemo(() => {
    const names = {}
    Object.entries(journeys).forEach(([id, j]) => { names[id] = j.name || id })
    return names
  }, [journeys])

  const filtered = useMemo(() => {
    let rows = allInsights
    if (typeFilter !== 'all') rows = rows.filter(r => r.type === typeFilter)
    if (journeyFilter !== 'all') rows = rows.filter(r => r.journeyId === journeyFilter)
    return [...rows].sort((a, b) => {
      let cmp = 0
      if (sortBy === 'severity') cmp = (SEV_ORDER[a.severity] ?? 1) - (SEV_ORDER[b.severity] ?? 1)
      else if (sortBy === 'type') cmp = (a.type ?? '').localeCompare(b.type ?? '')
      else if (sortBy === 'journey') cmp = a.journeyName.localeCompare(b.journeyName)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [allInsights, typeFilter, journeyFilter, sortBy, sortDir])

  function toggleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  return (
    <div className="global-page">
      <div className="global-page-header">
        <div className="page-heading">Insights</div>
        <div className="page-subheading">{allInsights.length} insights across {Object.keys(journeys).length} journeys</div>
      </div>

      <div className="global-filters">
        <div className="global-filter-group">
          <label className="global-filter-label">Type</label>
          <select className="global-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            <option value="pain">Pain</option>
            <option value="need">Need</option>
            <option value="gain">Gain</option>
            <option value="observation">Observation</option>
          </select>
        </div>
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
          <label className="global-filter-label">Sort by</label>
          <select className="global-filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="severity">Severity</option>
            <option value="type">Type</option>
            <option value="journey">Journey</option>
          </select>
        </div>
      </div>

      <div className="global-table-scroll">
        <div className="global-table global-insights-table">
          <div className="global-table-head">
            <span className="gtc-dot" />
            <span className="gtc-text" onClick={() => toggleSort('type')} style={{ cursor: 'pointer' }}>
              Insight <SortArrow sortBy={sortBy} col="type" sortDir={sortDir} />
            </span>
            <span className="gtc-journey" onClick={() => toggleSort('journey')} style={{ cursor: 'pointer' }}>
              Journey <SortArrow sortBy={sortBy} col="journey" sortDir={sortDir} />
            </span>
            <span className="gtc-sev" onClick={() => toggleSort('severity')} style={{ cursor: 'pointer' }}>
              Severity <SortArrow sortBy={sortBy} col="severity" sortDir={sortDir} />
            </span>
            <span className="gtc-src">Source</span>
            <span className="gtc-ev">Evidence</span>
          </div>

          {filtered.length === 0 ? (
            <div className="global-table-empty">No insights match the current filters.</div>
          ) : (
            filtered.map(ins => (
              <div key={ins.id} className="global-table-row" onClick={() => setSelected(ins)}>
                <span className="gtc-dot">
                  <span
                    className="insights-type-dot"
                    style={{ background: TYPE_DOT_COLOR[ins.type] ?? '#C1C7D0' }}
                  />
                </span>
                <span className="gtc-text global-text-cell">{ins.text}</span>
                <span className="gtc-journey">
                  <Link
                    to={`/journey/${ins.journeyId}`}
                    className="global-journey-link"
                    onClick={e => e.stopPropagation()}
                  >
                    {ins.journeyName}
                  </Link>
                </span>
                <span className="gtc-sev">
                  {ins.severity && (
                    <span className={`insight-tag ${ins.severity}`} style={{ fontSize: 10 }}>
                      {ins.severity}
                    </span>
                  )}
                </span>
                <span className="gtc-src global-meta-cell">{ins.source ?? '—'}</span>
                <span className="gtc-ev global-meta-cell">
                  {ins.evidenceCount != null ? `${ins.evidenceCount} src` : '—'}
                </span>
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
