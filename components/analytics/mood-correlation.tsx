"use client"

import React, { useMemo } from "react"
import { motion } from "motion/react"
import { Smile, Frown, Meh, Sparkles, BookOpen } from "lucide-react"

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

interface MoodEntry {
  date: string
  mood: number | null // Mood scale: e.g. 1 to 5 (or similar)
}

interface MoodCorrelationProps {
  habits: Habit[]
  logs: LogEntry[]
  moods: MoodEntry[]
  dates: string[]
}

interface HabitCorrelation {
  habitId: string
  name: string
  emoji?: string | null
  color: string
  avgMoodCompleted: number
  avgMoodMissed: number
  diff: number
  completedCount: number
  missedCount: number
}

export function MoodCorrelation({ habits, logs, moods, dates }: MoodCorrelationProps) {
  // Filter out moods that are null or not set
  const validMoods = useMemo(() => {
    return moods.filter(m => m.mood !== null && m.mood !== undefined && dates.includes(m.date)) as (MoodEntry & { mood: number })[]
  }, [moods, dates])

  const correlationData = useMemo<HabitCorrelation[]>(() => {
    if (validMoods.length === 0 || habits.length === 0) return []

    // Map logs to a quick lookup set
    const completedSet = new Set(
      logs.filter(l => l.completed).map(l => `${l.habitId}:${l.date}`)
    )

    const result: HabitCorrelation[] = []

    habits.forEach((habit) => {
      let sumMoodCompleted = 0
      let countMoodCompleted = 0
      let sumMoodMissed = 0
      let countMoodMissed = 0

      validMoods.forEach((m) => {
        const completed = completedSet.has(`${habit.id}:${m.date}`)
        if (completed) {
          sumMoodCompleted += m.mood
          countMoodCompleted++
        } else {
          sumMoodMissed += m.mood
          countMoodMissed++
        }
      })

      const avgMoodCompleted = countMoodCompleted > 0 ? sumMoodCompleted / countMoodCompleted : 0
      const avgMoodMissed = countMoodMissed > 0 ? sumMoodMissed / countMoodMissed : 0
      const diff = avgMoodCompleted - avgMoodMissed

      // We only include it if there is at least one entry in both groups to compare
      if (countMoodCompleted > 0 && countMoodMissed > 0) {
        result.push({
          habitId: habit.id,
          name: habit.name,
          emoji: habit.emoji,
          color: habit.color,
          avgMoodCompleted,
          avgMoodMissed,
          diff,
          completedCount: countMoodCompleted,
          missedCount: countMoodMissed,
        })
      }
    })

    // Sort by largest positive impact
    return result.sort((a, b) => b.diff - a.diff)
  }, [habits, logs, validMoods])

  // Get overall average mood
  const overallAvgMood = useMemo(() => {
    if (validMoods.length === 0) return 0
    const sum = validMoods.reduce((acc, curr) => acc + curr.mood, 0)
    return sum / validMoods.length
  }, [validMoods])

  const getMoodEmoji = (moodValue: number) => {
    if (moodValue >= 4.2) return <Smile className="h-4.5 w-4.5 text-emerald-500" />
    if (moodValue >= 3.0) return <Meh className="h-4.5 w-4.5 text-amber-500" />
    return <Frown className="h-4.5 w-4.5 text-rose-500" />
  }

  // Check if we have enough data to display
  const hasEnoughData = validMoods.length >= 3 && correlationData.length > 0

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Habit & Mood Correlation
        </h3>
        {hasEnoughData && (
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-brand" /> Mind-body connection
          </span>
        )}
      </div>

      <div className="premium-panel kinetic-card rounded-xl p-5">
        {!hasEnoughData ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="max-w-md">
              <p className="text-sm font-semibold text-foreground">
                Awaiting Journal Mood Data
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Log your daily mood along with journal entries on the{" "}
                <a href="/journal" className="text-brand font-medium hover:underline">
                  Journal
                </a>{" "}
                page. Once you have at least 3 mood logs, we will calculate how habit completion impacts your well-being.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Overall Stat banner */}
            <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-brand/10 bg-brand/5 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold text-brand tracking-wide uppercase">
                  Mood Summary
                </p>
                <h4 className="text-lg font-bold text-foreground mt-0.5 tracking-tight">
                  Your overall average mood is {overallAvgMood.toFixed(1)}/5.0
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-normal">
                  Let&apos;s see which habits lift your mood the most when completed.
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10 shadow-[0_0_24px_color-mix(in_oklch,var(--brand)_22%,transparent)]">
                {getMoodEmoji(overallAvgMood)}
              </div>
            </div>

            {/* List of correlations */}
            <div className="flex flex-col gap-4">
              {correlationData.map((data, idx) => {
                const isPositive = data.diff > 0
                return (
                  <motion.div
                    key={data.habitId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-border/40 bg-card/40 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:bg-card/55 sm:flex-row sm:items-center"
                  >
                    {/* Habit Info */}
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full shrink-0 ring-2 ring-white/10"
                        style={{ backgroundColor: data.color }}
                      />
                      {data.emoji && <span className="text-base">{data.emoji}</span>}
                      <span className="text-sm font-semibold text-foreground/95">
                        {data.name}
                      </span>
                    </div>

                    {/* Stats comparison */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div className="flex items-center gap-4">
                        {/* Completed day mood */}
                        <div className="flex flex-col gap-0.5 items-end">
                          <span className="text-[10px] text-muted-foreground uppercase font-medium">
                            Completed Day
                          </span>
                          <span className="text-xs font-bold text-foreground font-mono flex items-center gap-1.5">
                            {data.avgMoodCompleted.toFixed(1)}/5.0 {getMoodEmoji(data.avgMoodCompleted)}
                          </span>
                        </div>

                        {/* Missed day mood */}
                        <div className="flex flex-col gap-0.5 items-end">
                          <span className="text-[10px] text-muted-foreground uppercase font-medium">
                            Missed Day
                          </span>
                          <span className="text-xs font-semibold text-muted-foreground font-mono flex items-center gap-1.5">
                            {data.avgMoodMissed.toFixed(1)}/5.0 {getMoodEmoji(data.avgMoodMissed)}
                          </span>
                        </div>
                      </div>

                      {/* Difference Tag */}
                      <div className="flex items-center">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border font-mono ${
                            isPositive
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : data.diff < 0
                              ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                              : "bg-muted border-muted text-muted-foreground"
                          }`}
                        >
                          {isPositive ? `+${data.diff.toFixed(1)}` : data.diff.toFixed(1)} mood
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
