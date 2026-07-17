import { GridSkeleton } from "@/components/habit-grid/grid-skeleton"

export default function DashboardLoading() {
  return (
    <div className="page-frame">
      <div className="mb-10 grid gap-6 border-b border-foreground pb-10 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-5">
          <div className="h-3 w-36 animate-pulse rounded-full bg-muted" />
          <div className="h-32 max-w-3xl animate-pulse rounded-[2rem] bg-muted" />
        </div>
        <div className="mx-auto aspect-square w-48 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="premium-panel overflow-hidden rounded-[1.75rem]">
        <GridSkeleton />
      </div>
    </div>
  )
}
