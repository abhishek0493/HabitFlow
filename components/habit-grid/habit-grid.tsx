"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CalendarCheck2 } from "lucide-react"
import type { Habit } from "@/lib/generated/prisma/client"
import { getHabitLogs, toggleHabitLog, type HabitLogEntry } from "@/actions/log.actions"
import {
  getDaysInMonth,
  buildDateString,
  getTodayString,
  toDateString,
  shiftMonth,
  getWeekStart,
  getWeekDays,
  getShortDayName,
  shiftWeek,
} from "@/lib/date-utils"
import { cn } from "@/lib/utils"
import { GridHeader } from "@/components/habit-grid/grid-header"
import { GridCell } from "@/components/habit-grid/grid-cell"
import { HabitNameLabel } from "@/components/habit-grid/habit-name"
import { TooltipProvider } from "@/components/ui/tooltip"

type ViewMode = "month" | "week"

type DisplayColumn = {
  date: string // "YYYY-MM-DD"
  label: string // "15"
  dayName?: string // "Mon" — only in week view
  isToday: boolean
}

interface HabitGridProps {
  initialHabits: Habit[]
  initialLogs: HabitLogEntry[]
  initialView: ViewMode // view the server resolved from searchParams
  initialStartDate: string // start of the period the server fetched
  initialEndDate: string // end of the period the server fetched
}

