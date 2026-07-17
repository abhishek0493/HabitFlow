import { ThemeToggle } from "@/components/theme-toggle"
import { CalendarCheck2, PencilLine, Sparkles } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="ambient-shell auth-shell bg-aurora bg-background">
      <div className="noise-overlay" aria-hidden />
      <aside className="auth-story">
        <div className="auth-story-brand">
          <span className="masthead-mark">hf</span>
          <span className="doodle-label">Habitflow</span>
        </div>
        <div className="auth-story-copy">
          <p className="doodle-label">Daily things, gently held</p>
          <h2>A little notebook for the life you are making.</h2>
          <p>
            Keep the promises that matter, one small checkmark at a time.
          </p>
        </div>
        <div className="auth-story-doodles" aria-hidden>
          <span className="auth-doodle auth-doodle-one"><CalendarCheck2 /></span>
          <span className="auth-doodle auth-doodle-two"><PencilLine /></span>
          <span className="auth-doodle auth-doodle-three"><Sparkles /></span>
        </div>
      </aside>
      <div className="auth-form-stage">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  )
}
