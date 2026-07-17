import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="ambient-shell auth-shell">
      <aside className="auth-story">
        <div className="auth-story-brand">
          <span className="masthead-mark">H</span>
          <span className="brand-name text-[color:inherit]">HabitFlow</span>
        </div>
        <div className="auth-story-copy">
          <p className="doodle-label">A quieter way forward</p>
          <h2>Make space for the life you want to <em>repeat.</em></h2>
          <p>
            A thoughtful home for daily rituals, clear intentions, and the small
            patterns that become a life.
          </p>
        </div>
        <div className="auth-story-progress" aria-hidden>
          <div className="auth-progress-ring">
            <span>68</span>
            <small>%</small>
          </div>
          <div>
            <p className="auth-progress-title">A gentle rhythm</p>
            <p className="auth-progress-note">No rush. No performance.</p>
          </div>
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
