"use client"

import { useState, useTransition } from "react"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CalendarCheck2 } from "lucide-react"
import { toast } from "sonner"
import type { Habit } from "@/lib/generated/prisma/client"
import { reorderHabits } from "@/actions/habit.actions"
import { HabitItem } from "@/components/habits/habit-item"
import { AddHabitModal } from "@/components/habits/add-habit-modal"

interface HabitsClientProps {
  initialHabits: Habit[]
}

export function HabitsClient({ initialHabits }: HabitsClientProps) {
  const [habits, setHabits] = useState(initialHabits)
  const [, startTransition] = useTransition()

  // Keep local state in sync when the server revalidates (add/edit/delete).
  // Sync during render (not in an effect) per React's "adjust state on prop
  // change" pattern — avoids a cascading-render effect.
  const [syncedHabits, setSyncedHabits] = useState(initialHabits)
  if (syncedHabits !== initialHabits) {
    setSyncedHabits(initialHabits)
    setHabits(initialHabits)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setHabits((prev) => {
      const oldIndex = prev.findIndex((h) => h.id === active.id)
      const newIndex = prev.findIndex((h) => h.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev

      const reordered = arrayMove(prev, oldIndex, newIndex)

      // Fire the server action in the background; revert on failure.
      startTransition(async () => {
        const result = await reorderHabits(reordered.map((h) => h.id))
        if (result?.error) {
          toast.error("Could not save new order. Please try again.")
          setHabits(prev) // revert to the snapshot before the drag
        }
      })

      return reordered
    })
  }

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Habits</h1>
        <AddHabitModal />
      </div>

      {/* List card */}
      <div className="rounded-lg border bg-white shadow-sm">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <CalendarCheck2 className="h-12 w-12 text-gray-300" />
            <h2 className="text-lg font-medium text-gray-900">No habits yet</h2>
            <p className="max-w-sm text-sm text-gray-500">
              Add your first habit to start tracking your progress.
            </p>
            <div className="mt-2">
              <AddHabitModal />
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={habits.map((h) => h.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="divide-y">
                {habits.map((habit) => (
                  <li key={habit.id}>
                    <HabitItem habit={habit} />
                  </li>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
