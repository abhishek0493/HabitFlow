"use client"

import { AnimatePresence, motion } from "motion/react"
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
        "group relative h-full w-full border-b border-r border-border/60 outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        isFuture && "cursor-not-allowed bg-muted/40",
        !isFuture && "cursor-pointer"
      )}
    >
      {/* today marker on empty cells */}
      {!isCompleted && !isFuture && isToday && (
        <span className="absolute inset-[3px] rounded-[5px] bg-brand/10 ring-1 ring-inset ring-brand/30" />
      )}

      {/* hover hint on empty, non-future cells */}
      {!isCompleted && !isFuture && (
        <span className="absolute inset-[3px] rounded-[5px] bg-foreground/0 transition-colors duration-150 group-hover:bg-foreground/10" />
      )}

      {/* completed fill — springs in/out */}
      <AnimatePresence initial={false}>
        {isCompleted && (
          <motion.span
            key="fill"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 26 }}
            className="absolute inset-[3px] rounded-[5px] shadow-sm"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 10px -2px ${color}80`,
            }}
          />
        )}
      </AnimatePresence>
    </button>
  )
}
