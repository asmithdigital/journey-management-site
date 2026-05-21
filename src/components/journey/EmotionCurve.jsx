import React, { useRef, useState, useEffect } from 'react'

export default function EmotionCurve({ stages }) {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)

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
    const x = N === 1
      ? containerWidth / 2
      : ((i + 0.5) / N) * containerWidth
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

  return (
    <div ref={containerRef} className="emotion-curve-wrap">
      {containerWidth > 0 && N > 0 && (
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
        </svg>
      )}
    </div>
  )
}
