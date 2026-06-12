import React, { useState, useEffect } from 'react'
import { useData } from '../App.jsx'

const BASE = import.meta.env.BASE_URL

const CATEGORY_COLORS = {
  'raa-web':    '#0052CC',
  'raa-app':    '#EA580C',
  'raa-member': '#6554C0',
}

const CATEGORY_BG = {
  'raa-web':    'rgba(0,82,204,0.1)',
  'raa-app':    'rgba(234,88,12,0.1)',
  'raa-member': 'rgba(101,84,192,0.1)',
}

const CATEGORY_LABELS = {
  'raa-web':    'RAA Web',
  'raa-app':    'RAA App',
  'raa-member': 'RAA Member',
}

const STATUS_COLOR = {
  current:       '#36B37E',
  'in-progress': '#FF991F',
  planned:       '#6554C0',
}

const STATUS_LABEL = {
  current:       'Current',
  'in-progress': 'In Progress',
  planned:       'Planned',
}

function CategoryPill({ category }) {
  const color = CATEGORY_COLORS[category] || '#5E6C84'
  const bg    = CATEGORY_BG[category]    || '#F4F5F7'
  return (
    <span className="journey-cat-pill" style={{ color, background: bg, borderColor: color + '40' }}>
      {CATEGORY_LABELS[category] || category}
    </span>
  )
}

function StatusBadge({ status }) {
  const color = STATUS_COLOR[status] || '#C1C7D0'
  return (
    <span className="journey-status-badge">
      <span className="journey-status-dot" style={{ background: color }} />
      {STATUS_LABEL[status] || status}
    </span>
  )
}

export default function Dashboard() {
  const { index } = useData()
  const metadata = index?.metadata || {}

  const [slackData, setSlackData]     = useState(null)
  const [activeCategory, setActive]   = useState('all')

  useEffect(() => {
    fetch(`${BASE}data/journeys.json`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setSlackData(d))
      .catch(() => {})
  }, [])

  const allJourneys      = slackData?.journeys || []
  const totalTouchpoints = allJourneys.reduce((acc, j) => acc + (j.touchpoints?.length || 0), 0)
  const categories       = ['all', ...Array.from(new Set(allJourneys.map(j => j.category)))]

  const filtered = activeCategory === 'all'
    ? allJourneys
    : allJourneys.filter(j => j.category === activeCategory)

  const sorted = [...filtered].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))

  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="page-heading">Journey Management</div>
            <div className="page-subheading">All customer journeys mapped, tracked, and cross-linked</div>
          </div>
          <div className="platform-links-row">
            <a
              href="https://asmithdigital.github.io/design-system-site/"
              target="_blank"
              rel="noopener noreferrer"
              className="platform-ext-link"
            >
              <span className="platform-ext-icon">◈</span>
              Apiary Design System
              <span className="platform-ext-arrow">↗</span>
            </a>
            <a
              href="https://asmithdigital.github.io/raa-prototype-platform/"
              target="_blank"
              rel="noopener noreferrer"
              className="platform-ext-link"
            >
              <span className="platform-ext-icon">⊞</span>
              Prototype Platform
              <span className="platform-ext-arrow">↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-card-number">{allJourneys.length || (metadata.totalJourneys ?? '—')}</div>
          <div className="stat-card-label">Journeys</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-number">{totalTouchpoints || '—'}</div>
          <div className="stat-card-label">Touchpoints</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-number">{categories.length - 1 || '—'}</div>
          <div className="stat-card-label">Channels</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-number">{slackData?.meta?.lastUpdated ?? metadata.lastUpdated ?? '—'}</div>
          <div className="stat-card-label">Last updated</div>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="journey-filter-pills">
        {categories.map(cat => {
          const isActive = activeCategory === cat
          const color    = CATEGORY_COLORS[cat]
          return (
            <button
              key={cat}
              className="journey-filter-pill"
              style={isActive && cat !== 'all'
                ? { background: color, borderColor: color, color: 'white' }
                : isActive
                  ? { background: '#172B4D', borderColor: '#172B4D', color: 'white' }
                  : {}
              }
              onClick={() => setActive(cat)}
            >
              {cat === 'all' ? 'All journeys' : CATEGORY_LABELS[cat] || cat}
            </button>
          )
        })}
      </div>

      {/* Journey table */}
      {slackData ? (
        <div className="journey-table-wrap">
          <table className="journey-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th className="journey-table-center">Touchpoints</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(j => (
                <tr key={j.id}>
                  <td>
                    <div className="journey-table-name">{j.name}</div>
                    <div className="journey-table-desc">{j.description}</div>
                  </td>
                  <td><CategoryPill category={j.category} /></td>
                  <td><StatusBadge status={j.status} /></td>
                  <td className="journey-table-center">
                    <span className="journey-touchpoint-count">{j.touchpoints?.length || 0}</span>
                  </td>
                  <td className="journey-table-date">{j.lastUpdated}</td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '32px 20px', textAlign: 'center', color: '#5E6C84' }}>
                    No journeys in this category yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '32px 0', color: '#5E6C84', fontSize: 13 }}>Loading journeys…</div>
      )}
    </div>
  )
}
