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
  const H = 80
  const midY = H / 2

  const points = sorted.map((stage, i) => {
    const x = N === 1
      ? containerWidth / 2
      : ((i + 0.5) / N) * containerWidth
    const score = stage.emotions?.score ?? 5  // 1–10 scale; 5 = neutral
    const normalized = (score - 1) / 9        // 0 to 1
    const y = H - 10 - normalized * (H - 20) // inverted: high score = low y (top)
    return { x, y, positive: score >= 5 }
  })

  const pathD = points.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    const prev = points[i - 1]
    const cpX = ((prev.x + p.x) / 2).toFixed(1)
    return `${d} Q ${cpX} ${prev.y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  }, '')

  return (
    <div ref={containerRef} className="emotion-curve-wrap">
      {containerWidth > 0 && N > 0 && (
        <svg width={containerWidth} height={H} aria-label="Emotion journey curve">
          {/* Neutral midline */}
          <line
            x1={0} y1={midY}
            x2={containerWidth} y2={midY}
            stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4 4"
          />
          {/* Curve */}
          <path d={pathD} fill="none" stroke="#22c55e" strokeWidth={2} strokeLinejoin="round" />
          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x} cy={p.y} r={4}
              fill="white"
              stroke={p.positive ? '#22c55e' : '#ef4444'}
              strokeWidth={2}
            />
          ))}
        </svg>
      )}
    </div>
  )
}
