import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="ambient-shell flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
      <div className="quiet-grid" aria-hidden />
      <div className="mb-8 flex items-center gap-3">
        <span className="masthead-mark">H</span>
        <span className="brand-name">HabitFlow</span>
      </div>
      <p className="doodle-label mb-4">Beyond the page</p>
      <h1 className="mb-4 text-[clamp(7rem,22vw,16rem)] leading-[0.72] tracking-[-0.08em] text-foreground">
        404
      </h1>
      <p className="mb-9 max-w-md font-heading text-2xl leading-snug text-muted-foreground">
        This page has slipped out of the rhythm. Your practice is still right
        where you left it.
      </p>
      {/* base-nova Button is Base UI — use `render`, not `asChild` */}
      <Button
        size="lg"
        className="bg-brand-gradient text-brand-foreground"
        render={<Link href="/dashboard">Go to dashboard</Link>}
      />
    </div>
  )
}
