import { Skeleton } from "@/components/ui/skeleton"

export default function TodosLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Date nav skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-9 w-56 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="ml-auto h-9 w-16 rounded-full" />
      </div>

      {/* Progress skeleton */}
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Add form skeleton */}
      <Skeleton className="mt-4 h-14 w-full rounded-2xl" />

      {/* List skeleton */}
      <div className="mt-4 space-y-px overflow-hidden rounded-2xl border border-border bg-card">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="ml-auto h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
