'use client'

import { useEffect, useRef } from 'react'

interface Node {
  id: string
  label: string
  cx: number
  cy: number
  active: boolean
}

const NODES: Node[] = [
  { id: 'uae', label: 'UAE', cx: 200, cy: 120, active: true },
  { id: 'bhr', label: 'BHR', cx: 280, cy: 160, active: true },
  { id: 'ksa', label: 'KSA', cx: 140, cy: 200, active: false },
  { id: 'egy', label: 'EGY', cx: 60, cy: 140, active: false },
  { id: 'kwt', label: 'KWT', cx: 240, cy: 60, active: false },
  { id: 'qat', label: 'QAT', cx: 320, cy: 100, active: false },
]

const EDGES: [string, string][] = [
  ['uae', 'bhr'],
  ['uae', 'ksa'],
  ['uae', 'kwt'],
  ['uae', 'qat'],
  ['bhr', 'ksa'],
  ['egy', 'ksa'],
  ['egy', 'uae'],
  ['qat', 'bhr'],
]

export function MenaNetwork() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const lines = svg.querySelectorAll('.edge-line')
    lines.forEach((line, i) => {
      const el = line as SVGLineElement
      const length = Math.sqrt(
        Math.pow(parseFloat(el.getAttribute('x2') ?? '0') - parseFloat(el.getAttribute('x1') ?? '0'), 2) +
        Math.pow(parseFloat(el.getAttribute('y2') ?? '0') - parseFloat(el.getAttribute('y1') ?? '0'), 2)
      )
      el.style.strokeDasharray = `${length}`
      el.style.strokeDashoffset = `${length}`
      el.style.animation = `drawLine 1.5s ease ${i * 0.15}s forwards`
    })
  }, [])

  const nodeMap = new Map(NODES.map((n) => [n.id, n]))

  return (
    <div className="relative w-[380px] h-[280px]">
      <style>{`
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulse-node {
          0%, 100% { r: 6; opacity: 1; }
          50% { r: 8; opacity: 0.8; }
        }
      `}</style>
      <svg
        ref={svgRef}
        viewBox="0 0 380 280"
        fill="none"
        className="w-full h-full"
        aria-label="MENA regulatory network map showing UAE and Bahrain as active nodes"
        role="img"
      >
        {/* Edges */}
        {EDGES.map(([from, to]) => {
          const a = nodeMap.get(from)!
          const b = nodeMap.get(to)!
          const isActive = a.active && b.active
          return (
            <line
              key={`${from}-${to}`}
              className="edge-line"
              x1={a.cx}
              y1={a.cy}
              x2={b.cx}
              y2={b.cy}
              stroke={isActive ? 'var(--gold)' : 'var(--border)'}
              strokeWidth={isActive ? 1.5 : 0.8}
              opacity={isActive ? 0.7 : 0.3}
            />
          )
        })}

        {/* Nodes */}
        {NODES.map((node) => (
          <g key={node.id}>
            {node.active && (
              <circle
                cx={node.cx}
                cy={node.cy}
                r="18"
                fill="var(--gold)"
                opacity="0.06"
              />
            )}
            <circle
              cx={node.cx}
              cy={node.cy}
              r="6"
              fill={node.active ? 'var(--gold)' : 'var(--text-faint)'}
              style={node.active ? { animation: 'pulse-node 3s ease-in-out infinite' } : undefined}
            />
            <text
              x={node.cx}
              y={node.cy + 22}
              textAnchor="middle"
              fill={node.active ? 'var(--gold)' : 'var(--text-muted)'}
              fontSize="11"
              fontFamily="var(--font-mono)"
              fontWeight={node.active ? 700 : 400}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
