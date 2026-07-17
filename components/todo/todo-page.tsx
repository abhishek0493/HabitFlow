"use client"

import { useEffect, useState, useTransition } from "react"
import { motion } from "motion/react"
import { ListChecks, CornerDownRight, Sparkles, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import {
  getTodos,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
  reorderTodos,
  carryOverTodos,
  getTodoCountsForMonth,
} from "@/actions/todo.actions"
import { buildDateString, getTodayString } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { TodoDateNav } from "@/components/todo/todo-date-nav"
import { AddTodoForm } from "@/components/todo/add-todo-form"
import { TodoList } from "@/components/todo/todo-list"
import { TodoCalendar } from "@/components/todo/todo-calendar"
import type { Todo } from "@/components/todo/types"
import type { Priority, TodoFormValues } from "@/lib/validations"

interface TodoPageProps {
  initialDate: string
  initialTodos: Todo[]
}

// Previous calendar day as "YYYY-MM-DD" (local-safe).
function prevDay(dateString: string): string {
  const [y, m, d] = dateString.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() - 1)
  return buildDateString(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function TodoPage({ initialDate, initialTodos }: TodoPageProps) {
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [, startTransition] = useTransition()

  const bumpCalendar = () => setRefreshKey((k) => k + 1)

  // Keep the URL in sync with the selected date.
  useEffect(() => {
    if (currentDate === getTodayString()) {
      window.history.replaceState(null, "", "/todos")
    } else {
      window.history.replaceState(null, "", `/todos?date=${currentDate}`)
    }
  }, [currentDate])

  const total = todos.length
  const done = todos.filter((t) => t.completed).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  async function handleDateChange(newDate: string) {
    if (newDate === currentDate) return
    setIsLoading(true)
    const fetched = await getTodos(newDate)
    setTodos(fetched)
    setCurrentDate(newDate)
    setIsLoading(false)
  }

  function handleAdd({ title, priority }: { title: string; priority: Priority }) {
    const tempId = `temp-${Date.now()}`
    const optimistic: Todo = {
      id: tempId,
      date: currentDate,
      title,
      notes: null,
      priority,
      completed: false,
      order: todos.length,
    }
    setTodos((prev) => [...prev, optimistic])

    startTransition(async () => {
      const res = await createTodo({ date: currentDate, title, priority })
      if (res?.error || !res?.todo) {
        toast.error(res?.error ?? "Could not add task")
        setTodos((prev) => prev.filter((t) => t.id !== tempId))
        return
      }
      // Swap the temp row for the persisted one.
      setTodos((prev) => prev.map((t) => (t.id === tempId ? res.todo! : t)))
      bumpCalendar()
    })
  }

  function handleToggle(id: string) {
    const snapshot = todos
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
    startTransition(async () => {
      const res = await toggleTodo(id)
      if (res?.error) {
        toast.error(res.error)
        setTodos(snapshot)
        return
      }
      bumpCalendar()
    })
  }

  function handleUpdate(id: string, values: TodoFormValues) {
    const snapshot = todos
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              title: values.title,
              notes: values.notes?.trim() || null,
              priority: values.priority,
            }
          : t
      )
    )
    startTransition(async () => {
      const res = await updateTodo(id, values)
      if (res?.error) {
        toast.error(res.error)
        setTodos(snapshot)
      }
    })
  }

  function handleDelete(id: string) {
    const snapshot = todos
    setTodos((prev) => prev.filter((t) => t.id !== id))
    startTransition(async () => {
      const res = await deleteTodo(id)
      if (res?.error) {
        toast.error(res.error)
        setTodos(snapshot)
        return
      }
      bumpCalendar()
    })
  }

  function handleReorder(orderedIds: string[]) {
    const snapshot = todos
    const byId = new Map(todos.map((t) => [t.id, t]))
    setTodos(orderedIds.map((id) => byId.get(id)!).filter(Boolean))
    startTransition(async () => {
      const res = await reorderTodos(orderedIds)
      if (res?.error) {
        toast.error("Could not save the new order")
        setTodos(snapshot)
      }
    })
  }

  function handleCarryOver() {
    const from = prevDay(currentDate)
    startTransition(async () => {
      const res = await carryOverTodos(from, currentDate)
      if (res?.error) {
        toast.error(res.error)
        return
      }
      if (!res?.moved) {
        toast.info("No unfinished tasks from the previous day.")
        return
      }
      const fetched = await getTodos(currentDate)
      setTodos(fetched)
      bumpCalendar()
      toast.success(
        `Carried over ${res.moved} task${res.moved === 1 ? "" : "s"}.`
      )
    })
  }

  return (
    <div className="page-frame animate-fade-in">
      <div className="page-intro">
        <div>
          <p className="doodle-label">01 · Make room for focus</p>
          <h1 className="page-title">Tasks</h1>
        </div>
        <p className="page-deck">
          A clear, considered list for the things that deserve your attention
          today—and nothing more.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <TodoDateNav currentDate={currentDate} onDateChange={handleDateChange} />
          <div
            className="mt-6 space-y-4 transition-opacity duration-300"
            style={{ opacity: isLoading ? 0.5 : 1 }}
          >
            <div className="premium-panel flex items-center gap-5 rounded-[1.5rem] p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {total === 0
                      ? "Nothing planned yet"
                      : `${done} of ${total} done`}
                  </p>
                  <span className="font-mono text-sm font-bold text-brand">
                    {pct}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-brand-gradient"
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </div>

            <AddTodoForm onAdd={handleAdd} />

            <div className="premium-panel overflow-hidden rounded-[1.5rem]">
              <div className="flex items-center justify-between border-b border-border/70 bg-card/35 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-brand" />
                  Tasks
                </span>
                <Button
                  variant="ghost"
                  size="xs"
                  className="gap-1.5 text-[11px] font-semibold normal-case tracking-normal"
                  onClick={handleCarryOver}
                >
                  <CornerDownRight className="h-3.5 w-3.5" />
                  Carry over unfinished
                </Button>
              </div>

              {total === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand ring-1 ring-brand/20">
                    <ListChecks className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl text-foreground">
                    A clear plate
                  </h2>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Add your first task above to start shaping the day.
                  </p>
                </div>
              ) : (
                <TodoList
                  todos={todos}
                  onToggle={handleToggle}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onReorder={handleReorder}
                />
              )}
            </div>
          </div>
        </div>
        <aside className="xl:pt-1">
          <TodoCalendar
            currentDate={currentDate}
            onDateSelect={handleDateChange}
            fetchCountsForMonth={getTodoCountsForMonth}
            refreshKey={refreshKey}
          />
        </aside>
      </div>
    </div>
  )
}
