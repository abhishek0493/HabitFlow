"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getAnalyticsData(daysLimit = 90) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorised")
  }

  // Calculate the start date in the local timezone and convert to UTC midnight string
  // to ensure consistency with how habit logs and journal entries are stored.
  const today = new Date()
  const start = new Date()
  start.setDate(today.getDate() - daysLimit)
  
  const y = start.getFullYear()
  const m = start.getMonth() + 1
  const d = start.getDate()
  const startDateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
  const startUtcDate = new Date(`${startDateStr}T00:00:00.000Z`)

  const [habits, logs, journalEntries, todos] = await Promise.all([
    // Fetch all active habits
    db.habit.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: { order: "asc" },
    }),
    // Fetch habit logs in the date range
    db.habitLog.findMany({
      where: {
        habit: { userId: session.user.id, isActive: true },
        date: { gte: startUtcDate },
      },
      select: {
        habitId: true,
        date: true,
        completed: true,
      },
    }),
    // Fetch journal entries with mood in the date range
    db.journalEntry.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startUtcDate },
      },
      select: {
        date: true,
        mood: true,
      },
    }),
    // Fetch todos in the date range (for task analytics)
    db.todo.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startUtcDate },
      },
      select: {
        date: true,
        completed: true,
        priority: true,
      },
    }),
  ])

  // Map dates to "YYYY-MM-DD" format to avoid timezone discrepancies on the client
  return {
    habits: habits.map(h => ({
      id: h.id,
      name: h.name,
      color: h.color,
      emoji: h.emoji,
      createdAt: h.createdAt.toISOString(),
    })),
    logs: logs.map((log) => ({
      habitId: log.habitId,
      date: log.date.toISOString().split("T")[0],
      completed: log.completed,
    })),
    moods: journalEntries.map((entry) => ({
      date: entry.date.toISOString().split("T")[0],
      mood: entry.mood,
    })),
    todos: todos.map((t) => ({
      date: t.date.toISOString().split("T")[0],
      completed: t.completed,
      priority: t.priority,
    })),
  }
}
