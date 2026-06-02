"use client"

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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { motion, AnimatePresence } from "motion/react"
import { TodoItem } from "@/components/todo/todo-item"
import type { Todo } from "@/components/todo/types"
import type { TodoFormValues } from "@/lib/validations"

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string) => void
  onUpdate: (id: string, values: TodoFormValues) => void
  onDelete: (id: string) => void
  onReorder: (orderedIds: string[]) => void
}

export function TodoList({
  todos,
  onToggle,
  onUpdate,
  onDelete,
  onReorder,
}: TodoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = todos.findIndex((t) => t.id === active.id)
    const newIndex = todos.findIndex((t) => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...todos]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    onReorder(reordered.map((t) => t.id))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={todos.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="divide-y divide-border/65">
          <AnimatePresence initial={false}>
            {todos.map((todo) => (
              <motion.li
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <TodoItem
                  todo={todo}
                  onToggle={onToggle}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </SortableContext>
    </DndContext>
  )
}
