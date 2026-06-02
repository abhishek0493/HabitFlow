"use client"

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { motion } from "motion/react"
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
    <div className="relative flex flex-wrap items-center gap-2 border-b border-border/70 bg-card/35 p-4 backdrop-blur-xl">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevPeriod}
        aria-label="Previous period"
        className="rounded-full"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="flex min-w-[150px] items-center justify-center gap-2 text-center text-lg font-black tracking-tight text-foreground">
        {periodLabel}
        {isFetching && (
          <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin text-brand" />
        )}
      </span>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNextPeriod}
        aria-label="Next period"
        className="rounded-full"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onToday}
        disabled={isCurrentPeriod}
        className="rounded-full"
      >
        Today
      </Button>

      {/* View toggle — segmented control with a sliding indicator */}
      <div className="ml-auto flex rounded-full border border-border/80 bg-muted/60 p-0.5 shadow-inner backdrop-blur-md">
        {(["month", "week"] as const).map((mode) => {
          const active = view === mode
          return (
            <button
              key={mode}
              type="button"
              onClick={() => onViewChange(mode)}
              className={cn(
                "relative rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors",
                active
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="view-indicator"
                  className="absolute inset-0 -z-0 rounded-full bg-brand-gradient shadow-lg shadow-brand/30"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{mode}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
