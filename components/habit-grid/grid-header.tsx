"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMonthName } from "@/lib/date-utils"

interface GridHeaderProps {
  year: number
  month: number
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  isCurrentMonth: boolean
}

export function GridHeader({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
  isCurrentMonth,
}: GridHeaderProps) {
  return (
    <div className="flex items-center gap-2 border-b p-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevMonth}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="min-w-[140px] text-center text-lg font-semibold text-gray-900">
        {getMonthName(month)} {year}
      </span>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNextMonth}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onToday}
        disabled={isCurrentMonth}
        className="ml-auto"
      >
        Today
      </Button>
    </div>
  )
}
