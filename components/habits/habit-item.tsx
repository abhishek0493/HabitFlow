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
          "relative z-10 rounded-md border-2 border-brand bg-card shadow-[4px_4px_0_color-mix(in_oklch,var(--foreground)_20%,transparent)]"
      )}
    >
      <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-brand opacity-70 transition-all duration-150 group-hover:opacity-100" />
      {/* Drag handle */}
      <button
        type="button"
        aria-label="Drag to reorder"
        className="cursor-grab touch-none rounded-md p-1 text-muted-foreground/50 transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:bg-secondary hover:text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span
        className="h-3.5 w-3.5 shrink-0 rounded-sm border-2 border-brand bg-brand/15 transition-transform duration-150 group-hover:rotate-6"
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
