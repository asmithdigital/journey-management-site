import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../App.jsx'

function highlight(text, query) {
  if (!query) return text
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i}>{part}</mark>
      : part
  )
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function searchJourney(journey, query) {
  const q = query.toLowerCase()
  const results = []

  if (journey.name.toLowerCase().includes(q)) {
    results.push({
      section: 'Journey Name',
      text: journey.name,
      stageId: null,
      stageName: null,
    })
  }

  ;(journey.stages || []).forEach(stage => {
    const stageName = stage.name

    if (stageName.toLowerCase().includes(q)) {
      results.push({ section: 'Stage Name', text: stageName, stageId: stage.id, stageName })
    }

    ;(stage.touchpoints || []).forEach(tp => {
      if (tp.toLowerCase().includes(q)) {
        results.push({ section: 'Touchpoint', text: tp, stageId: stage.id, stageName })
      }
    })

    ;(stage.actions || []).forEach(a => {
      if (a.toLowerCase().includes(q)) {
        results.push({ section: 'Action', text: a, stageId: stage.id, stageName })
      }
    })

    ;(stage.thoughts || []).forEach(t => {
      if (t.toLowerCase().includes(q)) {
        results.push({ section: 'Thought', text: t, stageId: stage.id, stageName })
      }
    })

    ;(stage.painPoints || []).forEach(p => {
      if (p.toLowerCase().includes(q)) {
        results.push({ section: 'Pain Point', text: p, stageId: stage.id, stageName })
      }
    })

    ;(stage.opportunities || []).forEach(o => {
      if (o.toLowerCase().includes(q)) {
        results.push({ section: 'Opportunity', text: o, stageId: stage.id, stageName })
      }
    })
  })

  ;(journey.insights || []).forEach(insight => {
    if (insight.text.toLowerCase().includes(q)) {
      const stage = (journey.stages || []).find(s => s.id === insight.stage)
      results.push({
        section: 'Insight',
        text: insight.text,
        stageId: insight.stage,
        stageName: stage?.name || null,
      })
    }
  })

  return results
}

export default function Search() {
  const { journeys } = useData()
  const [rawQuery, setRawQuery] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setQuery(rawQuery.trim()), 300)
    return () => clearTimeout(timer)
  }, [rawQuery])

  const results = []

  if (query.length >= 2) {
    Object.values(journeys).forEach(journey => {
      const hits = searchJourney(journey, query)
      if (hits.length > 0) {
        results.push({ journey, hits })
      }
    })
  }

  return (
    <div className="page-container">
      <h1 className="page-heading">Search</h1>

      <div className="search-input-wrap">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          className="search-input"
          placeholder="Search journeys, stages, pain points, insights…"
          value={rawQuery}
          onChange={e => setRawQuery(e.target.value)}
          autoFocus
        />
      </div>

      {!query && (
        <div className="search-placeholder">
          Start typing to search across all journeys and insights.
        </div>
      )}

      {query.length === 1 && (
        <div className="search-placeholder">
          Keep typing…
        </div>
      )}

      {query.length >= 2 && results.length === 0 && (
        <div className="search-placeholder">
          No results for "{query}"
        </div>
      )}

      {results.length > 0 && (
        <div className="search-results">
          {results.map(({ journey, hits }) => (
            <div key={journey.id}>
              <div className="search-group-heading">
                <Link to={`/journey/${journey.id}`}>{journey.name}</Link>
                {' '}
                <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: 13 }}>
                  — {hits.length} match{hits.length !== 1 ? 'es' : ''}
                </span>
              </div>

              {hits.map((hit, i) => (
                <div key={i} className="search-result-item">
                  <div style={{ flex: 1 }}>
                    <div className="search-result-text">
                      {highlight(hit.text, query)}
                    </div>
                    <div className="search-result-meta">
                      <span className="search-type-tag">{hit.section}</span>
                      {hit.stageName && (
                        <span className="search-stage-label">{hit.stageName}</span>
                      )}
                      <Link
                        to={`/journey/${journey.id}`}
                        className="search-result-link"
                      >
                        View journey →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
