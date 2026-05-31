import { Skeleton } from "@/components/ui/skeleton"

export default function HabitsLoading() {
  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-7 w-20 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Habit list */}
      <div className="divide-y rounded-lg border bg-white shadow-sm">
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
