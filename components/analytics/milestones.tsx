"use client"

import React, { useMemo } from "react"
import { motion } from "motion/react"
import { Award, CheckCircle, Clock, Trophy } from "lucide-react"

interface Habit {
  id: string
  name: string
}

interface LogEntry {
  habitId: string
  date: string
  completed: boolean
}

interface MilestonesProps {
  habits: Habit[]
  logs: LogEntry[]
  dates: string[] // sorted chronologically (ascending YYYY-MM-DD)
}

interface Badge {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  colorClass: string
  gradient: string
  isUnlocked: boolean
  progressText: string
}

export function Milestones({ habits, logs, dates }: MilestonesProps) {
  const badges = useMemo<Badge[]>(() => {
    if (habits.length === 0 || dates.length === 0) {
      return []
    }

    // --- Prepare data structures ---
    const logsSet = new Set(
      logs.filter(l => l.completed).map(l => `${l.habitId}:${l.date}`)
    )

    // Calculate streaks for each habit
    const streaks = habits.map((habit) => {
      let maxStreak = 0
      let currentStreak = 0
      let lastDate: Date | null = null

      dates.forEach((dateStr) => {
        const completed = logsSet.has(`${habit.id}:${dateStr}`)
        if (completed) {
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
        } else {
          // If not completed and date has passed (or it's today and not yet completed)
          // We don't break current streak for today yet if it hasn't broken, but for maximum safety
          // we can reset currentStreak if we explicitly miss.
          currentStreak = 0
          lastDate = null
        }
      })

      return { habitId: habit.id, name: habit.name, maxStreak }
    })

    const overallMaxStreak = streaks.reduce((max, s) => Math.max(max, s.maxStreak), 0)

    // --- Badge 1: 30-Day Perfect Streak ---
    const has30DayStreak = overallMaxStreak >= 30
    const badge30DayProgress = `${Math.min(overallMaxStreak, 30)}/30 days`

    // --- Badge 2: Weekly Warrior (All habits completed for a full Mon-Sun week) ---
    // Group dates by week number / week start
    // Find calendar weeks in dates. Let's find Mondays in dates.
    const weeklyStatus = new Map<string, boolean>() // key: Monday date, value: is perfect week
    dates.forEach((dateStr) => {
      const date = new Date(`${dateStr}T00:00:00.000Z`)
      const rawDay = date.getUTCDay()
      // Find the Monday of this week
      const diff = rawDay === 0 ? -6 : 1 - rawDay
      const monday = new Date(date)
      monday.setDate(date.getDate() + diff)
      const mondayStr = monday.toISOString().split("T")[0]

      if (!weeklyStatus.has(mondayStr)) {
        weeklyStatus.set(mondayStr, true)
      }

      // Check if all habits are completed on this day
      const allCompleted = habits.every(h => logsSet.has(`${h.id}:${dateStr}`))
      if (!allCompleted) {
        weeklyStatus.set(mondayStr, false)
      }
    })

    // Filter weeks that actually have a full 7 days represented in dates range
    // to verify completeness.
    let hasPerfectWeek = false
    weeklyStatus.forEach((isPerfect, mondayStr) => {
      // Find how many days of this week are in dates
      const monDate = new Date(`${mondayStr}T00:00:00.000Z`)
      let weekDaysInRange = 0
      for (let i = 0; i < 7; i++) {
        const d = new Date(monDate)
        d.setDate(monDate.getDate() + i)
        const dStr = d.toISOString().split("T")[0]
        if (dates.includes(dStr)) {
          weekDaysInRange++
        }
      }

      // If we tracked all 7 days of this week and all were perfect
      if (weekDaysInRange === 7 && isPerfect) {
        hasPerfectWeek = true
      }
    })

    const badgeWeeklyProgress = hasPerfectWeek ? "Perfect week unlocked!" : "0/7 days this week"

    // --- Badge 3: Habit Architect (>= 90% completion rate on any habit for the last 30 days) ---
    const last30Dates = dates.slice(-30)
    let bestHabitRate30d = 0

    if (last30Dates.length > 0) {
      habits.forEach((habit) => {
        let completions = 0
        last30Dates.forEach((dateStr) => {
          if (logsSet.has(`${habit.id}:${dateStr}`)) {
            completions++
          }
        })
        const rate = (completions / last30Dates.length) * 100
        if (rate > bestHabitRate30d) {
          bestHabitRate30d = rate
        }
      })
    }

    const hasHabitArchitect = bestHabitRate30d >= 90
    const badgeArchitectProgress = `${Math.round(bestHabitRate30d)}%/90% rate`

    // --- Badge 4: Perfect Start (All habits completed for 7 consecutive days) ---
    let maxConsecutiveAllCompleted = 0
    let currentConsecutiveAllCompleted = 0

    dates.forEach((dateStr) => {
      const allCompleted = habits.every(h => logsSet.has(`${h.id}:${dateStr}`))
      if (allCompleted) {
        currentConsecutiveAllCompleted++
        if (currentConsecutiveAllCompleted > maxConsecutiveAllCompleted) {
          maxConsecutiveAllCompleted = currentConsecutiveAllCompleted
        }
      } else {
        currentConsecutiveAllCompleted = 0
      }
    })

    const hasPerfectStart = maxConsecutiveAllCompleted >= 7
    const badgeStartProgress = `${Math.min(maxConsecutiveAllCompleted, 7)}/7 consecutive`

    return [
      {
        id: "streak-30",
        title: "30-Day Streak",
        description: "Complete a single habit for 30 consecutive days straight.",
        icon: <Trophy className="h-6.5 w-6.5" />,
        colorClass: "text-amber-500",
        gradient: "from-amber-400 to-orange-500",
        isUnlocked: has30DayStreak,
        progressText: badge30DayProgress,
      },
      {
        id: "weekly-warrior",
        title: "Weekly Warrior",
        description: "Complete all active habits every day from Monday to Sunday.",
        icon: <Award className="h-6.5 w-6.5" />,
        colorClass: "text-indigo-500",
        gradient: "from-blue-400 to-indigo-600",
        isUnlocked: hasPerfectWeek,
        progressText: badgeWeeklyProgress,
      },
      {
        id: "habit-architect",
        title: "Habit Architect",
        description: "Maintain a 90% or higher completion rate on any habit for 30 days.",
        icon: <CheckCircle className="h-6.5 w-6.5" />,
        colorClass: "text-emerald-500",
        gradient: "from-emerald-400 to-teal-600",
        isUnlocked: hasHabitArchitect,
        progressText: badgeArchitectProgress,
      },
      {
        id: "perfect-start",
        title: "Perfect Start",
        description: "Log and complete every active habit for 7 consecutive days.",
        icon: <Clock className="h-6.5 w-6.5" />,
        colorClass: "text-rose-500",
        gradient: "from-rose-400 to-pink-600",
        isUnlocked: hasPerfectStart,
        progressText: badgeStartProgress,
      },
    ]
  }, [habits, logs, dates])

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Milestones & Awards
        </h3>
        <span className="text-xs text-muted-foreground font-medium">
          {badges.filter(b => b.isUnlocked).length} of {badges.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {badges.map((badge, idx) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className={`premium-panel kinetic-card group relative flex flex-col items-center gap-3.5 overflow-hidden rounded-xl p-5 text-center transition-all duration-300 ${
              badge.isUnlocked
                ? "opacity-100"
                : "opacity-70 grayscale-[0.15]"
            }`}
          >
            {/* Badge Graphic */}
            <div className="relative">
              {/* Unlock glow background */}
              {badge.isUnlocked && (
                <div className={`absolute inset-0 -z-10 animate-glow-pulse rounded-full bg-gradient-to-tr ${badge.gradient} opacity-30 blur-xl`} />
              )}
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner border transition-transform duration-300 group-hover:scale-110 ${
                  badge.isUnlocked
                    ? `bg-gradient-to-tr ${badge.gradient} text-white border-white/20 shadow-white/10`
                    : "bg-muted/30 border-muted text-muted-foreground/60"
                }`}
              >
                {badge.icon}
              </div>
            </div>

            {/* Title and details */}
            <div className="flex flex-col gap-1 flex-1">
              <h4 className="text-sm font-bold text-foreground tracking-tight">
                {badge.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-normal max-w-[200px]">
                {badge.description}
              </p>
            </div>

            {/* Progress status tag */}
            <div className="w-full pt-2.5 border-t border-border/10 flex items-center justify-center">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  badge.isUnlocked
                    ? "bg-brand/10 border-brand/20 text-brand"
                    : "bg-muted/40 border-muted text-muted-foreground/60"
                }`}
              >
                {badge.isUnlocked ? "Unlocked" : badge.progressText}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
