import { GridSkeleton } from "@/components/habit-grid/grid-skeleton"

export default function DashboardLoading() {
  return (
    <div className="p-6">
      <div className="rounded-lg border bg-white shadow-sm">
        <GridSkeleton />
      </div>
    </div>
  )
}
