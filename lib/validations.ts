import { z } from "zod"

export const habitSchema = z.object({
  name: z
    .string()
    .min(1, "Habit name is required")
    .max(50, "Name must be 50 characters or less"),
  // A single emoji can be several UTF-16 code units (surrogate pairs,
  // variation selectors, ZWJ sequences), so count grapheme clusters instead
  // of `.length` to correctly allow "one emoji" like 🏋️.
  emoji: z
    .string()
    .refine(
      (v) =>
        !v ||
        [...new Intl.Segmenter().segment(v)].length <= 1,
      "One emoji only"
    )
    .optional(),
})

export type HabitFormValues = z.infer<typeof habitSchema>

// ─── To-do ────────────────────────────────────────────────────────────────────

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const
export type Priority = (typeof PRIORITIES)[number]

export const todoSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(120, "Title must be 120 characters or less"),
  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or less")
    .optional(),
  priority: z.enum(PRIORITIES),
})

export type TodoFormValues = z.infer<typeof todoSchema>
