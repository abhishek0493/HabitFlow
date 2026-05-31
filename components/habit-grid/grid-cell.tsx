"use client"

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
      className={cn(
        "h-full w-full border-b border-r border-gray-100 transition-colors duration-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500",
        !isCompleted && !isFuture && isToday && "bg-blue-50",
        !isCompleted && !isFuture && !isToday && "hover:bg-gray-100",
        isFuture && "cursor-not-allowed bg-gray-50 opacity-50"
      )}
      style={isCompleted ? { backgroundColor: color } : undefined}
    />
  )
}
