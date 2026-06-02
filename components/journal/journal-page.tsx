"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { getJournalEntry, upsertJournalEntry } from "@/actions/journal.actions"
import { getTodayString } from "@/lib/date-utils"
import { DateNav } from "@/components/journal/date-nav"
import { MoodPicker, MOODS } from "@/components/journal/mood-picker"

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
    setSelectedMood(fetchedEntry?.mood ?? null)
    latestContentRef.current = fetchedEntry?.content ?? ""
    latestWordCountRef.current = fetchedEntry?.wordCount ?? 0
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
    <div className="animate-fade-in mx-auto max-w-2xl px-4 py-8">
      {/* Date navigation */}
      <DateNav currentDate={currentDate} onDateChange={handleDateChange} />

      {/* Main journal card */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Mood section — softly tinted by the selected mood */}
        <div
          className="border-b border-border transition-colors duration-700"
          style={{
            backgroundColor: selectedMood
              ? `${MOODS[selectedMood - 1].color}0d` // ~5% opacity
              : "transparent",
          }}
        >
          <MoodPicker selectedMood={selectedMood} onSelect={handleMoodSelect} />
        </div>

        {/* Editor section */}
        {isLoading ? (
          <div className="min-h-[320px] animate-pulse space-y-3 px-6 py-6">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
