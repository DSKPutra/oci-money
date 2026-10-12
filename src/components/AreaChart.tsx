interface AreaChartProps {
  points: { x: number; y: number }[]
  className?: string
}

export function AreaChart({ points, className = '' }: AreaChartProps) {
  if (points.length < 2) return null

  const width = 600
  const height = 160
  const pad = 4
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const spanX = maxX - minX || 1
  const spanY = maxY - minY || 1

  const coords = points.map((p) => [
    pad + ((p.x - minX) / spanX) * (width - pad * 2),
    height - pad - ((p.y - minY) / spanY) * (height - pad * 2),
  ])
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)} ${height} L${coords[0][0].toFixed(1)} ${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      role="img"
      aria-label="Total value locked trend chart"
    >
      <defs>
        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#00E599" stopOpacity="0.35" />
          <stop offset="1" stopColor="#00E599" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#area-fill)" />
      <path d={line} fill="none" stroke="#00E599" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
