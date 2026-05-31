// Returns number of days in a given month (accounts for leap years)
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

// Converts a Date object to a "YYYY-MM-DD" string using its LOCAL calendar
// components. We deliberately avoid toISOString() here: a local-midnight Date
// (e.g. from getWeekStart) would convert to the previous UTC day in timezones
// ahead of UTC (e.g. IST), shifting the whole week. Local components keep this
// consistent with buildDateString() / getTodayString() and the date strings the
// server stores (it parses "YYYY-MM-DD" as UTC midnight, preserving the calendar day).
export function toDateString(date: Date): string {
  return buildDateString(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

// Builds a "YYYY-MM-DD" string from discrete year/month/day parts
export function buildDateString(
  year: number,
  month: number,
  day: number
): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`
}

// Returns today as a "YYYY-MM-DD" string in local time
export function getTodayString(): string {
  const now = new Date()
  return buildDateString(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

// Full month name, e.g. "June"
export function getMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString("default", {
    month: "long",
  })
}

// Navigates a month forwards or backwards from a given year/month
export function shiftMonth(
  year: number,
  month: number,
  direction: 1 | -1
): { year: number; month: number } {
  const date = new Date(year, month - 1 + direction, 1)
  return { year: date.getFullYear(), month: date.getMonth() + 1 }
}

// Returns the Monday of the week containing the given date
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diff = day === 0 ? -6 : 1 - day // shift to Monday
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Returns an array of 7 Date objects (Mon–Sun) for the week
export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
}

// Abbreviated day name: "Mon", "Tue", etc.
export function getShortDayName(date: Date): string {
  return date.toLocaleString("default", { weekday: "short" })
}

// Returns a new week start shifted forward (+1) or back (-1)
export function shiftWeek(weekStart: Date, direction: 1 | -1): Date {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + direction * 7)
  return d
}

// Formats a week range label, handling cross-month weeks
// Same month:   "Jun 2–8, 2026"
// Cross-month:  "Jun 28 – Jul 4, 2026"
export function formatWeekRange(start: Date, end: Date): string {
  const startMonth = start.toLocaleString("default", { month: "short" })
  const endMonth = end.toLocaleString("default", { month: "short" })
  const year = end.getFullYear()

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}–${end.getDate()}, ${year}`
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${year}`
}
