import React from 'react'
import { Link } from 'react-router-dom'

export default function TopBar({ journey, parentName }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <Link to="/" className="topbar-breadcrumb-link">Journeys</Link>
        <span className="topbar-breadcrumb-sep">/</span>
        {parentName && (
          <>
            <Link to="/" className="topbar-breadcrumb-link">{parentName}</Link>
            <span className="topbar-breadcrumb-sep">/</span>
          </>
        )}
        <span className="topbar-breadcrumb-current">
          {journey?.name ?? 'Journey'}
        </span>
      </div>

      <div className="topbar-center">
        <span className="topbar-title">{journey?.name ?? ''}</span>
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
