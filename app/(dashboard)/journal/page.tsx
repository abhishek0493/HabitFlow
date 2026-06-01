import { getJournalEntry } from "@/actions/journal.actions"
import { JournalPage } from "@/components/journal/journal-page"

export const metadata = { title: "Journal" }

export default async function JournalPageRoute({
  searchParams,
}: {
  // Next 16: searchParams is a Promise and must be awaited.
  searchParams: Promise<{ date?: string }>
}) {
  const { date: dateParam } = await searchParams
  const today = new Date().toISOString().split("T")[0]
  const date = dateParam ?? today

  // Prevent future dates
  const safeDate = date > today ? today : date

  const entry = await getJournalEntry(safeDate)

  return <JournalPage initialDate={safeDate} initialEntry={entry} />
}
