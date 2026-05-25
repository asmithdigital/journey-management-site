import React, { useRef, useState, useEffect } from 'react'

export default function EmotionCurve({ stages, personaLines = [] }) {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setContainerWidth(el.clientWidth)
    const observer = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width
      if (w > 0) setContainerWidth(w)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const sorted = [...stages].sort((a, b) => a.order - b.order)
  const N = sorted.length
  const H = 120
  const PAD = 16
  const midY = H / 2

  const points = sorted.map((stage, i) => {
    const x = N === 1 ? containerWidth / 2 : ((i + 0.5) / N) * containerWidth
    const score = stage.emotions?.score ?? 5
    const normalized = (score - 1) / 9
    const y = PAD + (1 - normalized) * (H - PAD * 2)
    return { x, y, positive: score >= 5 }
  })

  const pathD = points.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    const prev = points[i - 1]
    const cpX = ((prev.x + p.x) / 2).toFixed(1)
    return `${d} Q ${cpX} ${prev.y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  }, '')

  const areaD = N > 0
    ? `${pathD} L ${points[N - 1].x.toFixed(1)} ${midY} L ${points[0].x.toFixed(1)} ${midY} Z`
    : ''

  const computedPersonaLines = personaLines.map(pl => {
    const pts = sorted.map((stage, i) => {
      const entry = (pl.data || []).find(d => d.stageId === stage.id)
      if (!entry) return null
      const x = N === 1 ? containerWidth / 2 : ((i + 0.5) / N) * containerWidth
      const score = entry.score
      const normalized = (score - 1) / 9
      const y = PAD + (1 - normalized) * (H - PAD * 2)
      return { x, y, score, note: entry.note }
    }).filter(Boolean)

    const pPathD = pts.reduce((d, p, i) => {
      if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
      const prev = pts[i - 1]
      const cpX = ((prev.x + p.x) / 2).toFixed(1)
      return `${d} Q ${cpX} ${prev.y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    }, '')

    return { ...pl, pts, pPathD }
  })

  return (
    <div ref={containerRef} className="emotion-curve-wrap" style={{ position: 'relative' }}>
      {containerWidth > 0 && N > 0 && (
        <>
          <svg width={containerWidth} height={H} aria-label="Emotion journey curve">
            <defs>
              <linearGradient id="emotion-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#36B37E" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#36B37E" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#emotion-grad)" stroke="none" />
            <line
              x1={0} y1={midY}
              x2={containerWidth} y2={midY}
              stroke="#C1C7D0" strokeWidth={1} strokeDasharray="5 4"
            />
            <path d={pathD} fill="none" stroke="#36B37E" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x} cy={p.y} r={5}
                fill="white"
                stroke={p.positive ? '#36B37E' : '#FF5630'}
                strokeWidth={2}
              />
            ))}
            {computedPersonaLines.map(pl => (
              pl.pts.length > 0 && (
                <g key={pl.id}>
                  {pl.pts.length > 1 && (
                    <path
                      d={pl.pPathD}
                      fill="none"
                      stroke={pl.color}
                      strokeWidth={1.5}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeDasharray="5 3"
                      opacity={0.9}
                    />
                  )}
                  {pl.pts.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x} cy={p.y} r={4}
                      fill="white"
                      stroke={pl.color}
                      strokeWidth={2}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setTooltip({ x: p.x, y: p.y, name: pl.name, score: p.score, note: p.note, color: pl.color })}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </g>
              )
            ))}
          </svg>
          {tooltip && (
            <div style={{
              position: 'absolute',
              left: Math.min(tooltip.x + 10, containerWidth - 215),
              top: Math.max(0, tooltip.y - 72),
              background: 'white',
              border: `1.5px solid ${tooltip.color}`,
              borderRadius: 6,
              padding: '8px 10px',
              fontSize: 11,
              boxShadow: '0 2px 10px rgba(0,0,0,0.13)',
              pointerEvents: 'none',
              zIndex: 20,
              maxWidth: 205,
              lineHeight: 1.5,
            }}>
              <div style={{ fontWeight: 700, color: tooltip.color, marginBottom: 2 }}>{tooltip.name}</div>
              <div style={{ color: '#42526E' }}>Score: <strong>{tooltip.score}/10</strong></div>
              {tooltip.note && <div style={{ color: '#5E6C84', marginTop: 3 }}>{tooltip.note}</div>}
            </div>
          )}
        </>
      )}
    </div>
  )
}
