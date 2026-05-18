import React from 'react'
import { Link } from 'react-router-dom'

export default function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <React.Fragment key={i}>
            {i > 0 && <span className="breadcrumb-sep">›</span>}
            {isLast || !item.href ? (
              <span className="breadcrumb-current">{item.label}</span>
            ) : (
              <Link to={item.href}>{item.label}</Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
