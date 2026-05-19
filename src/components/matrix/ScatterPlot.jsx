import React, { useRef, useState, useEffect } from 'react'

const PLOT_PADDING = { left: 72, right: 40, top: 40, bottom: 52 }

function StatusTag({ status }) {
  const label = {
    open: 'Open',
    validated: 'Validated',
    'in-progress': 'In Progress',
    solved: 'Solved',
  }[status] ?? 'Open'
  return <span className={`status-tag ${status}`}>{label}</span>
}

export default function ScatterPlot({ opportunities }) {
  const containerRef = useRef(null)
  const [dims, setDims] = useState({ w: 800, h: 500 })
  const [hoveredId, setHoveredId] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      setDims({ w: el.clientWidth, h: el.clientHeight })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { w, h } = dims
  const pl = PLOT_PADDING.left
  const pr = PLOT_PADDING.right
  const pt = PLOT_PADDING.top
  const pb = PLOT_PADDING.bottom
  const plotW = w - pl - pr
  const plotH = h - pt - pb

  const plotX = (v) => pl + (v / 100) * plotW
  const plotY = (v) => pt + ((100 - v) / 100) * plotH
  const radius = (opp) => Math.min(44, Math.max(18, 18 + opp.stepsLinked * 7))

  const gridLines = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

  if (opportunities.length === 0) {
    return (
      <div ref={containerRef} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>No opportunities to display</span>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="scatter-plot-area">
      <svg className="scatter-plot-svg" aria-label="Opportunity matrix scatter plot">
        {/* Grid lines */}
        {gridLines.map(v => (
          <g key={`grid-${v}`}>
            <line
              x1={plotX(v)} y1={pt}
              x2={plotX(v)} y2={pt + plotH}
              stroke="#f3f4f6" strokeWidth={1}
            />
            <line
              x1={pl} y1={plotY(v)}
              x2={pl + plotW} y2={plotY(v)}
              stroke="#f3f4f6" strokeWidth={1}
            />
          </g>
        ))}

        {/* Axes */}
        <line x1={pl} y1={pt + plotH} x2={pl + plotW} y2={pt + plotH} stroke="#e5e7eb" strokeWidth={1.5} />
        <line x1={pl} y1={pt} x2={pl} y2={pt + plotH} stroke="#e5e7eb" strokeWidth={1.5} />

        {/* X axis labels */}
        {[0, 20, 40, 60, 80, 100].map(v => (
          <text
            key={`xl-${v}`}
            x={plotX(v)} y={pt + plotH + 18}
            textAnchor="middle"
            fontSize={11}
            fill="#9b9b9b"
          >
            {v}
          </text>
        ))}

        {/* Y axis labels */}
        {[0, 20, 40, 60, 80, 100].map(v => (
          <text
            key={`yl-${v}`}
            x={pl - 10} y={plotY(v) + 4}
            textAnchor="end"
            fontSize={11}
            fill="#9b9b9b"
          >
            {v}
          </text>
        ))}

        {/* Axis titles */}
        <text
          x={pl + plotW / 2} y={pt + plotH + 40}
          textAnchor="middle"
          fontSize={12}
          fill="#6b6b6b"
        >
          Business Value →
        </text>
        <text
          x={18} y={pt + plotH / 2}
          textAnchor="middle"
          fontSize={12}
          fill="#6b6b6b"
          transform={`rotate(-90, 18, ${pt + plotH / 2})`}
        >
          Customer Value →
        </text>

        {/* Circles */}
        {opportunities.map(opp => {
          const cx = plotX(opp.businessValue)
          const cy = plotY(opp.customerValue)
          const r = radius(opp)
          const isHovered = hoveredId === opp.id
          const shortTitle = opp.title.length > 26 ? opp.title.slice(0, 25) + '…' : opp.title

          return (
            <g key={opp.id}>
              <circle
                cx={cx} cy={cy} r={r}
                fill="rgba(139,92,246,0.08)"
                stroke={isHovered ? '#5b21b6' : '#8b5cf6'}
                strokeWidth={isHovered ? 2 : 1.5}
                style={{ cursor: 'pointer', transition: 'stroke 0.12s, stroke-width 0.12s' }}
                onMouseEnter={e => {
                  setHoveredId(opp.id)
                  setTooltip({ opp, x: cx, y: cy, r })
                }}
                onMouseLeave={() => {
                  setHoveredId(null)
                  setTooltip(null)
                }}
              />
              <text
                x={cx} y={cy + r + 14}
                textAnchor="middle"
                fontSize={11}
                fill="#4b5563"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {shortTitle}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (() => {
        const { opp, x, y, r } = tooltip
        const tipW = 210
        const tipH = 90
        const tipX = Math.min(w - tipW - 8, Math.max(8, x - tipW / 2))
        const tipY = y - r - tipH - 10 < pt ? y + r + 10 : y - r - tipH - 10

        return (
          <div
            className="scatter-tooltip"
            style={{ left: tipX, top: tipY }}
          >
            <div className="scatter-tooltip-title">{opp.title}</div>
            <div className="scatter-tooltip-values">
              Business: {opp.businessValue} &nbsp;|&nbsp; Customer: {opp.customerValue}
            </div>
            <div className="scatter-tooltip-meta" style={{ marginBottom: 6 }}>
              Steps linked: {opp.stepsLinked}
            </div>
            <StatusTag status={opp.status} />
          </div>
        )
      })()}
    </div>
  )
}
