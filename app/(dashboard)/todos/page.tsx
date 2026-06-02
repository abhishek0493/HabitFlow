import { getTodos } from "@/actions/todo.actions"
import { TodoPage } from "@/components/todo/todo-page"
import { getTodayString } from "@/lib/date-utils"

export const metadata = { title: "To-do" }

export default async function TodosPageRoute({
  searchParams,
}: {
  // Next 16: searchParams is a Promise and must be awaited.
  searchParams: Promise<{ date?: string }>
}) {
  const { date: dateParam } = await searchParams

  // Validate the date param; fall back to today. Future dates are allowed
  // (tasks can be planned ahead), so we only guard the format.
  const date =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? dateParam
      : getTodayString()

  const todos = await getTodos(date)

  return <TodoPage initialDate={date} initialTodos={todos} />
}
