"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { EditHabitModal } from "@/components/habits/edit-habit-modal"
import { DeleteHabitDialog } from "@/components/habits/delete-habit-dialog"

interface HabitItemProps {
  habit: {
    id: string
    name: string
    color: string
    emoji: string | null
    order: number
  }
}

export function HabitItem({ habit }: HabitItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden px-4 py-3.5 transition-all duration-300 hover:bg-accent/45",
        isDragging &&
          "relative z-10 rounded-xl bg-card shadow-2xl shadow-brand/15 ring-1 ring-brand/25"
      )}
    >
      <span
        className="absolute inset-y-2 left-0 w-1 rounded-r-full opacity-70 transition-all duration-300 group-hover:opacity-100"
        style={{ backgroundColor: habit.color, boxShadow: `0 0 18px ${habit.color}` }}
      />
      {/* Drag handle */}
      <button
        type="button"
        aria-label="Drag to reorder"
        className="cursor-grab touch-none rounded-lg p-1 text-muted-foreground/50 transition-all duration-300 hover:-translate-y-0.5 hover:bg-muted hover:text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Colour dot */}
      <span
        className="h-4 w-4 shrink-0 rounded-full ring-2 ring-inset ring-white/20 transition-transform duration-300 group-hover:scale-125"
        style={{
          backgroundColor: habit.color,
          boxShadow: `0 0 14px -1px ${habit.color}a0`,
        }}
        aria-hidden
      />

      {/* Emoji */}
      {habit.emoji && (
        <span className="text-base leading-none transition-transform duration-300 group-hover:scale-125">
          {habit.emoji}
        </span>
      )}

      {/* Name */}
      <span className="text-sm font-bold text-foreground">{habit.name}</span>

      {/* Spacer */}
      <span className="flex-1" />

      {/* Actions — only visible on row hover */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <EditHabitModal habit={habit} />
        <DeleteHabitDialog habitId={habit.id} habitName={habit.name} />
      </div>
    </div>
  )
}
