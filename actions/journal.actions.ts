"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

// ─── Fetch a single entry by date ─────────────────────────────────────────────

export async function getJournalEntry(date: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  const entry = await db.journalEntry.findUnique({
    where: {
      userId_date: {
        userId: session.user.id,
        date: new Date(`${date}T00:00:00.000Z`),
      },
    },
  })

  return entry
    ? {
        ...entry,
        date: entry.date.toISOString().split("T")[0],
      }
    : null
}

// ─── Create or update an entry ────────────────────────────────────────────────

export async function upsertJournalEntry(data: {
  date: string
  content: string
  mood?: number | null
  wordCount?: number
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorised" }

  const dateObj = new Date(`${data.date}T00:00:00.000Z`)

  await db.journalEntry.upsert({
    where: {
      userId_date: {
        userId: session.user.id,
        date: dateObj,
      },
    },
    update: {
      content: data.content,
      mood: data.mood ?? null,
      wordCount: data.wordCount ?? 0,
    },
    create: {
      userId: session.user.id,
      date: dateObj,
      content: data.content,
      mood: data.mood ?? null,
      wordCount: data.wordCount ?? 0,
    },
  })

  revalidatePath("/journal")
  return { success: true }
}

// ─── Get all dates with entries for a given month ─────────────────────────────
// Used by the entry calendar to show dots on days with content

export async function getJournalDatesForMonth(year: number, month: number) {
  const session = await auth()
  if (!session?.user?.id) return []

  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 0))

  const entries = await db.journalEntry.findMany({
    where: {
      userId: session.user.id,
      date: { gte: start, lte: end },
    },
    select: { date: true, mood: true },
  })

  return entries.map((e) => ({
    date: e.date.toISOString().split("T")[0],
    mood: e.mood,
  }))
}

// ─── Get recent entries for the history list ──────────────────────────────────

export async function getRecentJournalEntries(limit = 30) {
  const session = await auth()
  if (!session?.user?.id) return []

  const entries = await db.journalEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: limit,
    select: {
      date: true,
      mood: true,
      wordCount: true,
      content: true,
    },
  })

  return entries.map((e) => ({
    ...e,
    date: e.date.toISOString().split("T")[0],
    // Return a plain-text preview (strip HTML tags)
    preview: e.content.replace(/<[^>]*>/g, "").slice(0, 120),
  }))
}
