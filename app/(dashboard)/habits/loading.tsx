import { Skeleton } from "@/components/ui/skeleton"

export default function HabitsLoading() {
  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>

      {/* Habit list */}
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-4 flex-shrink-0 rounded-full" />
            <Skeleton className="h-4 w-44 rounded" />
            <div className="ml-auto flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
