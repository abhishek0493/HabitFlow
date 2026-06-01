import { GridSkeleton } from "@/components/habit-grid/grid-skeleton"

export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <GridSkeleton />
      </div>
    </div>
  )
}
