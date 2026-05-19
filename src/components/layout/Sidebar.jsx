import React, { useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useData } from '../../App.jsx'

const NAV_ITEMS = [
  { icon: '⌂', label: 'Home', to: '/' },
  { icon: '⌕', label: 'Search', to: '/search' },
  { icon: '⚐', label: 'Updates', to: '#' },
  { icon: '◎', label: 'Goals', to: '#' },
  { icon: '⊞', label: 'Data hub', to: '#' },
]

const BUILDING_BLOCKS = [
  { icon: '⊞', label: 'Journeys' },
  { icon: '◉', label: 'Personas' },
  { icon: '▣', label: 'Metrics' },
  { icon: '◈', label: 'Insights' },
  { icon: '◆', label: 'Opportunities' },
  { icon: '✓', label: 'Solutions' },
]

const BOTTOM_ITEMS = [
  { icon: '⊕', label: 'Invite collaborators' },
  { icon: '?', label: 'Help & support' },
  { icon: '✦', label: "What's new" },
  { icon: '⚙', label: 'Settings' },
]

export default function Sidebar() {
  const { index } = useData()
  const [frameworksOpen, setFrameworksOpen] = useState(true)
  const [blocksOpen, setBlocksOpen] = useState(false)
  const location = useLocation()

  const hierarchy = index?.hierarchy || []

  function isJourneyActive(id) {
    return location.pathname === `/journey/${id}`
  }

  return (
    <nav className="sidebar">
      {/* Workspace */}
      <div className="sidebar-workspace">
        <div className="sidebar-workspace-info">
          <div className="sidebar-workspace-name">asmith digital</div>
          <div className="sidebar-workspace-sub">Workspace</div>
        </div>
        <div className="sidebar-workspace-actions">
          <button className="sidebar-icon-btn" title="Menu">▾</button>
          <button className="sidebar-icon-btn" title="New">⊞</button>
        </div>
      </div>

      {/* Main nav */}
      <div className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          item.to === '#' ? (
            <div key={item.label} className="sidebar-nav-item">
              <span className="sidebar-nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ) : (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          )
        ))}
      </div>

      {/* Journey Frameworks */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span className="sidebar-section-label">Journey Frameworks</span>
          <div className="sidebar-section-actions">
            <button className="sidebar-icon-btn" title="Add">+</button>
            <button
              className="sidebar-icon-btn"
              onClick={() => setFrameworksOpen(o => !o)}
              title="Collapse"
            >
              {frameworksOpen ? '▾' : '▸'}
            </button>
          </div>
        </div>

        {frameworksOpen && hierarchy.map(top => (
          <div key={top.id}>
            <Link
              to={`/journey/${top.id}`}
              className={`sidebar-expand-btn${isJourneyActive(top.id) ? ' active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <span style={{ fontSize: 10, opacity: 0.5 }}>▶</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {top.name}
              </span>
            </Link>
            {(top.children || []).map(child => (
              <Link
                key={child.id}
                to={`/journey/${child.id}`}
                className={`sidebar-tree-item${isJourneyActive(child.id) ? ' active' : ''}`}
              >
                <span className="sidebar-tree-bullet" />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {child.name}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Building Blocks */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span className="sidebar-section-label">Building Blocks</span>
          <div className="sidebar-section-actions">
            <button
              className="sidebar-icon-btn"
              onClick={() => setBlocksOpen(o => !o)}
              title="Collapse"
            >
              {blocksOpen ? '▾' : '▸'}
            </button>
          </div>
        </div>
        {blocksOpen && BUILDING_BLOCKS.map(item => (
          <div key={item.label} className="sidebar-tree-item">
            <span style={{ fontSize: 12, opacity: 0.6 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      <div className="sidebar-spacer" />

      {/* Bottom nav */}
      <div className="sidebar-bottom">
        {BOTTOM_ITEMS.map(item => (
          <div key={item.label} className="sidebar-nav-item">
            <span className="sidebar-nav-icon" style={{ fontSize: 12 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>
    </nav>
  )
}
