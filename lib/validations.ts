import { z } from "zod"

export const habitSchema = z.object({
  name: z
    .string()
    .min(1, "Habit name is required")
    .max(50, "Name must be 50 characters or less"),
  color: z.string().min(1, "Please select a colour"),
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
