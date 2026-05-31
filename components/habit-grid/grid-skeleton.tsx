import { Skeleton } from "@/components/ui/skeleton"

export function GridSkeleton() {
  const ROWS = 5
  const COLS = 15 // roughly half a month — enough to show structure

  return (
    <div>
      {/* Header row skeleton */}
      <div className="flex items-center gap-3 border-b p-4">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-5 w-36 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
      </div>

      {/* Grid body skeleton */}
      <div className="overflow-hidden p-4">
        {/* Date header row */}
        <div className="mb-1 ml-40 flex gap-1">
          {Array.from({ length: COLS }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 flex-shrink-0 rounded-sm" />
          ))}
        </div>

        {/* Habit rows */}
        <div className="space-y-1">
          {Array.from({ length: ROWS }).map((_, i) => (
            <div key={i} className="flex items-center gap-1">
              <Skeleton className="h-8 w-36 flex-shrink-0 rounded-md" />
              {Array.from({ length: COLS }).map((_, j) => (
                <Skeleton key={j} className="h-8 w-8 flex-shrink-0 rounded-sm" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
