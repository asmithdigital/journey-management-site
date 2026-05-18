import React from 'react'

export default function SeverityBadge({ severity }) {
  return (
    <span className={`severity-badge ${severity}`}>
      {severity}
    </span>
  )
}
