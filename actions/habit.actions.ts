"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getHabits() {
  const session = await auth()
  if (!session?.user?.id) return []

  return db.habit.findMany({
    where: { userId: session.user.id, isActive: true },
    orderBy: { order: "asc" },
  })
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createHabit(data: {
  name: string
  emoji?: string
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorised" }

  const existingCount = await db.habit.count({
    where: { userId: session.user.id, isActive: true },
  })

  await db.habit.create({
    data: {
      userId: session.user.id,
      name: data.name.trim(),
      emoji: data.emoji?.trim() || null,
      order: existingCount, // append to end of list
    },
  })

  revalidatePath("/habits")
  revalidatePath("/dashboard")
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateHabit(
  id: string,
  data: { name: string; emoji?: string }
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorised" }

  // Verify ownership before updating
  const habit = await db.habit.findUnique({ where: { id } })
  if (!habit || habit.userId !== session.user.id) {
    return { error: "Habit not found" }
  }

  await db.habit.update({
    where: { id },
    data: {
      name: data.name.trim(),
      emoji: data.emoji?.trim() || null,
    },
  })

  revalidatePath("/habits")
  revalidatePath("/dashboard")
}

// ─── Delete (soft) ────────────────────────────────────────────────────────────

export async function deleteHabit(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorised" }

  const habit = await db.habit.findUnique({ where: { id } })
  if (!habit || habit.userId !== session.user.id) {
    return { error: "Habit not found" }
  }

  await db.habit.update({
    where: { id },
    data: { isActive: false },
  })

  revalidatePath("/habits")
  revalidatePath("/dashboard")
}

// ─── Reorder ──────────────────────────────────────────────────────────────────

export async function reorderHabits(orderedIds: string[]) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorised" }

  const userId = session.user.id

  // Only reorder habits that actually belong to this user (ownership guard).
  const owned = await db.habit.findMany({
    where: { id: { in: orderedIds }, userId },
    select: { id: true },
  })
  const ownedIds = new Set(owned.map((h) => h.id))
  const safeIds = orderedIds.filter((id) => ownedIds.has(id))

  // Update each habit's order field in a single transaction.
  await db.$transaction(
    safeIds.map((id, index) =>
      db.habit.update({
        where: { id },
        data: { order: index },
      })
    )
  )

  revalidatePath("/habits")
  revalidatePath("/dashboard")
}
