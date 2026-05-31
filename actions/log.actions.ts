"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// ─── Fetch logs for a given month ─────────────────────────────────────────────

export async function getHabitLogsForMonth(year: number, month: number) {
  const session = await auth()
  if (!session?.user?.id) return []

  // Use UTC dates to match @db.Date storage
  const startDate = new Date(Date.UTC(year, month - 1, 1))
  const endDate = new Date(Date.UTC(year, month, 0)) // last day of month

  const logs = await db.habitLog.findMany({
    where: {
      habit: { userId: session.user.id, isActive: true },
      date: { gte: startDate, lte: endDate },
    },
    select: {
      habitId: true,
      date: true,
      completed: true,
    },
  })

  // Return dates as "YYYY-MM-DD" strings so the client can compare
  // without timezone ambiguity
  return logs.map((log) => ({
    habitId: log.habitId,
    date: log.date.toISOString().split("T")[0],
    completed: log.completed,
  }))
}

export type HabitLogEntry = Awaited<
  ReturnType<typeof getHabitLogsForMonth>
>[number]

// ─── Toggle a single log entry ────────────────────────────────────────────────

export async function toggleHabitLog(habitId: string, date: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorised" }

  // Verify the habit belongs to the current user (findFirst allows the
  // non-unique userId filter; findUnique would not type-check on Prisma 7).
  const habit = await db.habit.findFirst({
    where: { id: habitId, userId: session.user.id },
  })
  if (!habit) return { error: "Habit not found" }

  // Parse date as UTC midnight to match @db.Date storage
  const dateObj = new Date(`${date}T00:00:00.000Z`)

  const existing = await db.habitLog.findUnique({
    where: { habitId_date: { habitId, date: dateObj } },
  })

  if (existing) {
    await db.habitLog.delete({ where: { id: existing.id } })
    return { completed: false }
  } else {
    await db.habitLog.create({
      data: { habitId, date: dateObj, completed: true },
    })
    return { completed: true }
  }
}
