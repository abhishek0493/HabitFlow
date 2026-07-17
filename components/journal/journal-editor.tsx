"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extension-placeholder"
import { CharacterCount } from "@tiptap/extension-character-count"
import { Loader2, Check } from "lucide-react"
import { upsertJournalEntry } from "@/actions/journal.actions"

type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error"

interface JournalEditorProps {
  date: string
  initialContent: string
  initialMood: number | null
  // Reports live content + word count up to the parent so an immediate
  // mood-save uses the current text (not a stale snapshot).
  onChange?: (content: string, wordCount: number) => void
}

export function JournalEditor({
  date,
  initialContent,
  initialMood,
  onChange,
}: JournalEditorProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [wordCount, setWordCount] = useState(0)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestMoodRef = useRef(initialMood)

  // Keep moodRef in sync so a scheduled save uses the current mood.
  useEffect(() => {
    latestMoodRef.current = initialMood
  }, [initialMood])

  const scheduleAutoSave = useCallback(
    (content: string, wc: number) => {
      setSaveStatus("pending")
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

      saveTimerRef.current = setTimeout(async () => {
        setSaveStatus("saving")
        try {
          const result = await upsertJournalEntry({
            date,
            content,
            mood: latestMoodRef.current,
            wordCount: wc,
          })
          if (result?.error) {
            setSaveStatus("error")
            return
          }
          setSaveStatus("saved")
          setTimeout(() => setSaveStatus("idle"), 2500)
        } catch {
          setSaveStatus("error")
        }
      }, 1500)
    },
    [date]
  )

  const editor = useEditor({
    immediatelyRender: false, // Tiptap v3 + Next: render client-side only
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Placeholder.configure({
        placeholder: "What's on your mind today...",
      }),
      CharacterCount,
    ],
    content: initialContent || "",
    editorProps: {
      attributes: {
        class: [
          "focus:outline-none",
          "min-h-[320px]",
          "text-foreground",
          "leading-relaxed",
          "[&_h1]:font-heading [&_h1]:text-4xl [&_h1]:font-normal [&_h1]:mb-4 [&_h1]:mt-5",
          "[&_h2]:font-heading [&_h2]:text-3xl [&_h2]:font-normal [&_h2]:mb-3 [&_h2]:mt-4",
          "[&_p]:mb-3",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3",
          "[&_strong]:font-semibold",
          "[&_em]:italic",
        ].join(" "),
      },
    },
    onCreate: ({ editor }) => {
      const words = editor.storage.characterCount.words()
      setWordCount(words)
      onChange?.(editor.getHTML(), words)
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const words = editor.storage.characterCount.words()
      setWordCount(words)
      scheduleAutoSave(html, words)
      onChange?.(html, words)
    },
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  return (
    <div className="px-6 py-6">
      <EditorContent
        editor={editor}
        className="bg-transparent px-1 font-heading text-lg transition-all duration-300"
        style={{ fontSize: "16px", lineHeight: "1.8" }}
      />

      <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
        {/* Word count */}
        <span className="text-xs text-muted-foreground">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>

        {/* Save status */}
        <span className="text-xs">
          {saveStatus === "pending" && (
            <span className="text-muted-foreground">Unsaved changes</span>
          )}
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-emerald-500">
              <Check className="h-3 w-3" /> Saved
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-destructive">
              Save failed — check your connection
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
