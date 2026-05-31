import { getHabits } from "@/actions/habit.actions"
import { getHabitLogsForMonth } from "@/actions/log.actions"
import { HabitGrid } from "@/components/habit-grid/habit-grid"

export default async function DashboardPage() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1

  // Fetch both in parallel
  const [habits, logs] = await Promise.all([
    getHabits(),
    getHabitLogsForMonth(year, month),
  ])

  return (
    <div className="p-6">
      <div className="rounded-lg border bg-white shadow-sm">
        <HabitGrid
          initialHabits={habits}
          initialLogs={logs}
          initialYear={year}
          initialMonth={month}
        />
      </div>
    </div>
  )
}
