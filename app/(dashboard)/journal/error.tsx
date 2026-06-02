"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export default function JournalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="mb-1 text-base font-semibold text-foreground">
        Couldn&apos;t load your journal
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Your entries are safe. This is usually temporary.
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  )
}
