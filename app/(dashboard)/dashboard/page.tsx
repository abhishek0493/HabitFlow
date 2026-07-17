import { cookies } from "next/headers"
import type { CSSProperties } from "react"
import { getHabits } from "@/actions/habit.actions"
import { getHabitLogs } from "@/actions/log.actions"
import { HabitGrid } from "@/components/habit-grid/habit-grid"
import {
  getDaysInMonth,
  buildDateString,
  getWeekStart,
  getTodayString,
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

  const todayString = getTodayString()
  const [habits, logs, todayLogs] = await Promise.all([
    getHabits(),
    getHabitLogs(startDate, endDate),
    getHabitLogs(todayString, todayString),
  ])

  const completedToday = new Set(
    todayLogs.filter((log) => log.completed).map((log) => log.habitId)
  ).size
  const todayProgress =
    habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0
  const dateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(today)

  return (
    <div className="page-frame animate-fade-in">
      <section className="hero-gallery" aria-labelledby="dashboard-heading">
        <div className="hero-copy">
          <div>
            <p className="doodle-label">{dateLabel}</p>
            <h1 id="dashboard-heading" className="hero-title mt-5">
              Make space for the life you want to <em>repeat.</em>
            </h1>
          </div>
          <p className="hero-subcopy">
            A gentle rhythm is taking shape. Keep today spacious enough to
            notice it.
          </p>
        </div>
        <aside className="hero-progress" aria-label={`${todayProgress}% of today's habits complete`}>
          <div
            className="progress-sculpture"
            style={{ "--progress": todayProgress } as CSSProperties}
          >
            <strong>{todayProgress}%</strong>
          </div>
          <div className="progress-caption">
            <strong>
              {completedToday} of {habits.length} rituals
            </strong>
            <span>{habits.length - completedToday > 0 ? `${habits.length - completedToday} gentle moments remain` : "Today is complete"}</span>
          </div>
        </aside>
      </section>

      <section aria-labelledby="rhythm-heading">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="doodle-label">Your practice</p>
            <h2 id="rhythm-heading" className="mt-2 text-4xl sm:text-5xl">
              Daily rhythm
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Move between a focused week and the wider month. Every mark is a
            quiet vote for what matters.
          </p>
        </div>
        <div className="premium-panel scanline overflow-hidden rounded-[1.75rem]">
          <HabitGrid
            initialHabits={habits}
            initialLogs={logs}
            initialView={view}
            initialStartDate={startDate}
            initialEndDate={endDate}
          />
        </div>
      </section>
    </div>
  )
}
