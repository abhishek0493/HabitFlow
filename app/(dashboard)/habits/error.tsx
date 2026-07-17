"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function HabitsError({
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
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h2 className="mb-2 text-4xl text-foreground">
        Could not load your habits
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Something went wrong. Your habits are safe — please try refreshing.
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  )
}
