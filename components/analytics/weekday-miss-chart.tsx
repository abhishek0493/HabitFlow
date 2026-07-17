"use client"

import React, { useMemo, useState } from "react"
import { motion } from "motion/react"
import { AlertCircle } from "lucide-react"

interface Habit {
  id: string
  name: string
  color: string
  emoji?: string | null
}

interface LogEntry {
  habitId: string
  date: string // YYYY-MM-DD
  completed: boolean
}

interface WeekdayMissChartProps {
  habits: Habit[]
  logs: LogEntry[]
  dates: string[] // List of all dates in the selected time range
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function WeekdayMissChart({ habits, logs, dates }: WeekdayMissChartProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string>("all")

  // Calculate miss rates for each weekday (0 = Mon, 6 = Sun)
  const weekdayData = useMemo(() => {
    // Initialize counters
    const totalDaysByWeekday = Array(7).fill(0)
    const completedDaysByWeekday = Array(7).fill(0)

    // First count how many of each weekday occur in our dates array
    dates.forEach((dateStr) => {
      // Create date object (UTC parse to match Date storage)
      const date = new Date(`${dateStr}T00:00:00.000Z`)
      const rawDay = date.getUTCDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
      // Shift so 0 = Mon, ..., 6 = Sun
      const shiftedDay = rawDay === 0 ? 6 : rawDay - 1
      totalDaysByWeekday[shiftedDay]++
    })

    // Create a completion lookup table for fast checking
    const completionMap = new Set(
      logs.filter(l => l.completed).map(l => `${l.habitId}:${l.date}`)
    )

    // Track active habits for each date in range to know expected completions
    dates.forEach((dateStr) => {
      const date = new Date(`${dateStr}T00:00:00.000Z`)
      const rawDay = date.getUTCDay()
      const shiftedDay = rawDay === 0 ? 6 : rawDay - 1

      habits.forEach((habit) => {
        // Only count if it's "all" habits or specifically the selected habit
        if (selectedHabitId !== "all" && habit.id !== selectedHabitId) {
          return
        }

        // To ensure we don't count days before a habit's creation (if we want to be precise)
        // However, for this aggregation, we can simply inspect logs and count
        const completed = completionMap.has(`${habit.id}:${dateStr}`)
        if (completed) {
          completedDaysByWeekday[shiftedDay]++
        }
      })
    })

    // Compute miss rates
    return WEEKDAYS.map((name, index) => {
      // Total opportunities: occurrences of this day * habits tracked
      const habitsCount = selectedHabitId === "all" ? habits.length : 1
      const totalOpportunities = totalDaysByWeekday[index] * habitsCount

      const completed = completedDaysByWeekday[index]
      const missed = Math.max(0, totalOpportunities - completed)
      const missRate = totalOpportunities > 0 ? (missed / totalOpportunities) * 100 : 0

      return {
        day: name,
        missRate,
        missedCount: missed,
        totalCount: totalOpportunities,
      }
    })
  }, [habits, logs, dates, selectedHabitId])

  // Find the day with the highest miss rate
  const worstDay = useMemo(() => {
    const activeDays = weekdayData.filter((d) => d.totalCount > 0)
    if (activeDays.length === 0) return null
    
    // Sort descending by missRate
    const sorted = [...activeDays].sort((a, b) => b.missRate - a.missRate)
    const candidate = sorted[0]
    
    return candidate && candidate.missRate > 10 ? candidate : null
  }, [weekdayData])

  // SVG parameters
  const width = 500
  const height = 220
  const paddingLeft = 40
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 30

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom
  const barWidth = 32
  const gap = (chartWidth - barWidth * 7) / 6

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Weekly Miss Pattern
        </h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="habit-filter" className="text-xs text-muted-foreground whitespace-nowrap">
            Focus:
          </label>
          <select
            id="habit-filter"
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            className="h-8 flex-1 rounded-md border-2 border-border bg-card px-2.5 py-1 text-xs font-semibold shadow-[2px_2px_0_color-mix(in_oklch,var(--foreground)_10%,transparent)] transition-all focus:outline-none focus:ring-2 focus:ring-brand/35 sm:flex-initial"
          >
            <option value="all">All Habits (Combined)</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.emoji ? `${h.emoji} ` : ""}{h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="premium-panel kinetic-card flex flex-col gap-4 rounded-xl p-4">
        {/* Insight callout */}
        {worstDay && worstDay.missRate > 20 && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Attention needed:</span> You consistently miss tracking on{" "}
              <span className="font-bold underline">{worstDay.day}s</span> (
              {Math.round(worstDay.missRate)}% miss rate). Try adjusting your environment or setting a reminder for these days.
            </div>
          </div>
        )}

        {habits.length === 0 ? (
          <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">
            No habits to analyze
          </div>
        ) : (
          <div className="w-full h-[150px]">
            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
              {/* Y Axis line and ticks */}
              {[0, 25, 50, 75, 100].map((tick) => {
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
                      strokeDasharray="4 4"
                    />
                  </g>
                )
              })}

              {/* Y Axis percentage labels */}
              {[0, 50, 100].map((tick) => {
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

              {/* Columns for each weekday */}
              {weekdayData.map((data, index) => {
                const x = paddingLeft + index * (barWidth + gap)
                const barHeight = (data.missRate / 100) * chartHeight
                const y = paddingTop + chartHeight - barHeight

                // Determine bar color based on miss rate severity
                const isWorst = worstDay && worstDay.day === data.day
                const barColor = isWorst
                  ? "var(--destructive)"
                  : "var(--brand)"

                return (
                  <g key={data.day} className="group">
                    {/* Background track */}
                    <rect
                      x={x}
                      y={paddingTop}
                      width={barWidth}
                      height={chartHeight}
                      className="fill-muted/20"
                      rx={4}
                    />

                    {/* Miss Rate Fill Column */}
                    <motion.rect
                      initial={{ height: 0, y: paddingTop + chartHeight }}
                      animate={{ height: barHeight, y }}
                      transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
                      x={x}
                      width={barWidth}
                      className="rounded-md"
                      fill={barColor}
                      opacity={data.missRate > 0 ? (isWorst ? 0.95 : 0.75) : 0}
                      rx={4}
                    />

                    {data.missRate > 0 && (
                      <motion.rect
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.1, 0.45, 0.1] }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          delay: index * 0.08,
                        }}
                        x={x}
                        y={Math.max(y - 8, paddingTop)}
                        width={barWidth}
                        height={Math.min(8, barHeight)}
                        fill={barColor}
                        rx={4}
                      />
                    )}

                    {/* Percentage on top of active bar (hover or always if height permits) */}
                    {data.missRate > 10 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        textAnchor="middle"
                        className="fill-foreground font-mono text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        {Math.round(data.missRate)}%
                      </text>
                    )}

                    {/* Weekday Label */}
                    <text
                      x={x + barWidth / 2}
                      y={height - 8}
                      textAnchor="middle"
                      className={`text-[10px] font-semibold ${
                        isWorst
                          ? "fill-destructive font-bold"
                          : "fill-muted-foreground/80 font-medium"
                      }`}
                    >
                      {data.day}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
