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
        "group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50",
        isDragging && "relative z-10 rounded-md bg-white shadow-lg"
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        aria-label="Drag to reorder"
        className="cursor-grab touch-none text-gray-400 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Colour dot */}
      <span
        className="h-4 w-4 shrink-0 rounded-full"
        style={{ backgroundColor: habit.color }}
        aria-hidden
      />

      {/* Emoji */}
      {habit.emoji && (
        <span className="text-base leading-none">{habit.emoji}</span>
      )}

      {/* Name */}
      <span className="text-sm font-medium text-gray-900">{habit.name}</span>

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
