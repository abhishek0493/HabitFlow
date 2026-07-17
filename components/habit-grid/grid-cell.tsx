"use client"

import { AnimatePresence, motion } from "motion/react"
import { Check } from "lucide-react"
import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

interface GridCellProps {
  isCompleted: boolean
  isToday: boolean // date is today
  isFuture: boolean // date is in the future
  color: string // habit hex color, used as fill when completed
  onClick: () => void
}

export function GridCell({
  isCompleted,
  isToday,
  isFuture,
  color,
  onClick,
}: GridCellProps) {
  return (
    <button
      onClick={onClick}
      disabled={isFuture}
      data-no-theme-tx
      className={cn(
        "group relative h-full w-full overflow-hidden border-b border-r border-border/35 bg-card/35 outline-none transition-colors duration-150 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        isFuture && "cursor-not-allowed bg-muted/20",
        !isFuture && "cursor-pointer hover:bg-brand/5"
      )}
    >
      {!isFuture && (
        <span
          className={cn(
            "doodle-check",
            isToday && "is-today",
            isCompleted && "is-done"
          )}
          style={{ "--doodle-color": color } as CSSProperties}
        >
          <AnimatePresence initial={false}>
            {isCompleted && (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.35, rotate: -24 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.35, rotate: 18 }}
                transition={{ type: "spring", stiffness: 560, damping: 23 }}
                className="relative z-10 grid place-items-center"
              >
                <Check className="size-4 stroke-[3]" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      )}
    </button>
  )
}
