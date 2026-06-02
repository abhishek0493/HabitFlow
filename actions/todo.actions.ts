"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { Priority } from "@/lib/validations"

// Todos are stored against a @db.Date column. We parse "YYYY-MM-DD" as UTC
// midnight (matching the habit-log / journal convention) so the calendar day
// is preserved regardless of the server timezone.
function toUtcDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`)
}

type TodoDTO = {
  id: string
  date: string
  title: string
  notes: string | null
  priority: Priority
  completed: boolean
  order: number
}

// Serialise a Prisma Todo into a plain, client-safe shape (Date → string).
function serialise(todo: {
  id: string
  date: Date
  title: string
  notes: string | null
  priority: Priority
  completed: boolean
  order: number
}): TodoDTO {
  return {
    id: todo.id,
    date: todo.date.toISOString().split("T")[0],
    title: todo.title,
    notes: todo.notes,
    priority: todo.priority,
    completed: todo.completed,
    order: todo.order,
  }
}

// ─── Fetch a single day's tasks ───────────────────────────────────────────────

export async function getTodos(date: string): Promise<TodoDTO[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  const todos = await db.todo.findMany({
    where: { userId: session.user.id, date: toUtcDate(date) },
    orderBy: { order: "asc" },
  })

  return todos.map(serialise)
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createTodo(data: {
  date: string
  title: string
  notes?: string
  priority?: Priority
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorised" }

  const title = data.title.trim()
  if (!title) return { error: "Task title is required" }

  // Append to the end of that day's list.
  const count = await db.todo.count({
    where: { userId: session.user.id, date: toUtcDate(data.date) },
  })

  const todo = await db.todo.create({
    data: {
      userId: session.user.id,
      date: toUtcDate(data.date),
      title,
      notes: data.notes?.trim() || null,
      priority: data.priority ?? "MEDIUM",
      order: count,
    },
  })

  revalidatePath("/todos")
  return { success: true, todo: serialise(todo) }
}

// ─── Update (title / notes / priority) ────────────────────────────────────────

export async function updateTodo(
  id: string,
  data: { title: string; notes?: string; priority: Priority }
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorised" }

  const existing = await db.todo.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) return { error: "Task not found" }

  const todo = await db.todo.update({
    where: { id },
    data: {
      title: data.title.trim(),
      notes: data.notes?.trim() || null,
      priority: data.priority,
    },
  })

  revalidatePath("/todos")
  return { success: true, todo: serialise(todo) }
}

// ─── Toggle completion ────────────────────────────────────────────────────────

export async function toggleTodo(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorised" }

  const existing = await db.todo.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) return { error: "Task not found" }

  const completed = !existing.completed
  await db.todo.update({
    where: { id },
    data: { completed, completedAt: completed ? new Date() : null },
  })

  revalidatePath("/todos")
  return { completed }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteTodo(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorised" }

  const existing = await db.todo.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) return { error: "Task not found" }

  await db.todo.delete({ where: { id } })

  revalidatePath("/todos")
  return { success: true }
}

// ─── Reorder a day's tasks ────────────────────────────────────────────────────

export async function reorderTodos(orderedIds: string[]) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorised" }

  const userId = session.user.id

  // Ownership guard — only reorder tasks that belong to this user.
  const owned = await db.todo.findMany({
    where: { id: { in: orderedIds }, userId },
    select: { id: true },
  })
  const ownedIds = new Set(owned.map((t) => t.id))
  const safeIds = orderedIds.filter((id) => ownedIds.has(id))

  await db.$transaction(
    safeIds.map((id, index) =>
      db.todo.update({ where: { id }, data: { order: index } })
    )
  )

  revalidatePath("/todos")
  return { success: true }
}

// ─── Clear completed tasks for a day ──────────────────────────────────────────

export async function clearCompletedTodos(date: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorised" }

  await db.todo.deleteMany({
    where: { userId: session.user.id, date: toUtcDate(date), completed: true },
  })

  revalidatePath("/todos")
  return { success: true }
}

// ─── Carry unfinished tasks forward from a previous day ───────────────────────
// Moves every incomplete task from `fromDate` onto `toDate`, appending them to
// the end of the destination day's list. Returns how many were carried over.

export async function carryOverTodos(fromDate: string, toDate: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorised" }

  const userId = session.user.id

  const unfinished = await db.todo.findMany({
    where: { userId, date: toUtcDate(fromDate), completed: false },
    orderBy: { order: "asc" },
  })
  if (unfinished.length === 0) return { success: true, moved: 0 }

  const baseOrder = await db.todo.count({
    where: { userId, date: toUtcDate(toDate) },
  })

  await db.$transaction(
    unfinished.map((todo, i) =>
      db.todo.update({
        where: { id: todo.id },
        data: { date: toUtcDate(toDate), order: baseOrder + i },
      })
    )
  )

  revalidatePath("/todos")
  return { success: true, moved: unfinished.length }
}

// ─── Per-day counts for the calendar (total + completed) ──────────────────────

export async function getTodoCountsForMonth(year: number, month: number) {
  const session = await auth()
  if (!session?.user?.id) return []

  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 0))

  const todos = await db.todo.findMany({
    where: {
      userId: session.user.id,
      date: { gte: start, lte: end },
    },
    select: { date: true, completed: true },
  })

  // Aggregate into { date, total, completed } per day.
  const byDate = new Map<string, { total: number; completed: number }>()
  for (const t of todos) {
    const key = t.date.toISOString().split("T")[0]
    const entry = byDate.get(key) ?? { total: 0, completed: 0 }
    entry.total += 1
    if (t.completed) entry.completed += 1
    byDate.set(key, entry)
  }

  return Array.from(byDate.entries()).map(([date, v]) => ({ date, ...v }))
}
