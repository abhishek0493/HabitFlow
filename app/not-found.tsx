import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarCheck2 } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <CalendarCheck2 className="mb-6 h-12 w-12 text-gray-300" />
      <h1 className="mb-2 text-3xl font-semibold text-gray-900">404</h1>
      <p className="mb-8 text-gray-500">
        This page doesn&apos;t exist or has been moved.
      </p>
      {/* base-nova Button is Base UI — use `render`, not `asChild` */}
      <Button render={<Link href="/dashboard">Go to dashboard</Link>} />
    </div>
  )
}
