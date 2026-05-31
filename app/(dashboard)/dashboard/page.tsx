import { getHabits } from "@/actions/habit.actions"
import { getHabitLogs } from "@/actions/log.actions"
import { HabitGrid } from "@/components/habit-grid/habit-grid"
import {
  getDaysInMonth,
  buildDateString,
  getWeekStart,
  toDateString,
} from "@/lib/date-utils"

export const metadata = { title: "Dashboard" }

export default async function DashboardPage({
  searchParams,
}: {
  // Next 16: searchParams is a Promise and must be awaited.
  searchParams: Promise<{ view?: string; date?: string }>
}) {
  const { view: viewParam, date: dateParam } = await searchParams
  const today = new Date()
  const view = viewParam === "week" ? "week" : "month"

  let startDate: string
  let endDate: string

  if (view === "week") {
    // Parse the week start from the URL, or default to the current week
    const parsedWeekStart =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? new Date(`${dateParam}T00:00:00.000Z`)
        : getWeekStart(today)

    const weekEnd = new Date(parsedWeekStart)
    weekEnd.setDate(parsedWeekStart.getDate() + 6)

    startDate = toDateString(parsedWeekStart)
    endDate = toDateString(weekEnd)
  } else {
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    startDate = buildDateString(year, month, 1)
    endDate = buildDateString(year, month, getDaysInMonth(year, month))
  }

  const [habits, logs] = await Promise.all([
    getHabits(),
    getHabitLogs(startDate, endDate),
  ])

  return (
    <div className="p-6">
      <div className="rounded-lg border bg-white shadow-sm">
        <HabitGrid
          initialHabits={habits}
          initialLogs={logs}
          initialView={view}
          initialStartDate={startDate}
          initialEndDate={endDate}
        />
      </div>
    </div>
  )
}
