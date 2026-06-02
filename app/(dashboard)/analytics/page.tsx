import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAnalyticsData } from "@/actions/analytics.actions"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"

export const metadata = { title: "Analytics" }

export default async function AnalyticsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch the last 90 days of tracking logs and journal moods
  const data = await getAnalyticsData(90)

  return (
    <div className="animate-fade-in p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight bg-text-gradient bg-brand-gradient bg-clip-text text-transparent">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Analyze your progress, discover consistency trends, and track milestones.
          </p>
        </div>
        <AnalyticsDashboard initialData={data} />
      </div>
    </div>
  )
}
