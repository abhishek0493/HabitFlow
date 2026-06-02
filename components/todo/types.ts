import type { Priority } from "@/lib/validations"

// Client-side shape of a task (Date already serialised to "YYYY-MM-DD").
// Mirrors the DTO returned by the todo server actions.
export interface Todo {
  id: string
  date: string
  title: string
  notes: string | null
  priority: Priority
  completed: boolean
  order: number
}
