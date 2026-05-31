"use client"

import React, { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CalendarCheck2 } from "lucide-react"
import type { Habit } from "@/lib/generated/prisma/client"
import {
  getHabitLogsForMonth,
  toggleHabitLog,
  type HabitLogEntry,
} from "@/actions/log.actions"
import {
  getDaysInMonth,
  buildDateString,
  getTodayString,
  shiftMonth,
} from "@/lib/date-utils"
import { cn } from "@/lib/utils"
import { GridHeader } from "@/components/habit-grid/grid-header"
import { GridCell } from "@/components/habit-grid/grid-cell"

interface HabitGridProps {
  initialHabits: Habit[]
  initialLogs: HabitLogEntry[]
  initialYear: number
  initialMonth: number
}

export function HabitGrid({
  initialHabits,
  initialLogs,
  initialYear,
  initialMonth,
}: HabitGridProps) {
  const habits = initialHabits
  const today = new Date()
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const todayString = getTodayString()

  // ── Fetch logs for the visible month ──────────────────────────────────────
  const { data: logs = [] } = useQuery({
    queryKey: ["habitLogs", year, month],
    queryFn: () => getHabitLogsForMonth(year, month),
    initialData:
      year === initialYear && month === initialMonth ? initialLogs : undefined,
    initialDataUpdatedAt: Date.now(),
  })

  // ── Toggle mutation with optimistic update ────────────────────────────────
  const queryClient = useQueryClient()

  const { mutate: toggleLog } = useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: string }) =>
      toggleHabitLog(habitId, date),

    onMutate: async ({ habitId, date }) => {
      await queryClient.cancelQueries({ queryKey: ["habitLogs", year, month] })

      const previousLogs = queryClient.getQueryData<HabitLogEntry[]>([
        "habitLogs",
        year,
        month,
      ])

      queryClient.setQueryData<HabitLogEntry[]>(
        ["habitLogs", year, month],
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
          ["habitLogs", year, month],
          context.previousLogs
        )
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["habitLogs", year, month] })
    },
  })

  // ── Completed-dates lookup ────────────────────────────────────────────────
  const completedSet = useMemo(() => {
    return new Set(logs.map((l) => `${l.habitId}:${l.date}`))
  }, [logs])

  // ── Month navigation ──────────────────────────────────────────────────────
  const handlePrevMonth = () => {
    const shifted = shiftMonth(year, month, -1)
    setYear(shifted.year)
    setMonth(shifted.month)
  }

  const handleNextMonth = () => {
    const shifted = shiftMonth(year, month, 1)
    setYear(shifted.year)
    setMonth(shifted.month)
  }

  const handleToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth() + 1)
  }

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth() + 1

  // ── Grid geometry ─────────────────────────────────────────────────────────
  const daysInMonth = getDaysInMonth(year, month)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const gridTemplateColumns = `160px repeat(${daysInMonth}, 34px)`

  return (
    <div>
      <GridHeader
        year={year}
        month={month}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        isCurrentMonth={isCurrentMonth}
      />

      {habits.length > 0 && (
        <div className="overflow-x-auto">
          {/* w-max sizes the grid box to its content (sum of tracks) so the
              sticky name column pins across the full scroll width, not just
              the first viewport's worth. */}
          <div className="grid w-max" style={{ gridTemplateColumns }}>
            {/* ── Date header row ── */}
            <div className="sticky left-0 z-20 h-10 border-b border-r border-gray-100 bg-white" />
            {days.map((day) => {
              const dateString = buildDateString(year, month, day)
              const isDayToday = dateString === todayString
              return (
                <div
                  key={day}
                  className={cn(
                    "flex h-10 select-none items-center justify-center border-b border-r border-gray-100 text-xs",
                    isDayToday
                      ? "font-bold text-blue-600"
                      : "font-medium text-gray-500"
                  )}
                >
                  {day}
                </div>
              )
            })}

            {/* ── Habit rows ── */}
            {habits.map((habit) => (
              <React.Fragment key={habit.id}>
                <div className="sticky left-0 z-10 flex h-9 items-center gap-2 border-b border-r border-gray-100 bg-white px-3">
                  <div
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  {habit.emoji && (
                    <span className="text-sm leading-none">{habit.emoji}</span>
                  )}
                  <span className="truncate text-sm font-medium text-gray-700">
                    {habit.name}
                  </span>
                </div>

                {days.map((day) => {
                  const dateString = buildDateString(year, month, day)
                  const isCompleted = completedSet.has(
                    `${habit.id}:${dateString}`
                  )
                  const isFuture = dateString > todayString
                  const isToday = dateString === todayString

                  return (
                    <GridCell
                      key={day}
                      isCompleted={isCompleted}
                      isFuture={isFuture}
                      isToday={isToday}
                      color={habit.color}
                      onClick={() =>
                        toggleLog({ habitId: habit.id, date: dateString })
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
          <CalendarCheck2 className="mb-4 h-12 w-12 text-gray-300" />
          <p className="text-base font-medium text-gray-700">
            No habits to track yet
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Go to{" "}
            <a href="/habits" className="text-blue-600 hover:underline">
              Habits
            </a>{" "}
            to add your first habit.
          </p>
        </div>
      )}
    </div>
  )
}
