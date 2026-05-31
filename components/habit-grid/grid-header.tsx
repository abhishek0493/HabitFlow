"use client"

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  getMonthName,
  getWeekDays,
  formatWeekRange,
} from "@/lib/date-utils"

type ViewMode = "month" | "week"

interface GridHeaderProps {
  // Month view
  year: number
  month: number
  // Week view
  weekStart: Date
  // Shared
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  onPrevPeriod: () => void
  onNextPeriod: () => void
  onToday: () => void
  isCurrentPeriod: boolean
  isFetching: boolean
}

export function GridHeader({
  year,
  month,
  weekStart,
  view,
  onViewChange,
  onPrevPeriod,
  onNextPeriod,
  onToday,
  isCurrentPeriod,
  isFetching,
}: GridHeaderProps) {
  const periodLabel =
    view === "month"
      ? `${getMonthName(month)} ${year}`
      : formatWeekRange(getWeekDays(weekStart)[0], getWeekDays(weekStart)[6])

  return (
    <div className="flex flex-wrap items-center gap-3 border-b p-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevPeriod}
        aria-label="Previous period"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="flex min-w-[140px] items-center justify-center gap-2 text-center text-lg font-semibold text-gray-900">
        {periodLabel}
        {isFetching && (
          <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin text-gray-400" />
        )}
      </span>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNextPeriod}
        aria-label="Next period"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onToday}
        disabled={isCurrentPeriod}
      >
        Today
      </Button>

      {/* View toggle — segmented control */}
      <div className="ml-auto flex overflow-hidden rounded-md border border-gray-200">
        <button
          type="button"
          onClick={() => onViewChange("month")}
          className={cn(
            "px-3 py-1.5 text-sm font-medium transition-colors",
            view === "month"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          Month
        </button>
        <button
          type="button"
          onClick={() => onViewChange("week")}
          className={cn(
            "border-l border-gray-200 px-3 py-1.5 text-sm font-medium transition-colors",
            view === "week"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          Week
        </button>
      </div>
    </div>
  )
}
