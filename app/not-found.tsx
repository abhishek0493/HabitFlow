import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarCheck2 } from "lucide-react"

export default function NotFound() {
  return (
    <div className="bg-aurora flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient shadow-lg shadow-brand/30">
        <CalendarCheck2 className="h-8 w-8 text-white" />
      </div>
      <h1 className="mb-2 text-5xl font-bold tracking-tight text-foreground">
        404
      </h1>
      <p className="mb-8 text-muted-foreground">
        This page doesn&apos;t exist or has been moved.
      </p>
      {/* base-nova Button is Base UI — use `render`, not `asChild` */}
      <Button
        size="lg"
        className="bg-brand-gradient text-white shadow-md shadow-brand/25 transition-all hover:shadow-lg hover:shadow-brand/40 hover:brightness-105"
        render={<Link href="/dashboard">Go to dashboard</Link>}
      />
    </div>
  )
}
