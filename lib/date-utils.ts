// Returns number of days in a given month (accounts for leap years)
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

// Converts a Date object to a "YYYY-MM-DD" string using UTC to stay
// consistent with how PostgreSQL's @db.Date stores values
export function toDateString(date: Date): string {
  return date.toISOString().split("T")[0]
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
