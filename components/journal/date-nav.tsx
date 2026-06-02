"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { buildDateString, getTodayString } from "@/lib/date-utils"

interface DateNavProps {
  currentDate: string // "YYYY-MM-DD"
  onDateChange: (date: string) => void
}

// Display label split into weekday + rest, so the weekday can be hidden on
// small screens (e.g. mobile shows "June 1, 2026", desktop "Sunday, June 1, 2026").
function formatDisplayParts(dateString: string): {
  weekday: string
  rest: string
} {
  const [year, month, day] = dateString.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    rest: date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }
}

// Shift by one day using LOCAL calendar components (avoids the UTC off-by-one
// that toISOString() causes in timezones ahead of UTC, e.g. IST).
function shiftDay(dateString: string, direction: 1 | -1): string {
  const [y, m, d] = dateString.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + direction)
  return buildDateString(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function DateNav({ currentDate, onDateChange }: DateNavProps) {
  const [open, setOpen] = useState(false)
  const today = getTodayString()
  const isToday = currentDate === today

  return (
    <div className="premium-panel mx-auto flex max-w-2xl items-center gap-2 rounded-2xl p-2">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label="Previous day"
        onClick={() => onDateChange(shiftDay(currentDate, -1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              className="min-w-0 flex-1 gap-2 rounded-full px-3 text-base font-bold tracking-tight"
            />
          }
        >
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="hidden sm:inline">
            {formatDisplayParts(currentDate).weekday},&nbsp;
          </span>
          {formatDisplayParts(currentDate).rest}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={new Date(`${currentDate}T12:00:00`)}
            disabled={{ after: new Date() }}
            defaultMonth={new Date(`${currentDate}T12:00:00`)}
            onSelect={(d) => {
              if (!d) return
              onDateChange(
                buildDateString(d.getFullYear(), d.getMonth() + 1, d.getDate())
              )
              setOpen(false)
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label="Next day"
        disabled={isToday}
        onClick={() => onDateChange(shiftDay(currentDate, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="ml-auto rounded-full"
        disabled={isToday}
        onClick={() => onDateChange(today)}
      >
        Today
      </Button>
    </div>
  )
}
