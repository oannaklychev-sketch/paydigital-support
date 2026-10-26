export function WallLayer({ length }: { length: number }) {
  return (
    <div className="wall" style={{ width: length }}>
      <div className="wall__strip" />
    </div>
  )
}

function Plant({ x, scale = 1 }: { x: number; scale?: number }) {
  return (
    <svg className="decor decor--plant" style={{ left: x, scale }} viewBox="0 0 120 200" aria-hidden="true">
      <path d="M38 200 L44 150 H76 L82 200 Z" fill="#221a35" />
      <rect x="40" y="146" width="40" height="8" rx="3" fill="#2d2545" />
      {[
        'M60 150 C40 120 20 110 8 80 C30 86 52 104 60 150',
        'M60 150 C80 116 98 104 114 70 C90 80 70 100 60 150',
        'M60 150 C50 100 44 70 52 26 C66 60 68 100 60 150',
        'M60 150 C70 110 82 86 100 40 C102 80 82 116 60 150',
        'M60 150 C46 120 30 96 22 46 C44 72 56 110 60 150',
      ].map((d) => (
        <path key={d} d={d} fill="#173a3a" stroke="#2c6b62" strokeWidth="1.5" />
      ))}
    </svg>
  )
}

function Screen({ x }: { x: number }) {
  return (
    <svg className="decor decor--screen" style={{ left: x }} viewBox="0 0 220 130" aria-hidden="true">
      <rect x="1" y="1" width="218" height="128" rx="10" fill="#0d0a1a" stroke="#2e2550" strokeWidth="2" />
      <rect x="14" y="14" width="80" height="8" rx="4" fill="#a78bfa" opacity="0.7" />
      <rect x="14" y="30" width="50" height="6" rx="3" fill="#9a93b3" opacity="0.5" />
      {[38, 62, 46, 80, 58, 92, 70].map((h, i) => (
        <rect key={i} x={110 + i * 14} y={116 - h} width="9" height={h} rx="2" fill={i === 5 ? '#a78bfa' : '#7c3aed'} opacity={0.75} />
      ))}
      <polyline points="14,104 34,92 54,98 74,78 94,84" fill="none" stroke="#3dffa8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="200" cy="18" r="4" fill="#3dffa8" />
    </svg>
  )
}

function Lamp({ x }: { x: number }) {
  return (
    <div className="decor decor--lamp" style={{ left: x }} aria-hidden="true">
      <span className="lamp__cord" />
      <span className="lamp__shade" />
      <span className="lamp__light" />
    </div>
  )
}

export function MidLayer({ length, step }: { length: number; step: number }) {
  const count = Math.ceil(length / step) + 1
  return (
    <div className="mid" style={{ width: length }}>
      {Array.from({ length: count }, (_, i) => {
        const x = i * step
        const kind = i % 3
        if (kind === 0) return <Plant key={i} x={x} />
        if (kind === 1) return <Screen key={i} x={x} />
        return <Lamp key={i} x={x} />
      })}
      {Array.from({ length: count }, (_, i) => (i % 3 === 1 ? <Lamp key={`l${i}`} x={i * step + step * 0.5} /> : null))}
    </div>
  )
}

export function ForeLayer({ length, step }: { length: number; step: number }) {
  const count = Math.ceil(length / step) + 1
  return (
    <div className="fore" style={{ width: length }}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="fore__leaf" style={{ left: i * step, rotate: `${i % 2 ? 24 : -18}deg` }} />
      ))}
    </div>
  )
}
