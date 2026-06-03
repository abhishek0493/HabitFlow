import { cookies } from "next/headers"
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

// Cookies the grid writes on every view/date change so that returning to a bare
// `/dashboard` link (e.g. from the sidebar) restores the last-used view instead
// of snapping back to the month default.
const DASH_VIEW_COOKIE = "hf_dash_view"
const DASH_DATE_COOKIE = "hf_dash_date"

export default async function DashboardPage({
  searchParams,
}: {
  // Next 16: searchParams is a Promise and must be awaited.
  searchParams: Promise<{ view?: string; date?: string }>
}) {
  const { view: viewParam, date: dateParam } = await searchParams

  // Explicit URL params win (bookmarks / reloads); otherwise fall back to the
  // persisted cookie so navigation round-trips keep the user's chosen view.
  const cookieStore = await cookies()
  const view: "month" | "week" =
    (viewParam ?? cookieStore.get(DASH_VIEW_COOKIE)?.value) === "week"
      ? "week"
      : "month"
  const date = dateParam ?? cookieStore.get(DASH_DATE_COOKIE)?.value

  const today = new Date()

  let startDate: string
  let endDate: string

  if (view === "week") {
    // Parse the week start from the URL/cookie, or default to the current week
    const parsedWeekStart =
      date && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? new Date(`${date}T00:00:00.000Z`)
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
    <div className="animate-fade-in p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Daily flow
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          A simple grid for your daily habits. Tap to mark each one done.
        </p>
      </div>
      <div className="premium-panel overflow-hidden rounded-xl">
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