export function HabitGrid({
  initialHabits,
  initialLogs,
  initialView,
  initialStartDate,
  initialEndDate,
}: HabitGridProps) {
  const habits = initialHabits
  const today = new Date()
  const todayString = getTodayString()

  // Initialise state from the server-resolved view/date so SSR renders the
  // correct view immediately (no month→week flash on direct/bookmarked week
  // URLs). initialStartDate is the period start ("YYYY-MM-DD"): the 1st of the
  // month for month view, or the week's Monday for week view.
  const [view, setView] = useState<ViewMode>(initialView)
  const [monthYear, setMonthYear] = useState(() => {
    if (initialView === "month") {
      const [y, m] = initialStartDate.split("-").map(Number)
      if (y && m) return { year: y, month: m }
    }
    return { year: today.getFullYear(), month: today.getMonth() + 1 }
  })
  const [weekStart, setWeekStart] = useState(() => {
    if (initialView === "week") {
      return new Date(`${initialStartDate}T00:00:00.000Z`)
    }
    return getWeekStart(today)
  })

  // ── Keep the URL in sync whenever view or date changes ────────────────────
  useEffect(() => {
    const params = new URLSearchParams()
    params.set("view", view)
    if (view === "month") {
      params.set("date", buildDateString(monthYear.year, monthYear.month, 1))
    } else {
      params.set("date", toDateString(weekStart))
    }
    window.history.replaceState(null, "", `?${params.toString()}`)
  }, [view, monthYear, weekStart])

  // ── Derived display columns + the fetch range ─────────────────────────────
  const { startDate, endDate, displayColumns } = useMemo<{
    startDate: string
    endDate: string
    displayColumns: DisplayColumn[]
  }>(() => {
    if (view === "month") {
      const { year, month } = monthYear
      const days = getDaysInMonth(year, month)
      return {
        startDate: buildDateString(year, month, 1),
        endDate: buildDateString(year, month, days),
        displayColumns: Array.from({ length: days }, (_, i) => {
          const date = buildDateString(year, month, i + 1)
          return { date, label: String(i + 1), isToday: date === todayString }
        }),
      }
    } else {
      const days = getWeekDays(weekStart)
      return {
        startDate: toDateString(days[0]),
        endDate: toDateString(days[6]),
        displayColumns: days.map((d) => {
          const date = toDateString(d)
          return {
            date,
            label: String(d.getDate()),
            dayName: getShortDayName(d),
            isToday: date === todayString,
          }
        }),
      }
    }
  }, [view, monthYear, weekStart, todayString])

  // Timestamp for the server-provided initialData, computed once on mount
  // (kept out of render scope to satisfy the react-hooks purity rule).
  const [initialDataUpdatedAt] = useState(() => Date.now())

  // ── Fetch logs for the visible period ─────────────────────────────────────
  const { data: logs = [], isFetching } = useQuery({
    queryKey: ["habitLogs", startDate, endDate],
    queryFn: () => getHabitLogs(startDate, endDate),
    initialData:
      startDate === initialStartDate && endDate === initialEndDate
        ? initialLogs
        : undefined,
    initialDataUpdatedAt,
  })

  // ── Toggle mutation with optimistic update ────────────────────────────────
  const queryClient = useQueryClient()

  const { mutate: toggleLog } = useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: string }) =>
      toggleHabitLog(habitId, date),

    onMutate: async ({ habitId, date }) => {
      await queryClient.cancelQueries({
        queryKey: ["habitLogs", startDate, endDate],
      })

      const previousLogs = queryClient.getQueryData<HabitLogEntry[]>([
        "habitLogs",
        startDate,
        endDate,
      ])

      queryClient.setQueryData<HabitLogEntry[]>(
        ["habitLogs", startDate, endDate],
        (old = []) => {
          const exists = old.some(
            (l) => l.habitId === habitId && l.date === date
          )
          if (exists) {
            return old.filter(
              (l) => !(l.habitId === habitId && l.date === date)
            )
          }
          return [...old, { habitId, date, completed: true }]
        }
      )

      return { previousLogs }
    },

    onError: (_err, _variables, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(
          ["habitLogs", startDate, endDate],
          context.previousLogs
        )
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["habitLogs", startDate, endDate],
      })
    },
  })

  // ── Completed-dates lookup ────────────────────────────────────────────────
  const completedSet = useMemo(() => {
    return new Set(logs.map((l) => `${l.habitId}:${l.date}`))
  }, [logs])

  // ── Period navigation ─────────────────────────────────────────────────────
  const handlePrevPeriod = () => {
    if (view === "month") {
      setMonthYear((prev) => shiftMonth(prev.year, prev.month, -1))
    } else {
      setWeekStart((prev) => shiftWeek(prev, -1))
    }
  }

  const handleNextPeriod = () => {
    if (view === "month") {
      setMonthYear((prev) => shiftMonth(prev.year, prev.month, 1))
    } else {
      setWeekStart((prev) => shiftWeek(prev, 1))
    }
  }

  const handleToday = () => {
    const now = new Date()
    if (view === "month") {
      setMonthYear({ year: now.getFullYear(), month: now.getMonth() + 1 })
    } else {
      setWeekStart(getWeekStart(now))
    }
  }

  const isCurrentPeriod = (() => {
    const now = new Date()
    if (view === "month") {
      return (
        monthYear.year === now.getFullYear() &&
        monthYear.month === now.getMonth() + 1
      )
    }
    return toDateString(weekStart) === toDateString(getWeekStart(now))
  })()

  const handleViewChange = (newView: ViewMode) => {
    if (newView === "week" && view === "month") {
      // Switch to week: show the week containing the 1st of the displayed month
      const anchor = new Date(monthYear.year, monthYear.month - 1, 1)
      setWeekStart(getWeekStart(anchor))
    } else if (newView === "month" && view === "week") {
      // Switch to month: show the month containing the week start
      setMonthYear({
        year: weekStart.getFullYear(),
        month: weekStart.getMonth() + 1,
      })
    }
    setView(newView)
  }

  // ── Grid geometry ─────────────────────────────────────────────────────────
  const colWidth = view === "week" ? "80px" : "34px"
  const gridTemplateColumns = `160px repeat(${displayColumns.length}, ${colWidth})`
  const headerHeight = view === "week" ? "h-14" : "h-10"

  return (
    <TooltipProvider delay={250}>
      <div>
      <GridHeader
        year={monthYear.year}
        month={monthYear.month}
        weekStart={weekStart}
        view={view}
        onViewChange={handleViewChange}
        onPrevPeriod={handlePrevPeriod}
        onNextPeriod={handleNextPeriod}
        onToday={handleToday}
        isCurrentPeriod={isCurrentPeriod}
        isFetching={isFetching}
      />

      {habits.length > 0 && (
        <div className="overflow-x-auto">
          {/* w-max sizes the grid box to its content (sum of tracks) so the
              sticky name column pins across the full scroll width. */}
          <div className="grid w-max" style={{ gridTemplateColumns }}>
            {/* ── Date header row ── */}
            <div
              className={cn(
                "sticky left-0 z-20 border-b border-r border-border bg-card",
                headerHeight
              )}
            />
            {displayColumns.map((col) => (
              <div
                key={col.date}
                className={cn(
                  "flex select-none flex-col items-center justify-center border-b border-r border-border",
                  headerHeight,
                  col.isToday && "bg-brand/5"
                )}
              >
                {col.dayName && (
                  <span
                    className={cn(
                      "mb-0.5 text-xs",
                      col.isToday
                        ? "font-medium text-brand"
                        : "text-muted-foreground/70"
                    )}
                  >
                    {col.dayName}
                  </span>
                )}
                {col.isToday && view === "week" && (
                  <span className="mb-1 h-1 w-1 rounded-full bg-brand" />
                )}
                <span
                  className={cn(
                    "text-xs",
                    col.isToday
                      ? "font-bold text-brand"
                      : "font-medium text-muted-foreground"
                  )}
                >
                  {col.label}
                </span>
              </div>
            ))}

            {/* ── Habit rows ── */}
            {habits.map((habit) => (
              <React.Fragment key={habit.id}>
                <div className="sticky left-0 z-10 flex h-9 items-center gap-2 border-b border-r border-border bg-card px-3">
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-full ring-2 ring-inset ring-white/20"
                    style={{ backgroundColor: habit.color }}
                  />
                  {habit.emoji && (
                    <span className="text-sm leading-none">{habit.emoji}</span>
                  )}
                  <HabitNameLabel
                    name={habit.name}
                    className="text-sm font-medium text-foreground/90"
                  />
                </div>

                {displayColumns.map((col) => {
                  const isCompleted = completedSet.has(`${habit.id}:${col.date}`)
                  const isFuture = col.date > todayString
                  const isToday = col.date === todayString

                  return (
                    <GridCell
                      key={col.date}
                      isCompleted={isCompleted}
                      isFuture={isFuture}
                      isToday={isToday}
                      color={habit.color}
                      onClick={() =>
                        toggleLog({ habitId: habit.id, date: col.date })
                      }
                    />
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {habits.length === 0 && (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 ring-1 ring-inset ring-brand/20">
            <CalendarCheck2 className="h-8 w-8 text-brand" />
          </div>
          <p className="text-base font-medium text-foreground">
            No habits to track yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Go to{" "}
            <a
              href="/habits"
              className="font-medium text-brand underline-offset-4 hover:underline"
            >
              Habits
            </a>{" "}
            to add your first habit.
          </p>
        </div>
      )}
      </div>
    </TooltipProvider>
  )
}
