"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export const MOODS = [
  { level: 1, emoji: "😔", label: "Rough", color: "#EF4444" },
  { level: 2, emoji: "😕", label: "Meh", color: "#F97316" },
  { level: 3, emoji: "😐", label: "Okay", color: "#EAB308" },
  { level: 4, emoji: "🙂", label: "Good", color: "#84CC16" },
  { level: 5, emoji: "😄", label: "Amazing", color: "#22C55E" },
] as const

interface MoodPickerProps {
  selectedMood: number | null
  onSelect: (mood: number | null) => void
  disabled?: boolean
}

export function MoodPicker({
  selectedMood,
  onSelect,
  disabled,
}: MoodPickerProps) {
  const [poppingLevel, setPoppingLevel] = useState<number | null>(null)

  const handleSelect = (level: number) => {
    onSelect(level === selectedMood ? null : level) // toggle off if same
    setPoppingLevel(level)
    setTimeout(() => setPoppingLevel(null), 350)
  }

  return (
    <div className="px-6 pb-5 pt-5">
      {/* Label */}
      <p className="mb-4 text-sm font-bold text-muted-foreground">
        How are you feeling today?
      </p>

      {/* Mood buttons */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {MOODS.map(({ level, emoji, label, color }) => {
          const isSelected = selectedMood === level
          const isPopping = poppingLevel === level

          return (
            <button
              key={level}
              type="button"
              onClick={() => handleSelect(level)}
              disabled={disabled}
              data-no-theme-tx
              className={cn(
                "group flex flex-col items-center gap-1.5 transition-all duration-150 focus-visible:outline-none",
                "rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                disabled && "cursor-not-allowed opacity-50"
              )}
              aria-label={`Mood: ${label}`}
              aria-pressed={isSelected}
            >
              {/* Circle */}
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300",
                  "group-hover:-translate-y-1 group-hover:scale-110 group-hover:shadow-lg",
                  isSelected ? "scale-105" : "scale-100",
                  isPopping && "mood-pop",
                  !isSelected && "bg-muted group-hover:bg-muted-foreground/20"
                )}
                style={
                  isSelected
                    ? {
                        backgroundColor: `${color}20`,
                        border: `2px solid ${color}`,
                        boxShadow: `0 0 0 4px ${color}15`,
                      }
                    : undefined
                }
              >
                <span className="select-none text-3xl leading-none">
                  {emoji}
                </span>
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-xs transition-all duration-150",
                  isSelected
                    ? "font-semibold"
                    : "font-medium text-muted-foreground"
                )}
                style={isSelected ? { color } : undefined}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
