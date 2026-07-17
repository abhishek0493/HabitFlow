"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  buildDateString,
  getDaysInMonth,
  getMonthName,
  getTodayString,
  shiftMonth,
} from "@/lib/date-utils"
import { MOODS } from "@/components/journal/mood-picker"

interface EntryCalendarProps {
  currentDate: string // "YYYY-MM-DD"
  onDateSelect: (date: string) => void
  fetchDatesForMonth: (
    year: number,
    month: number
  ) => Promise<Array<{ date: string; mood: number | null }>>
}

function getMoodColor(mood: number | null): string {
  if (!mood) return "#9CA3AF" // gray — entry exists but no mood
  return MOODS[mood - 1].color
}

export function EntryCalendar({
  currentDate,
  onDateSelect,
  fetchDatesForMonth,
}: EntryCalendarProps) {
  const today = getTodayString()
  const [calYear, setCalYear] = useState(() =>
    parseInt(currentDate.split("-")[0])
  )
  const [calMonth, setCalMonth] = useState(() =>
    parseInt(currentDate.split("-")[1])
  )

  // TanStack Query keeps this cached + lint-safe (no setState-in-effect).
  const { data: entryDates = [] } = useQuery({
    queryKey: ["journalDates", calYear, calMonth],
    queryFn: () => fetchDatesForMonth(calYear, calMonth),
  })

  const [todayYear, todayMonth] = today.split("-").map(Number)
  const isCurrentCalMonth = calYear === todayYear && calMonth === todayMonth

  const goPrev = () => {
    const s = shiftMonth(calYear, calMonth, -1)
    setCalYear(s.year)
    setCalMonth(s.month)
  }
  const goNext = () => {
    if (isCurrentCalMonth) return
    const s = shiftMonth(calYear, calMonth, 1)
    setCalYear(s.year)
    setCalMonth(s.month)
  }

  const firstDayOfMonth = new Date(calYear, calMonth - 1, 1).getDay() // 0=Sun
  const leadingBlanks = Array.from({ length: firstDayOfMonth })
  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="premium-panel mt-8 rounded-lg p-5 xl:mt-0">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Past entries
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            className="rounded-md p-1 text-muted-foreground transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:bg-secondary hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[110px] text-center text-sm font-medium text-foreground">
            {getMonthName(calMonth)} {calYear}
          </span>
          <button
            onClick={goNext}
            disabled={isCurrentCalMonth}
            className="rounded-md p-1 text-muted-foreground transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="mb-1 grid grid-cols-7">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            className="flex h-7 items-center justify-center text-xs font-medium text-muted-foreground/60"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {leadingBlanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const dateString = buildDateString(calYear, calMonth, day)
          const entry = entryDates.find((e) => e.date === dateString)
          const isSelected = dateString === currentDate
          const isToday = dateString === today
          const isFuture = dateString > today

          return (
            <button
              key={day}
              type="button"
              disabled={isFuture}
              onClick={() => onDateSelect(dateString)}
              className={cn(
                "relative flex h-9 flex-col items-center justify-center rounded-md text-xs transition-all duration-150",
                isSelected && "-rotate-3 border-2 border-foreground/75 bg-brand font-bold text-white shadow-[2px_2px_0_color-mix(in_oklch,var(--foreground)_25%,transparent)]",
                !isSelected && isToday && "font-bold text-foreground",
                !isSelected &&
                  !isFuture &&
                  "text-foreground/80 hover:-translate-x-px hover:-translate-y-px hover:bg-secondary",
                isFuture && "cursor-default text-muted-foreground/40"
              )}
            >
              {day}
              {entry && !isSelected && (
                <span
                  className="absolute bottom-1 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: getMoodColor(entry.mood) }}
                />
              )}
              {entry && isSelected && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-white opacity-70" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/50 pt-3">
        <span className="text-xs text-muted-foreground/70">Entry dots:</span>
        {MOODS.map(({ level, label, color }) => (
          <div key={level} className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-muted-foreground/70">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#9CA3AF]" />
          <span className="text-xs text-muted-foreground/70">No mood</span>
        </div>
      </div>
    </div>
  )
}
