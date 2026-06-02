"use client"

import React, { useMemo, useState } from "react"
import { motion } from "motion/react"
import { format, parseISO } from "date-fns"

interface TrendDataPoint {
  date: string // YYYY-MM-DD
  rate: number // 0 to 100
}

interface TrendChartProps {
  data: TrendDataPoint[]
}

export function TrendChart({ data }: TrendChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<TrendDataPoint | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const width = 500
  const height = 200
  const paddingLeft = 40
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 30

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  // Generate SVG path coordinate points
  const points = useMemo(() => {
    if (data.length === 0) return []

    return data.map((d, index) => {
      const x = paddingLeft + (index / Math.max(1, data.length - 1)) * chartWidth
      // Invert Y so 100% is at the top (paddingTop) and 0% is at the bottom (height - paddingBottom)
      const y = paddingTop + chartHeight - (d.rate / 100) * chartHeight
      return { x, y, date: d.date, rate: d.rate }
    })
  }, [data, chartWidth, chartHeight])

  // Build the line path
  const linePath = useMemo(() => {
    if (points.length === 0) return ""
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  }, [points])

  // Build the area path (closes the shape at the bottom axis for gradient fill)
  const areaPath = useMemo(() => {
    if (points.length === 0) return ""
    const firstPoint = points[0]
    const lastPoint = points[points.length - 1]
    const bottomY = height - paddingBottom
    return `${linePath} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`
  }, [points, linePath])

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (points.length === 0) return
    const svgRect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - svgRect.left
    // Project mouse X coordinate back to SVG coordinate space
    const relativeX = (mouseX / svgRect.width) * width

    // Find the closest point
    let closestIndex = 0
    let minDiff = Infinity
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - relativeX)
      if (diff < minDiff) {
        minDiff = diff
        closestIndex = idx
      }
    })

    setHoveredPoint(data[closestIndex])
    setHoverIndex(closestIndex)
  }

  const handleMouseLeave = () => {
    setHoveredPoint(null)
    setHoverIndex(null)
  }

  // Generate ticks for Y-axis (0%, 25%, 50%, 75%, 100%)
  const yTicks = [0, 25, 50, 75, 100]

  // Generate ticks for X-axis (4 distributed dates)
  const xTicks = useMemo(() => {
    if (data.length < 2) return []
    const indices = [
      0,
      Math.floor(data.length * 0.33),
      Math.floor(data.length * 0.66),
      data.length - 1,
    ]
    return indices.map((idx) => {
      const point = points[idx]
      let dateLabel = ""
      try {
        dateLabel = format(parseISO(point.date), "MMM d")
      } catch {
        dateLabel = point.date
      }
      return { x: point.x, label: dateLabel }
    })
  }, [data, points])

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Completion Trend
        </h3>
        {hoveredPoint ? (
          <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand animate-fade-in">
            {format(parseISO(hoveredPoint.date), "MMMM d")}: {Math.round(hoveredPoint.rate)}% completed
          </div>
        ) : (
          <div className="text-xs text-muted-foreground/60 italic">
            Hover path for details
          </div>
        )}
      </div>

      <div className="glass rounded-xl p-4 border border-border">
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No data available for this range
          </div>
        ) : (
          <div className="w-full h-[200px]">
            <svg
              className="w-full h-full cursor-crosshair overflow-visible"
              viewBox={`0 0 ${width} ${height}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                {/* Brand gradient for the line */}
                <linearGradient id="trendLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--brand)" />
                  <stop offset="100%" stopColor="var(--brand-2)" />
                </linearGradient>

                {/* Smooth fade-to-transparent gradient for the area underneath */}
                <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid Lines (Horizontal) */}
              {yTicks.map((tick) => {
                const y = paddingTop + chartHeight - (tick / 100) * chartHeight
                return (
                  <g key={tick} className="opacity-10 dark:opacity-[0.06]">
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="currentColor"
                      strokeWidth={1}
                      strokeDasharray={tick !== 0 ? "4 4" : undefined}
                    />
                  </g>
                )
              })}

              {/* Y Axis labels */}
              {yTicks.map((tick) => {
                const y = paddingTop + chartHeight - (tick / 100) * chartHeight
                return (
                  <text
                    key={tick}
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-muted-foreground/60 text-[10px] font-medium font-mono"
                  >
                    {tick}%
                  </text>
                )
              })}

              {/* Area path */}
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                d={areaPath}
                fill="url(#trendAreaGradient)"
              />

              {/* Line path */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                d={linePath}
                fill="none"
                stroke="url(#trendLineGradient)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* X Axis Labels */}
              {xTicks.map((tick, i) => (
                <text
                  key={i}
                  x={tick.x}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-muted-foreground/60 text-[10px] font-medium"
                >
                  {tick.label}
                </text>
              ))}

              {/* Interactive Hover Indicators */}
              {hoverIndex !== null && points[hoverIndex] && (
                <g>
                  {/* Vertical Guide Line */}
                  <line
                    x1={points[hoverIndex].x}
                    y1={paddingTop}
                    x2={points[hoverIndex].x}
                    y2={height - paddingBottom}
                    className="stroke-brand/20 dark:stroke-brand/35"
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                  />

                  {/* Pulsing Outer Ring */}
                  <circle
                    cx={points[hoverIndex].x}
                    cy={points[hoverIndex].y}
                    r={8}
                    fill="none"
                    className="stroke-brand/30 fill-none"
                    strokeWidth={1.5}
                  />

                  {/* Inner Dot */}
                  <circle
                    cx={points[hoverIndex].x}
                    cy={points[hoverIndex].y}
                    r={4}
                    fill="var(--brand)"
                    className="stroke-card"
                    strokeWidth={1.5}
                  />
                </g>
              )}
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
