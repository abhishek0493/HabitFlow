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
    <div className="page-frame animate-fade-in">
      <div className="space-y-8">
        <div className="page-intro">
          <div>
            <p className="doodle-label">03 · See what is taking shape</p>
            <h1 className="page-title">Insights</h1>
          </div>
          <p className="page-deck">
            Patterns become visible when you keep returning. Read the rhythm,
            notice the friction, and adjust with care.
          </p>
        </div>
        <AnalyticsDashboard initialData={data} />
      </div>
    </div>
  )
}
