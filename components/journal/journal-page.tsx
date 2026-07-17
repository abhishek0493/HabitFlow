"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import {
  getJournalEntry,
  getJournalDatesForMonth,
  upsertJournalEntry,
} from "@/actions/journal.actions"
import { getTodayString } from "@/lib/date-utils"
import { DateNav } from "@/components/journal/date-nav"
import { MoodPicker, MOODS } from "@/components/journal/mood-picker"
import { EntryCalendar } from "@/components/journal/entry-calendar"

// Tiptap must run client-side only.
const JournalEditor = dynamic(
  () => import("./journal-editor").then((m) => m.JournalEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[320px] animate-pulse space-y-3 px-6 py-6">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>
    ),
  }
)

type JournalEntry = Awaited<ReturnType<typeof getJournalEntry>>

interface JournalPageProps {
  initialDate: string
  initialEntry: JournalEntry
}

export function JournalPage({ initialDate, initialEntry }: JournalPageProps) {
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [entry, setEntry] = useState(initialEntry)
  const [selectedMood, setSelectedMood] = useState<number | null>(
    initialEntry?.mood ?? null
  )
  const [isLoading, setIsLoading] = useState(false)

  // Live content/word-count from the editor, so a mood-save persists the
  // current text instead of a stale snapshot.
  const latestContentRef = useRef(initialEntry?.content ?? "")
  const latestWordCountRef = useRef(initialEntry?.wordCount ?? 0)

  const isToday = currentDate === getTodayString()

  // Keep the URL in sync with the selected date (local-safe "today").
  useEffect(() => {
    if (currentDate === getTodayString()) {
      window.history.replaceState(null, "", "/journal")
    } else {
      window.history.replaceState(null, "", `/journal?date=${currentDate}`)
    }
  }, [currentDate])

  const handleDateChange = async (newDate: string) => {
    if (newDate === currentDate) return
    setIsLoading(true)
    const fetchedEntry = await getJournalEntry(newDate)
    setEntry(fetchedEntry)
    setSelectedMood(fetchedEntry?.mood ?? null)
    latestContentRef.current = fetchedEntry?.content ?? ""
    latestWordCountRef.current = fetchedEntry?.wordCount ?? 0
    // Update the date LAST so the keyed editor remounts with the fresh entry.
    setCurrentDate(newDate)
    setIsLoading(false)
  }

  // Selecting a mood saves immediately, alongside the latest editor content.
  const handleMoodSelect = async (mood: number | null) => {
    setSelectedMood(mood)
    await upsertJournalEntry({
      date: currentDate,
      content: latestContentRef.current,
      mood,
      wordCount: latestWordCountRef.current,
    })
  }

  return (
    <div className="page-frame mx-auto max-w-6xl animate-fade-in p-3 sm:p-5 lg:p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="doodle-label">Notes in the margin</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-gradient sm:text-4xl">
            Journal
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          Leave a few honest lines for the version of you that comes next.
        </p>
      </div>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <DateNav currentDate={currentDate} onDateChange={handleDateChange} />
          <div
            className="premium-panel mt-6 overflow-hidden rounded-lg transition-opacity duration-300"
            style={{ opacity: isLoading ? 0.5 : 1 }}
          >
            <div
              className="border-b border-border transition-colors duration-700"
              style={{
                backgroundColor: selectedMood
                  ? `${MOODS[selectedMood - 1].color}0d`
                  : "transparent",
              }}
            >
              <MoodPicker selectedMood={selectedMood} onSelect={handleMoodSelect} />
            </div>

            {!entry && !isLoading && (
              <div className="px-6 pb-0 pt-5 text-center">
                <p className="text-sm italic text-muted-foreground/70">
                  {isToday
                    ? "A fresh page. Start whenever you're ready."
                    : "Nothing was written on this day."}
                </p>
              </div>
            )}

            <JournalEditor
              key={currentDate}
              date={currentDate}
              initialContent={entry?.content ?? ""}
              initialMood={selectedMood}
              onChange={(content, words) => {
                latestContentRef.current = content
                latestWordCountRef.current = words
              }}
            />
          </div>
        </div>
        <aside className="xl:pt-1">
          <EntryCalendar
            currentDate={currentDate}
            onDateSelect={handleDateChange}
            fetchDatesForMonth={getJournalDatesForMonth}
          />
        </aside>
      </div>
    </div>
  )
}
