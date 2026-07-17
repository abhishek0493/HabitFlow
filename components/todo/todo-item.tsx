"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { EditTodoDialog } from "@/components/todo/edit-todo-dialog"
import { PRIORITY_META } from "@/components/todo/priority"
import type { Todo } from "@/components/todo/types"
import type { TodoFormValues } from "@/lib/validations"

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onUpdate: (id: string, values: TodoFormValues) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const meta = PRIORITY_META[todo.priority]
  const PriorityIcon = meta.icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-start gap-3 overflow-hidden px-4 py-3 transition-all duration-300 hover:bg-accent/45",
        isDragging &&
          "relative z-10 rounded-md border-2 border-brand bg-card shadow-[4px_4px_0_color-mix(in_oklch,var(--foreground)_20%,transparent)]"
      )}
    >
      {/* Priority accent bar */}
      <span
        className="absolute inset-y-2 left-0 w-1 rounded-r-full opacity-70 transition-all duration-150 group-hover:opacity-100"
        style={{ backgroundColor: meta.color }}
        aria-hidden
      />

      {/* Drag handle */}
      <button
        type="button"
        aria-label="Drag to reorder"
        className="mt-0.5 cursor-grab touch-none rounded-md p-1 text-muted-foreground/40 transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:bg-secondary hover:text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Checkbox */}
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        className="mt-0.5"
        aria-label={todo.completed ? "Mark as not done" : "Mark as done"}
      />

      {/* Title + notes */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-semibold text-foreground transition-all duration-300",
            todo.completed && "text-muted-foreground line-through decoration-muted-foreground/60"
          )}
        >
          {todo.title}
        </p>
        {todo.notes && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {todo.notes}
          </p>
        )}
      </div>

      {/* Priority badge */}
      <span
        className={cn(
          "mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset",
          meta.badgeClass
        )}
      >
        <PriorityIcon className="size-3" />
        <span className="hidden sm:inline">{meta.label}</span>
      </span>

      {/* Actions — visible on hover/focus */}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <EditTodoDialog
          todo={todo}
          onSave={(values) => onUpdate(todo.id, values)}
        />
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          aria-label="Delete task"
          onClick={() => onDelete(todo.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
