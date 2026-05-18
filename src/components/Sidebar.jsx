import React, { useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useData } from '../App.jsx'

export default function Sidebar() {
  const { index } = useData()
  const [expanded, setExpanded] = useState({ 'insurance-lifecycle': true })
  const location = useLocation()

  const metadata = index?.metadata || {}
  const hierarchy = index?.hierarchy || []

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function isJourneyActive(id) {
    return location.pathname === `/journey/${id}`
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Journey Management</div>
      </div>

      <div className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `sidebar-nav-link${isActive ? ' active' : ''}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/matrix"
          className={({ isActive }) => `sidebar-nav-link${isActive ? ' active' : ''}`}
        >
          Opportunity Matrix
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) => `sidebar-nav-link${isActive ? ' active' : ''}`}
        >
          Search
        </NavLink>
      </div>

      <div className="sidebar-tree">
        <div className="sidebar-tree-label">Journeys</div>

        {hierarchy.map(top => (
          <div key={top.id} className="sidebar-tree-item">
            <button
              className="sidebar-tree-top"
              onClick={() => toggleExpand(top.id)}
              aria-expanded={!!expanded[top.id]}
            >
              <span>{top.name}</span>
              <span className={`sidebar-chevron${expanded[top.id] ? ' open' : ''}`}>▶</span>
            </button>

            {expanded[top.id] && top.children && (
              <ul className="sidebar-sub-list">
                {top.children.map(child => (
                  <li key={child.id}>
                    <Link
                      to={`/journey/${child.id}`}
                      className={`sidebar-sub-link${isJourneyActive(child.id) ? ' active' : ''}`}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        {metadata.totalJourneys} journeys · {metadata.totalInsights} insights
        <br />
        Updated {metadata.lastUpdated}
      </div>
    </nav>
  )
}
