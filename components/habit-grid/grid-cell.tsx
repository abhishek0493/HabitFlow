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
        "group relative h-full w-full overflow-hidden border-b border-r border-border/45 bg-card/20 outline-none transition-transform duration-200 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        isFuture && "cursor-not-allowed bg-muted/30",
        !isFuture && "cursor-pointer"
      )}
    >
      {/* today marker on empty cells */}
      {!isCompleted && !isFuture && isToday && (
        <span className="absolute inset-[3px] rounded-md bg-brand/10 ring-1 ring-inset ring-brand/40 shadow-[0_0_16px_var(--brand)]" />
      )}

      {/* hover hint on empty, non-future cells */}
      {!isCompleted && !isFuture && (
        <span className="absolute inset-[3px] rounded-md bg-foreground/0 transition-all duration-200 group-hover:scale-90 group-hover:bg-foreground/10 group-hover:ring-1 group-hover:ring-brand/20" />
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
            className="absolute inset-[3px] rounded-md shadow-sm"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 18px -2px ${color}b0, inset 0 1px 0 rgba(255,255,255,0.35)`,
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {isCompleted && (
          <motion.span
            key="spark"
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.48, ease: "easeOut" }}
            className="absolute inset-[5px] rounded-md border"
            style={{ borderColor: color }}
          />
        )}
      </AnimatePresence>
    </button>
  )
}
