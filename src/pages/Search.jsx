import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../App.jsx'

function highlight(text, query) {
  if (!query || !text) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i}>{part}</mark>
      : part
  )
}

export default function Search() {
  const { journeys } = useData()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ journeys: [], stages: [], insights: [], opportunities: [] })

  const runSearch = useCallback((q) => {
    if (!q.trim()) {
      setResults({ journeys: [], stages: [], insights: [], opportunities: [] })
      return
    }
    const lq = q.toLowerCase()

    const matchedJourneys = Object.values(journeys).filter(j =>
      j.name?.toLowerCase().includes(lq) ||
      j.description?.toLowerCase().includes(lq) ||
      j.summary?.toLowerCase().includes(lq)
    )

    const matchedStages = []
    const matchedInsights = []
    const matchedOpps = []

    Object.values(journeys).forEach(j => {
      ;(j.stages || []).forEach(stage => {
        if (stage.name?.toLowerCase().includes(lq)) {
          matchedStages.push({ ...stage, journeyId: j.id, journeyName: j.name })
        }

        // Pain points — array of objects or strings
        ;(stage.painPoints || []).forEach((pp, i) => {
          const text = typeof pp === 'object' ? (pp.description ?? '') : (pp ?? '')
          const id   = typeof pp === 'object' ? pp.id : `${j.id}-${stage.id}-pp-${i}`
          if (text.toLowerCase().includes(lq)) {
            matchedInsights.push({
              id,
              text,
              type: 'pain-point',
              severity: typeof pp === 'object' ? pp.severity : 'high',
              source: typeof pp === 'object' ? pp.source : null,
              stageName: stage.name,
              journeyId: j.id,
              journeyName: j.name,
            })
          }
        })

        // Opportunities — array of objects or strings
        ;(stage.opportunities || []).forEach((opp, i) => {
          const text = typeof opp === 'object' ? (opp.description ?? '') : (opp ?? '')
          const id   = typeof opp === 'object' ? opp.id : `${j.id}-${stage.id}-opp-${i}`
          if (text.toLowerCase().includes(lq)) {
            matchedOpps.push({
              id,
              text,
              type: 'opportunity',
              impact: typeof opp === 'object' ? opp.impact : null,
              effort: typeof opp === 'object' ? opp.effort : null,
              stageName: stage.name,
              journeyId: j.id,
              journeyName: j.name,
            })
          }
        })
      })

      // Top-level insights — description or text field
      ;(j.insights || []).forEach(ins => {
        const text = ins.description ?? ins.text ?? ''
        if (text.toLowerCase().includes(lq)) {
          matchedInsights.push({
            ...ins,
            text,
            type: 'insight',
            journeyId: j.id,
            journeyName: j.name,
          })
        }
      })
    })

    setResults({ journeys: matchedJourneys, stages: matchedStages, insights: matchedInsights, opportunities: matchedOpps })
  }, [journeys])

  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), 200)
    return () => clearTimeout(timer)
  }, [query, runSearch])

  const hasResults = Object.values(results).some(arr => arr.length > 0)

  return (
    <div className="search-page">
      <div className="page-header">
        <div className="page-heading">Search</div>
        <div className="page-subheading">Find journeys, insights, and opportunities</div>
      </div>

      <div className="search-input-wrap">
        <span className="search-icon-prefix">⌕</span>
        <input
          className="search-input"
          type="text"
          placeholder="Search across all journeys…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {!query.trim() && (
        <div className="search-empty">Start typing to search journeys, insights, and opportunities.</div>
      )}

      {query.trim() && !hasResults && (
        <div className="search-empty">No results found for "{query}".</div>
      )}

      {results.journeys.length > 0 && (
        <div className="search-results-group">
          <div className="search-group-heading">Journeys ({results.journeys.length})</div>
          {results.journeys.map(j => (
            <Link key={j.id} to={`/journey/${j.id}`} className="search-result-item" style={{ display: 'block' }}>
              <div className="search-result-text">{highlight(j.name, query)}</div>
              {(j.description || j.summary) && (
                <div className="search-result-meta">
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {highlight(
                      (j.description ?? j.summary ?? '').slice(0, 100) +
                      ((j.description ?? j.summary ?? '').length > 100 ? '…' : ''),
                      query
                    )}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {results.insights.length > 0 && (
        <div className="search-results-group">
          <div className="search-group-heading">Insights & Pain Points ({results.insights.length})</div>
          {results.insights.map(ins => (
            <div key={ins.id} className="search-result-item">
              <div className="search-result-text">{highlight(ins.text, query)}</div>
              <div className="search-result-meta">
                <span className="search-type-tag">{ins.type}</span>
                {ins.severity && <span className={`insight-tag ${ins.severity}`} style={{ fontSize: 10 }}>{ins.severity}</span>}
                {ins.stageName && <span className="search-stage-label">{ins.stageName}</span>}
                <Link to={`/journey/${ins.journeyId}`} style={{ fontSize: 11, color: 'var(--accent-purple)' }}>
                  {ins.journeyName}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.opportunities.length > 0 && (
        <div className="search-results-group">
          <div className="search-group-heading">Opportunities ({results.opportunities.length})</div>
          {results.opportunities.map(opp => (
            <div key={opp.id} className="search-result-item">
              <div className="search-result-text">{highlight(opp.text, query)}</div>
              <div className="search-result-meta">
                <span className="search-type-tag">opportunity</span>
                {opp.impact && <span className={`impact-tag impact-${opp.impact}`}>{opp.impact} impact</span>}
                {opp.effort && <span className={`effort-tag effort-${opp.effort}`}>{opp.effort} effort</span>}
                {opp.stageName && <span className="search-stage-label">{opp.stageName}</span>}
                <Link to={`/journey/${opp.journeyId}`} style={{ fontSize: 11, color: 'var(--accent-purple)' }}>
                  {opp.journeyName}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
