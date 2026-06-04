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

interface DayCount {
  date: string
  total: number
  completed: number
}

interface TodoCalendarProps {
  currentDate: string
  onDateSelect: (date: string) => void
  fetchCountsForMonth: (year: number, month: number) => Promise<DayCount[]>
  // Bumped whenever tasks mutate, so the visible month refetches its dots.
  refreshKey: number
}

// Maps a day's progress to a dot colour:
//  - all done → emerald, partially done → amber, none done → muted brand.
function dotColor(day: DayCount): string {
  if (day.total === 0) return "transparent"
  if (day.completed >= day.total) return "#10b981"
  if (day.completed > 0) return "#f59e0b"
  return "#94a3b8"
}

export function TodoCalendar({
  currentDate,
  onDateSelect,
  fetchCountsForMonth,
  refreshKey,
}: TodoCalendarProps) {
  const today = getTodayString()
  const [calYear, setCalYear] = useState(() =>
    parseInt(currentDate.split("-")[0])
  )
  const [calMonth, setCalMonth] = useState(() =>
    parseInt(currentDate.split("-")[1])
  )

  const { data: counts = [] } = useQuery({
    queryKey: ["todoCounts", calYear, calMonth, refreshKey],
    queryFn: () => fetchCountsForMonth(calYear, calMonth),
  })

  const goPrev = () => {
    const s = shiftMonth(calYear, calMonth, -1)
    setCalYear(s.year)
    setCalMonth(s.month)
  }
  const goNext = () => {
    const s = shiftMonth(calYear, calMonth, 1)
    setCalYear(s.year)
    setCalMonth(s.month)
  }

  const firstDayOfMonth = new Date(calYear, calMonth - 1, 1).getDay()
  const leadingBlanks = Array.from({ length: firstDayOfMonth })
  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="premium-panel mt-8 rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Task calendar
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            className="rounded-lg p-1 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[110px] text-center text-sm font-medium text-foreground">
            {getMonthName(calMonth)} {calYear}
          </span>
          <button
            onClick={goNext}
            className="rounded-lg p-1 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-foreground"
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
          const dayCount = counts.find((c) => c.date === dateString)
          const isSelected = dateString === currentDate
          const isToday = dateString === today

          return (
            <button
              key={day}
              type="button"
              onClick={() => onDateSelect(dateString)}
              className={cn(
                "relative flex h-9 flex-col items-center justify-center rounded-lg text-xs transition-all duration-300",
                isSelected &&
                  "bg-brand font-bold text-primary-foreground",
                !isSelected && isToday && "font-bold text-foreground ring-1 ring-inset ring-brand/40",
                !isSelected &&
                  "text-foreground/80 hover:-translate-y-0.5 hover:bg-accent"
              )}
            >
              {day}
              {dayCount && dayCount.total > 0 && (
                <span
                  className="absolute bottom-1 h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(255,255,255,0.8)"
                      : dotColor(dayCount),
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/50 pt-3">
        <span className="text-xs text-muted-foreground/70">Progress:</span>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#10b981]" />
          <span className="text-xs text-muted-foreground/70">All done</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
          <span className="text-xs text-muted-foreground/70">In progress</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#94a3b8]" />
          <span className="text-xs text-muted-foreground/70">Not started</span>
        </div>
      </div>
    </div>
  )
}
