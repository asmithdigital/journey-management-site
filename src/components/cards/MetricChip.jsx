import React from 'react'

export default function MetricChip({ name, value }) {
  return (
    <div className="metric-chip">
      <div className="metric-chip-name">{name}</div>
      {value != null ? (
        <div className="metric-chip-value">{value}</div>
      ) : (
        <>
          <div className="metric-chip-value">—</div>
          <div className="metric-chip-nodata">no data</div>
        </>
      )}
    </div>
  )
}
