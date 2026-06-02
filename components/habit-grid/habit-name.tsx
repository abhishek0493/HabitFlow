"use client"

import { useEffect, useRef, useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface HabitNameLabelProps {
  name: string
  className?: string
}

/**
 * Habit name that truncates to its column and reveals the full name in a
 * tooltip on hover/focus — but only when the text is actually clipped.
 * Overflow is measured with a ResizeObserver so the setState stays out of the
 * effect body (keeps the react-hooks lint rule happy) and re-measures on resize.
 */
export function HabitNameLabel({ name, className }: HabitNameLabelProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setIsTruncated(el.scrollWidth > el.clientWidth + 1)
    const ro = new ResizeObserver(measure)
    ro.observe(el) // fires once immediately, then on any width change
    return () => ro.disconnect()
  }, [])

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            ref={ref}
            className={cn(
              "block min-w-0 flex-1 truncate",
              isTruncated && "cursor-default",
              className
            )}
          />
        }
      >
        {name}
      </TooltipTrigger>
      {isTruncated && (
        <TooltipContent side="top" align="start" className="max-w-xs font-medium">
          {name}
        </TooltipContent>
      )}
    </Tooltip>
  )
}
