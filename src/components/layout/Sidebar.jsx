import React, { useState, useEffect, useContext } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useData, SidebarContext } from '../../App.jsx'

const NAV_ITEMS = [
  { icon: '⌂', label: 'Home', to: '/' },
  { icon: '⌕', label: 'Search', to: '/search' },
  { icon: '✦', label: "What's New", to: '/whats-new' },
  { icon: '◎', label: 'Goals', to: '#' },
  { icon: '⊞', label: 'Data hub', to: '#' },
]

const REPOSITORY_ITEMS = [
  { icon: '◈', label: 'Insights', to: '/insights' },
  { icon: '◆', label: 'Opportunities', to: '/opportunities' },
  { icon: '✓', label: 'Solutions', to: '/solutions' },
  { icon: '◉', label: 'Personas', to: '/personas' },
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

function StatusDot({ status }) {
  return <span className={`sidebar-status-dot ${status}`} title={status} />
}

function TreeNode({ node, depth, openNodes, toggleNode, journeys }) {
  const location = useLocation()
  const { closeSidebar } = useContext(SidebarContext)
  const hasChildren = (node.children || []).length > 0
  const isOpen = openNodes[node.id] !== false
  const isActive = location.pathname === `/journey/${node.id}`
  const jStatus = journeys[node.id]?.status
  const extraPL = depth * 14

  if (!hasChildren) {
    return (
      <NavLink
        to={`/journey/${node.id}`}
        end
        className={({ isActive: ia }) => `sidebar-tree-item${ia ? ' active' : ''}`}
        style={{ paddingLeft: 22 + extraPL }}
        onClick={closeSidebar}
      >
        <span className="sidebar-tree-bullet" />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {node.name}
        </span>
        {jStatus && <StatusDot status={jStatus} />}
      </NavLink>
    )
  }

  return (
    <div>
      <div
        className={`sidebar-tree-group-row${isActive ? ' active' : ''}`}
        style={{ paddingLeft: 12 + extraPL }}
      >
        <button
          className="sidebar-tree-toggle"
          onClick={() => toggleNode(node.id)}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
        >
          {isOpen ? '▾' : '▸'}
        </button>
        <NavLink
          to={`/journey/${node.id}`}
          end
          className={({ isActive: ia }) => `sidebar-tree-group-name${ia ? ' active' : ''}`}
          onClick={closeSidebar}
        >
          {node.name}
        </NavLink>
        {jStatus && <StatusDot status={jStatus} />}
      </div>
      {isOpen && (
        <div className="sidebar-tree-children">
          {(node.children || []).map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              openNodes={openNodes}
              toggleNode={toggleNode}
              journeys={journeys}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const { index, journeys, benchmarking } = useData()
  const { sidebarOpen, closeSidebar } = useContext(SidebarContext)
  const location = useLocation()

  const [frameworksOpen, setFrameworksOpen] = useState(true)
  const [repositoryOpen, setRepositoryOpen] = useState(true)
  const [blocksOpen, setBlocksOpen] = useState(false)
  const [openNodes, setOpenNodes] = useState({})

  const isBenchmarking = location.pathname.startsWith('/metrics-dashboard')
  const hierarchy = index?.hierarchy || []
  const products = benchmarking?.products || []

  useEffect(() => {
    if (hierarchy.length > 0 && Object.keys(openNodes).length === 0) {
      const defaults = {}
      function setDefaults(nodes) {
        nodes.forEach(n => {
          defaults[n.id] = true
          if (n.children) setDefaults(n.children)
        })
      }
      setDefaults(hierarchy)
      setOpenNodes(defaults)
    }
  }, [hierarchy])

  function toggleNode(id) {
    setOpenNodes(prev => ({ ...prev, [id]: prev[id] === false ? true : false }))
  }

  return (
    <>
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} aria-hidden="true" />
      )}
      <nav className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>

        {/* Workspace */}
        <div className="sidebar-workspace">
          <div className="sidebar-workspace-info">
            <div className="sidebar-workspace-name">asmith digital</div>
            <div className="sidebar-workspace-sub">Workspace</div>
          </div>
          <div className="sidebar-workspace-actions">
            <button className="sidebar-close-btn" onClick={closeSidebar} aria-label="Close menu">✕</button>
            <button className="sidebar-icon-btn" title="Menu">▾</button>
            <button className="sidebar-icon-btn" title="New">⊞</button>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="sidebar-mode-toggle">
          <Link
            to="/"
            className={`sidebar-mode-btn${!isBenchmarking ? ' mode-active-journey' : ''}`}
            onClick={closeSidebar}
          >
            ⌂ Journey Maps
          </Link>
          <Link
            to="/metrics-dashboard"
            className={`sidebar-mode-btn${isBenchmarking ? ' mode-active-bench' : ''}`}
            onClick={closeSidebar}
          >
            ▣ Metrics Dashboard
          </Link>
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
                onClick={closeSidebar}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            )
          ))}
        </div>

        {isBenchmarking ? (
          /* ── Metrics Dashboard sidebar ────────────────── */
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span className="sidebar-section-label" style={{ color: '#C96C00' }}>UX Benchmarking</span>
            </div>
            {products.map(product => {
              const rounds = product.uxBenchmarks.rounds
              const latest = rounds[rounds.length - 1]
              const isActive = location.pathname === `/metrics-dashboard/${product.id}`
              return (
                <NavLink
                  key={product.id}
                  to={`/metrics-dashboard/${product.id}`}
                  className={() => `sidebar-tree-item${isActive ? ' bench-active' : ''}`}
                  style={{ paddingLeft: 22 }}
                  onClick={closeSidebar}
                >
                  <span className="sidebar-tree-bullet" style={{ background: isActive ? '#ea8600' : undefined }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
                    {product.name}
                  </span>
                  {latest && (
                    <span style={{ fontSize: 10, color: '#5E6C84', flexShrink: 0 }}>
                      {latest.metrics.msat.value}/5
                    </span>
                  )}
                </NavLink>
              )
            })}
          </div>
        ) : (
          /* ── Journey sidebar ──────────────────────────── */
          <>
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
                <TreeNode
                  key={top.id}
                  node={top}
                  depth={0}
                  openNodes={openNodes}
                  toggleNode={toggleNode}
                  journeys={journeys}
                />
              ))}
            </div>

            {/* Repository */}
            <div className="sidebar-section">
              <div className="sidebar-section-header">
                <span className="sidebar-section-label">Repository</span>
                <div className="sidebar-section-actions">
                  <button
                    className="sidebar-icon-btn"
                    onClick={() => setRepositoryOpen(o => !o)}
                    title="Collapse"
                  >
                    {repositoryOpen ? '▾' : '▸'}
                  </button>
                </div>
              </div>
              {repositoryOpen && REPOSITORY_ITEMS.map(item => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) => `sidebar-tree-item${isActive ? ' active' : ''}`}
                  style={{ paddingLeft: 22 }}
                  onClick={closeSidebar}
                >
                  <span className="sidebar-nav-icon" style={{ fontSize: 12, marginRight: 6 }}>{item.icon}</span>
                  {item.label}
                </NavLink>
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
          </>
        )}

        <div className="sidebar-spacer" />

        {/* Platform cross-links */}
        <div className="sidebar-platforms">
          <div className="sidebar-section-label" style={{ padding: '0 12px 6px 20px', display: 'block' }}>Platforms</div>
          <a
            href="https://asmithdigital.github.io/design-system-site/"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-platform-link"
          >
            <span className="sidebar-nav-icon" style={{ fontSize: 12 }}>◈</span>
            Apiary Design System
            <span className="sidebar-platform-arrow">↗</span>
          </a>
          <a
            href="https://asmithdigital.github.io/raa-prototype-platform/"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-platform-link"
          >
            <span className="sidebar-nav-icon" style={{ fontSize: 12 }}>⊞</span>
            Prototype Platform
            <span className="sidebar-platform-arrow">↗</span>
          </a>
          <a
            href="https://asmithdigital.github.io/journey-management-site/"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-platform-link"
          >
            <span className="sidebar-nav-icon" style={{ fontSize: 12 }}>⌂</span>
            Journey Management
            <span className="sidebar-platform-arrow">↗</span>
          </a>
        </div>

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
    </>
  )
}
