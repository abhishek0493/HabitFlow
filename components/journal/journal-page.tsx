"use client"

import { useEffect, useState } from "react"
import { getJournalEntry } from "@/actions/journal.actions"
import { getTodayString } from "@/lib/date-utils"
import { DateNav } from "@/components/journal/date-nav"

type JournalEntry = Awaited<ReturnType<typeof getJournalEntry>>

interface JournalPageProps {
  initialDate: string
  initialEntry: JournalEntry
}

export function JournalPage({ initialDate, initialEntry }: JournalPageProps) {
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [entry, setEntry] = useState(initialEntry)
  const [isLoading, setIsLoading] = useState(false)

  // Keep the URL in sync with the selected date (local-safe "today").
  useEffect(() => {
    if (currentDate === getTodayString()) {
      window.history.replaceState(null, "", "/journal")
    } else {
      window.history.replaceState(null, "", `/journal?date=${currentDate}`)
    }
  }, [currentDate])

  const handleDateChange = async (newDate: string) => {
    setCurrentDate(newDate)
    setIsLoading(true)
    const fetchedEntry = await getJournalEntry(newDate)
    setEntry(fetchedEntry)
    setIsLoading(false)
  }

  return (
    <div className="animate-fade-in mx-auto max-w-2xl px-4 py-8">
      {/* Date navigation */}
      <DateNav currentDate={currentDate} onDateChange={handleDateChange} />

      {/* Main journal card */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Mood section — placeholder for Chunk J4 */}
        <div className="border-b border-border px-6 pb-4 pt-6">
          <p className="text-sm text-muted-foreground/70">
            Mood picker — coming in Chunk J4
          </p>
        </div>

        {/* Editor section — placeholder for Chunk J3 */}
        <div className="min-h-[320px] px-6 py-6">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/70">
              Editor — coming in Chunk J3.
              {entry
                ? ` Entry has ${entry.wordCount} words.`
                : " No entry yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
