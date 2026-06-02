"use client"

import React, { useMemo } from "react"
import { motion } from "motion/react"

interface Habit {
  id: string
  name: string
  color: string
  emoji?: string | null
}

interface LogEntry {
  habitId: string
  date: string
  completed: boolean
}

interface ComparisonChartProps {
  habits: Habit[]
  logs: LogEntry[]
  dates: string[] // List of dates in range
}

interface HabitComparisonData {
  id: string
  name: string
  emoji?: string | null
  color: string
  completionRate: number
  completionsCount: number
  totalDays: number
}

export function ComparisonChart({ habits, logs, dates }: ComparisonChartProps) {
  const comparisonData = useMemo<HabitComparisonData[]>(() => {
    const totalDays = dates.length
    if (totalDays === 0) return []

    // Completion lookup map
    const completionCountMap = new Map<string, number>()
    logs.forEach((log) => {
      if (log.completed && dates.includes(log.date)) {
        completionCountMap.set(
          log.habitId,
          (completionCountMap.get(log.habitId) || 0) + 1
        )
      }
    })

    return habits.map((habit) => {
      const completionsCount = completionCountMap.get(habit.id) || 0
      const completionRate = (completionsCount / totalDays) * 100

      return {
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        color: habit.color,
        completionRate,
        completionsCount,
        totalDays,
      }
    }).sort((a, b) => b.completionRate - a.completionRate) // Sort by highest completion rate
  }, [habits, logs, dates])

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Habit Performance
        </h3>
        <span className="text-xs text-muted-foreground">
          Sorted by success rate
        </span>
      </div>

      <div className="premium-panel kinetic-card flex flex-col gap-5 rounded-xl p-5">
        {comparisonData.length === 0 ? (
          <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">
            No habits to compare
          </div>
        ) : (
          <div className="flex flex-col gap-4.5">
            {comparisonData.map((data, index) => (
              <div key={data.id} className="flex flex-col gap-1.5 w-full">
                {/* Header info (Name, emoji, percentage) */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full ring-2 ring-white/10 shrink-0"
                      style={{ backgroundColor: data.color }}
                    />
                    {data.emoji && <span className="text-sm leading-none">{data.emoji}</span>}
                    <span className="text-foreground/90 truncate max-w-[150px] sm:max-w-[250px]">
                      {data.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-muted-foreground text-[11px] font-normal">
                      ({data.completionsCount}/{data.totalDays} days)
                    </span>
                    <span className="text-foreground">{Math.round(data.completionRate)}%</span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="h-2.5 w-full rounded-full bg-muted/40 overflow-hidden border border-border/10">
                  {/* Glowing progress line */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.completionRate}%` }}
                    transition={{ duration: 0.6, delay: index * 0.04, ease: "easeOut" }}
                    className="h-full rounded-full shadow-inner relative"
                    style={{
                      backgroundColor: data.color,
                      boxShadow: `0 0 12px ${data.color}35`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
