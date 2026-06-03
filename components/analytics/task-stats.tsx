"use client"

import React, { useMemo } from "react"
import { motion } from "motion/react"
import { format, parseISO } from "date-fns"
import { ListChecks, CheckCircle2, Gauge, CalendarRange } from "lucide-react"
import type { Priority } from "@/lib/validations"
import { PRIORITY_META, PRIORITY_ORDER } from "@/components/todo/priority"

interface TodoEntry {
  date: string
  completed: boolean
  priority: Priority
}

interface TaskStatsProps {
  todos: TodoEntry[]
  dates: string[] // active range, ascending "YYYY-MM-DD"
}

export function TaskStats({ todos, dates }: TaskStatsProps) {
  const dateSet = useMemo(() => new Set(dates), [dates])

  // Only consider tasks that fall inside the selected time range.
  const inRange = useMemo(
    () => todos.filter((t) => dateSet.has(t.date)),
    [todos, dateSet]
  )

  const stats = useMemo(() => {
    const total = inRange.length
    const completed = inRange.filter((t) => t.completed).length
    const rate = total > 0 ? (completed / total) * 100 : 0

    // Per-day created/completed counts.
    const perDay = dates.map((date) => {
      const dayTodos = inRange.filter((t) => t.date === date)
      return {
        date,
        total: dayTodos.length,
        completed: dayTodos.filter((t) => t.completed).length,
      }
    })

    // Best day = most tasks completed.
    const best = perDay.reduce<{ date: string; completed: number } | null>(
      (acc, d) =>
        d.completed > 0 && (!acc || d.completed > acc.completed)
          ? { date: d.date, completed: d.completed }
          : acc,
      null
    )

    // Priority distribution.
    const byPriority = PRIORITY_ORDER.map((p) => ({
      priority: p,
      count: inRange.filter((t) => t.priority === p).length,
    }))

    const maxDay = Math.max(1, ...perDay.map((d) => d.total))

    return { total, completed, rate, perDay, best, byPriority, maxDay }
  }, [inRange, dates])

  const kpis = [
    {
      label: "Tasks Completed",
      value: `${stats.completed}`,
      sub: `of ${stats.total} planned`,
      icon: CheckCircle2,
      tint: "bg-emerald-500/10 text-emerald-500",
      glow: "shadow-[0_0_24px_rgba(16,185,129,0.18)]",
    },
    {
      label: "Completion Rate",
      value: `${Math.round(stats.rate)}%`,
      sub: stats.total > 0 ? "tasks done" : "no tasks yet",
      icon: Gauge,
      tint: "bg-brand/10 text-brand",
      glow: "shadow-[0_0_24px_color-mix(in_oklch,var(--brand)_24%,transparent)]",
    },
    {
      label: "Most Productive",
      value: stats.best ? `${stats.best.completed}` : "—",
      sub: stats.best ? format(parseISO(stats.best.date), "MMM d") : "no completions",
      icon: CalendarRange,
      tint: "bg-violet-500/10 text-violet-500",
      glow: "shadow-[0_0_24px_rgba(139,92,246,0.18)]",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <ListChecks className="h-4.5 w-4.5" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Task focus
        </h2>
        <a
          href="/todos"
          className="ml-auto text-xs font-semibold text-brand hover:underline"
        >
          Open to-do →
        </a>
      </div>

      {stats.total === 0 ? (
        <div className="premium-panel flex min-h-[180px] flex-col items-center justify-center rounded-2xl p-10 text-center">
          <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 ring-1 ring-inset ring-brand/20">
            <ListChecks className="h-7 w-7 text-brand" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            No tasks in this range
          </h3>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Plan a few tasks on the to-do page to see completion trends here.
          </p>
        </div>
      ) : (
        <>
          {/* KPI tiles */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="premium-panel kinetic-card flex items-center gap-4 rounded-xl p-4.5"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${kpi.tint} ${kpi.glow}`}
                >
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {kpi.label}
                  </p>
                  <h3 className="mt-0.5 font-mono text-xl font-bold">
                    {kpi.value}
                  </h3>
                  <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Two-up: daily bars + priority mix */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Daily completion bars */}
            <div className="premium-panel kinetic-card rounded-xl p-4 lg:col-span-3">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Tasks per day
              </h3>
              <div className="flex h-[160px] items-end gap-[2px]">
                {stats.perDay.map((d) => {
                  const totalH = (d.total / stats.maxDay) * 100
                  const doneH =
                    d.total > 0 ? (d.completed / stats.maxDay) * 100 : 0
                  return (
                    <div
                      key={d.date}
                      className="group relative flex flex-1 flex-col justify-end"
                      style={{ height: "100%" }}
                    >
                      {/* Planned (track) */}
                      <div
                        className="w-full rounded-sm bg-muted"
                        style={{ height: `${totalH}%` }}
                      />
                      {/* Completed (overlay) */}
                      <div
                        className="absolute bottom-0 w-full rounded-sm bg-brand-gradient"
                        style={{ height: `${doneH}%` }}
                      />
                      {/* Tooltip */}
                      {d.total > 0 && (
                        <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-[10px] font-medium text-popover-foreground opacity-0 shadow-md ring-1 ring-foreground/10 transition-opacity group-hover:opacity-100">
                          {format(parseISO(d.date), "MMM d")}: {d.completed}/
                          {d.total}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 flex items-center gap-4 border-t border-border/50 pt-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <span className="h-2 w-2 rounded-full bg-brand" /> Completed
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <span className="h-2 w-2 rounded-full bg-muted" /> Planned
                </span>
              </div>
            </div>

            {/* Priority mix */}
            <div className="premium-panel kinetic-card rounded-xl p-4 lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Priority mix
              </h3>
              <div className="space-y-4">
                {stats.byPriority.map(({ priority, count }) => {
                  const meta = PRIORITY_META[priority]
                  const pct =
                    stats.total > 0 ? (count / stats.total) * 100 : 0
                  return (
                    <div key={priority}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-semibold text-foreground/90">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: meta.color }}
                          />
                          {meta.label}
                        </span>
                        <span className="font-mono text-muted-foreground">
                          {count}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: meta.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
