"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo (default)
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#ec4899", // pink
  "#f43f5e", // rose
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_COLORS.map((color) => {
        const isSelected = value.toLowerCase() === color.toLowerCase()
        return (
          <button
            key={color}
            type="button"
            aria-label={`Select colour ${color}`}
            aria-pressed={isSelected}
            onClick={() => onChange(color)}
            style={{ backgroundColor: color }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md border-2 border-foreground/20 ring-2 ring-transparent ring-offset-2 ring-offset-card transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:rotate-3",
              isSelected && "-rotate-3 scale-110 border-foreground/80 ring-foreground shadow-[2px_2px_0_color-mix(in_oklch,var(--foreground)_22%,transparent)]"
            )}
          >
            {isSelected && <Check className="h-4 w-4 text-white" />}
          </button>
        )
      })}
    </div>
  )
}
