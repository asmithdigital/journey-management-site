import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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

function StatusDot({ status }) {
  return <span className={`sidebar-status-dot ${status}`} title={status} />
}

function TreeNode({ node, depth, openNodes, toggleNode, journeys }) {
  const location = useLocation()
  const hasChildren = (node.children || []).length > 0
  const hasData = !!journeys[node.id]
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
        {hasData ? (
          <NavLink
            to={`/journey/${node.id}`}
            end
            className={({ isActive: ia }) => `sidebar-tree-group-name${ia ? ' active' : ''}`}
          >
            {node.name}
          </NavLink>
        ) : (
          <span
            className="sidebar-tree-group-name"
            onClick={() => toggleNode(node.id)}
            style={{ cursor: 'pointer' }}
          >
            {node.name}
          </span>
        )}
        {jStatus && <StatusDot status={jStatus} />}
      </div>
      {isOpen && (node.children || []).map(child => (
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
  )
}

export default function Sidebar() {
  const { index, journeys } = useData()
  const [frameworksOpen, setFrameworksOpen] = useState(true)
  const [blocksOpen, setBlocksOpen] = useState(false)
  const [openNodes, setOpenNodes] = useState({})

  const hierarchy = index?.hierarchy || []

  // Default: all nodes open on first load
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
