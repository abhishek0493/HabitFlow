import { Skeleton } from "@/components/ui/skeleton"

export default function JournalLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Date nav skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-9 w-56 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="ml-auto h-9 w-16 rounded-full" />
      </div>

      {/* Card skeleton */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Mood section skeleton */}
        <div className="border-b border-border px-6 pb-4 pt-6">
          <Skeleton className="mb-4 h-4 w-40" />
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="h-14 w-14 rounded-full" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        </div>

        {/* Editor skeleton */}
        <div className="space-y-3 px-6 py-6">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}
