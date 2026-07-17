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
    <div className="page-frame animate-fade-in p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="doodle-label">
              Tiny patterns
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-gradient sm:text-4xl">
              Analytics
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            See the small patterns that show up when you keep coming back.
          </p>
        </div>
        <AnalyticsDashboard initialData={data} />
      </div>
    </div>
  )
}
