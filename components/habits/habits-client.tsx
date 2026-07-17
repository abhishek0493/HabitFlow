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
import { CalendarCheck2, GripVertical, Sparkles } from "lucide-react"
import { motion } from "motion/react"
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
    <div className="page-frame animate-fade-in">
      {/* Page header */}
      <div className="page-intro">
        <div>
          <p className="doodle-label">04 · Shape your rhythm</p>
          <h1 className="page-title">Habits</h1>
        </div>
        <div>
          <p className="page-deck mb-5">
            Keep the rituals that matter in one considered collection. Arrange
            them until the rhythm feels like yours.
          </p>
          <AddHabitModal />
        </div>
      </div>

      {/* List card */}
      <div className="premium-panel overflow-hidden rounded-[1.5rem]">
        <div className="flex items-center justify-between border-b border-border/70 bg-card/35 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            Your habits
          </span>
          <span className="flex items-center gap-2">
            <GripVertical className="h-3.5 w-3.5" />
            Rearrange freely
          </span>
        </div>
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 ring-1 ring-inset ring-brand/20">
              <span className="absolute inset-0 animate-glow-pulse rounded-2xl bg-brand-gradient opacity-30 blur-xl" />
              <CalendarCheck2 className="h-8 w-8 text-brand" />
            </div>
            <h2 className="text-3xl text-foreground">
              No habits yet
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
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
              <ul className="divide-y divide-border/65">
                {habits.map((habit, i) => (
                  <motion.li
                    key={habit.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(i * 0.04, 0.3),
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <HabitItem habit={habit} />
                  </motion.li>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
