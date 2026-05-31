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
      <AlertCircle className="mb-4 h-10 w-10 text-red-400" />
      <h2 className="mb-1 text-base font-semibold text-gray-900">
        Could not load your habits
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Something went wrong. Your habits are safe — please try refreshing.
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  )
}
