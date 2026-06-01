import { getJournalEntry } from "@/actions/journal.actions"

export const metadata = { title: "Journal" }

export default async function JournalPage({
  searchParams,
}: {
  // Next 16: searchParams is a Promise and must be awaited.
  searchParams: Promise<{ date?: string }>
}) {
  const { date: dateParam } = await searchParams
  const today = new Date().toISOString().split("T")[0]
  const date = dateParam ?? today
  const entry = await getJournalEntry(date)

  return (
    <div className="p-6">
      <p className="text-sm text-muted-foreground">
        Journal for {date} — UI coming in Chunk J2.
        {entry ? " Entry exists." : " No entry yet."}
      </p>
    </div>
  )
}
