"use client"

import React, { useMemo, useState } from "react"
import { motion } from "motion/react"
import {
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  ArrowUpRight,
  ListTodo
} from "lucide-react"
import { TrendChart } from "./trend-chart"
import { WeekdayMissChart } from "./weekday-miss-chart"
import { ComparisonChart } from "./comparison-chart"
import { Milestones } from "./milestones"
import { MoodCorrelation } from "./mood-correlation"
import { TaskStats } from "./task-stats"
import type { Priority } from "@/lib/validations"

interface Habit {
  id: string
  name: string
  color: string
  emoji?: string | null
  createdAt: string
}

interface LogEntry {
  habitId: string
  date: string
  completed: boolean
}

interface MoodEntry {
  date: string
  mood: number | null
}

interface TodoEntry {
  date: string
  completed: boolean
  priority: Priority
}

interface AnalyticsData {
  habits: Habit[]
  logs: LogEntry[]
  moods: MoodEntry[]
  todos: TodoEntry[]
}

interface AnalyticsDashboardProps {
  initialData: AnalyticsData
}

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const { habits, logs, moods, todos } = initialData
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30)

  // 1. Generate chronological list of dates for the active range (ascending)
  const dates = useMemo(() => {
    const result: string[] = []
    const today = new Date()
    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      const y = d.getFullYear()
      const m = d.getMonth() + 1
      const day = d.getDate()
      result.push(`${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`)
    }
    return result
  }, [timeRange])

  // Lookups
  const logsSet = useMemo(() => {
    return new Set(logs.filter(l => l.completed).map(l => `${l.habitId}:${l.date}`))
  }, [logs])

  // 2. Calculate comprehensive statistics for each habit
  const habitStats = useMemo(() => {
    return habits.map((habit) => {
      let opportunities = 0
      let completions = 0
      const habitCreatedStr = habit.createdAt.split("T")[0]

      // Determine opportunities and completions in the active range
      dates.forEach((dateStr) => {
        if (dateStr >= habitCreatedStr) {
          opportunities++
          if (logsSet.has(`${habit.id}:${dateStr}`)) {
            completions++
          }
        }
      })

      // Calculate streak (global streak based on logs)
      let currentStreak = 0
      let maxStreak = 0
      let lastDate: Date | null = null

      // Sort all logs for this habit to calculate overall streak
      const completedDates = logs
        .filter((l) => l.habitId === habit.id && l.completed)
        .map((l) => l.date)
        .sort()

      completedDates.forEach((dateStr) => {
        const currentDate = new Date(`${dateStr}T00:00:00.000Z`)
        if (lastDate === null) {
          currentStreak = 1
        } else {
          const diffTime = currentDate.getTime() - lastDate.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          if (diffDays === 1) {
            currentStreak++
          } else if (diffDays > 1) {
            currentStreak = 1
          }
        }
        lastDate = currentDate
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak
        }
      })

      // Check if current streak is still active (completed either today or yesterday)
      if (completedDates.length > 0) {
        const lastCompletedStr = completedDates[completedDates.length - 1]
        const lastCompletedDate = new Date(`${lastCompletedStr}T00:00:00.000Z`)
        const todayStr = dates[dates.length - 1]
        const todayDate = new Date(`${todayStr}T00:00:00.000Z`)
        const diffTime = todayDate.getTime() - lastCompletedDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        // If it's been more than 1 day since last completion, current streak resets to 0
        if (diffDays > 1) {
          currentStreak = 0
        }
      } else {
        currentStreak = 0
      }

      // Calculate days since last completion
      let daysSinceLastCompleted = 999
      if (completedDates.length > 0) {
        const lastCompletedStr = completedDates[completedDates.length - 1]
        const lastCompletedDate = new Date(`${lastCompletedStr}T00:00:00.000Z`)
        const todayStr = dates[dates.length - 1]
        const todayDate = new Date(`${todayStr}T00:00:00.000Z`)
        const diffTime = todayDate.getTime() - lastCompletedDate.getTime()
        daysSinceLastCompleted = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)))
      }

      const rate = opportunities > 0 ? (completions / opportunities) * 100 : 0

      return {
        ...habit,
        rate,
        completions,
        opportunities,
        currentStreak,
        maxStreak,
        daysSinceLastCompleted,
      }
    })
  }, [habits, dates, logs, logsSet])

  // 3. Overall aggregate calculations
  const overallStats = useMemo(() => {
    let totalOpportunities = 0
    let totalCompletions = 0

    habitStats.forEach((h) => {
      totalOpportunities += h.opportunities
      totalCompletions += h.completions
    })

    const completionRate = totalOpportunities > 0 ? (totalCompletions / totalOpportunities) * 100 : 0

    // Find consistency leaders
    const sortedByRate = [...habitStats].sort((a, b) => b.rate - a.rate)
    const mostConsistent = sortedByRate.length > 0 && sortedByRate[0].opportunities > 0 ? sortedByRate[0] : null

    // Habit needing attention (lowest rate, or highest days since last completed if active)
    const sortedByNeedsAttention = [...habitStats].sort((a, b) => {
      // Prioritize days since last completed if it's high, then lowest rate
      if (a.daysSinceLastCompleted !== b.daysSinceLastCompleted) {
        return b.daysSinceLastCompleted - a.daysSinceLastCompleted
      }
      return a.rate - b.rate
    })
    const needsAttention = sortedByNeedsAttention.length > 0 ? sortedByNeedsAttention[0] : null

    // Overall max streak across any habit
    const overallMaxStreak = habitStats.reduce((max, h) => Math.max(max, h.maxStreak), 0)

    return {
      completionRate,
      mostConsistent,
      needsAttention,
      maxStreak: overallMaxStreak,
    }
  }, [habitStats])

  // 4. Trend data point calculations (daily rate)
  const trendData = useMemo(() => {
    return dates.map((dateStr) => {
      let activeHabits = 0
      let completedHabits = 0

      habits.forEach((habit) => {
        const habitCreatedStr = habit.createdAt.split("T")[0]
        if (dateStr >= habitCreatedStr) {
          activeHabits++
          if (logsSet.has(`${habit.id}:${dateStr}`)) {
            completedHabits++
          }
        }
      })

      const rate = activeHabits > 0 ? (completedHabits / activeHabits) * 100 : 0
      return { date: dateStr, rate }
    })
  }, [dates, habits, logsSet])

  if (habits.length === 0) {
    return (
      <div className="space-y-10">
        <div className="premium-panel flex min-h-[350px] flex-col items-center justify-center rounded-2xl p-12 text-center">
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 ring-1 ring-inset ring-brand/20">
            <span className="absolute inset-0 animate-glow-pulse rounded-2xl bg-brand-gradient opacity-30 blur-xl" />
            <ListTodo className="h-8 w-8 text-brand" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No habit analytics yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Habit insights require active habits to track. Create a habit on the habits page and log some entries to view them.
          </p>
          <a
            href="/habits"
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-2 shadow-md transition-colors"
          >
            Manage Habits <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        {/* Task analytics work independently of habits. */}
        <TaskStats todos={todos} dates={dates} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Filter Header */}
      <div className="premium-panel ml-auto flex w-fit rounded-2xl p-1.5">
        {([7, 30, 90] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === range
                ? "bg-brand-gradient text-white shadow-lg shadow-brand/25"
                : "text-muted-foreground hover:-translate-y-0.5 hover:text-foreground"
            }`}
          >
            {range} Days
          </button>
        ))}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="premium-panel kinetic-card flex items-center gap-4 rounded-xl p-4.5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand shadow-[0_0_24px_color-mix(in_oklch,var(--brand)_24%,transparent)]">
            <Activity className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Completion Rate
            </p>
            <h3 className="text-xl font-bold font-mono mt-0.5">
              {Math.round(overallStats.completionRate)}%
            </h3>
          </div>
        </motion.div>

        {/* Card 2: Longest Streak */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="premium-panel kinetic-card flex items-center gap-4 rounded-xl p-4.5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 shadow-[0_0_24px_rgba(245,158,11,0.18)]">
            <Flame className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Best Active Streak
            </p>
            <h3 className="text-xl font-bold font-mono mt-0.5">
              {overallStats.maxStreak} {overallStats.maxStreak === 1 ? "day" : "days"}
            </h3>
          </div>
        </motion.div>

        {/* Card 3: Most Consistent Habit */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="premium-panel kinetic-card flex items-center gap-4 rounded-xl p-4.5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.18)]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Most Consistent
            </p>
            <h3 className="text-sm font-bold truncate mt-0.5 text-foreground/95">
              {overallStats.mostConsistent ? (
                <>
                  {overallStats.mostConsistent.emoji ? `${overallStats.mostConsistent.emoji} ` : ""}
                  {overallStats.mostConsistent.name}
                  <span className="font-mono text-xs block text-emerald-500">
                    {Math.round(overallStats.mostConsistent.rate)}% success
                  </span>
                </>
              ) : (
                "—"
              )}
            </h3>
          </div>
        </motion.div>

        {/* Card 4: Needs Attention */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="premium-panel kinetic-card flex items-center gap-4 rounded-xl p-4.5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 shadow-[0_0_24px_rgba(244,63,94,0.18)]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Needs Attention
            </p>
            <h3 className="text-sm font-bold truncate mt-0.5 text-foreground/95">
              {overallStats.needsAttention ? (
                <>
                  {overallStats.needsAttention.emoji ? `${overallStats.needsAttention.emoji} ` : ""}
                  {overallStats.needsAttention.name}
                  <span className="font-mono text-xs block text-rose-500">
                    {overallStats.needsAttention.daysSinceLastCompleted === 999
                      ? "Never tracked"
                      : overallStats.needsAttention.daysSinceLastCompleted > 0
                      ? `Missed for ${overallStats.needsAttention.daysSinceLastCompleted} ${
                          overallStats.needsAttention.daysSinceLastCompleted === 1 ? "day" : "days"
                        }`
                      : `${Math.round(overallStats.needsAttention.rate)}% success`}
                  </span>
                </>
              ) : (
                "—"
              )}
            </h3>
          </div>
        </motion.div>
      </div>

      {/* Main charts section: Trend and Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 flex w-full">
          <TrendChart data={trendData} />
        </div>
        <div className="lg:col-span-2 flex w-full">
          <ComparisonChart habits={habits} logs={logs} dates={dates} />
        </div>
      </div>

      {/* Weekday Misses and Mood Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex w-full">
          <WeekdayMissChart habits={habits} logs={logs} dates={dates} />
        </div>
        <div className="flex w-full">
          <MoodCorrelation habits={habits} logs={logs} moods={moods} dates={dates} />
        </div>
      </div>

      {/* Milestones & Achievements */}
      <div className="pt-2">
        <Milestones habits={habits} logs={logs} dates={dates} />
      </div>

      {/* Task focus — daily to-do completion analytics */}
      <div className="border-t border-border/50 pt-8">
        <TaskStats todos={todos} dates={dates} />
      </div>
    </div>
  )
}
