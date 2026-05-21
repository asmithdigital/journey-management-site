import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { SidebarContext } from '../../App.jsx'

function StatusBadge({ status }) {
  const labels = {
    validated: 'Validated',
    'in-progress': 'In Progress',
    discovery: 'Discovery',
    open: 'Open',
  }
  return (
    <span className={`status-tag ${status}`} style={{ fontSize: 11, cursor: 'default' }}>
      {labels[status] ?? status}
    </span>
  )
}

export default function TopBar({ journey, ancestors = [] }) {
  const { openSidebar } = useContext(SidebarContext)
  return (
    <div className="topbar">
      <button className="topbar-hamburger-btn" onClick={openSidebar} aria-label="Open menu">☰</button>
      <div className="topbar-left">
        <Link to="/" className="topbar-breadcrumb-link">Journeys</Link>
        {ancestors.map(anc => (
          <React.Fragment key={anc.id}>
            <span className="topbar-breadcrumb-sep">/</span>
            <span className="topbar-breadcrumb-link">{anc.name}</span>
          </React.Fragment>
        ))}
        <span className="topbar-breadcrumb-sep">/</span>
        <span className="topbar-breadcrumb-current">
          {journey?.name ?? 'Journey'}
        </span>
      </div>

      <div className="topbar-center" style={{ gap: 8 }}>
        <span className="topbar-title">{journey?.name ?? ''}</span>
        {journey?.status && <StatusBadge status={journey.status} />}
      </div>

      <div className="topbar-right">
        <button className="topbar-ghost-btn">ⓘ Details</button>
        <button className="topbar-ghost-btn">☆</button>
        <button className="topbar-ghost-btn">···</button>
        <div className="topbar-divider" />
        <div className="topbar-avatar">AS</div>
        <button className="topbar-ghost-btn">🕐</button>
        <button className="topbar-share-btn">↑ Share</button>
      </div>
    </div>
  )
}
