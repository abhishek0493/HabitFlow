import { SessionProvider } from "next-auth/react"
import { auth } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { PageTransition } from "@/components/page-transition"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Seed the client SessionProvider with the server-resolved session so the
  // sidebar / mobile nav show the user immediately after a sign-in/redirect
  // (soft nav otherwise leaves the root provider's session stale until reload).
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <div className="ambient-shell dashboard-shell bg-background">
        <div className="noise-overlay" aria-hidden />
        <header className="dashboard-masthead">
          <div className="flex items-center gap-3">
            <span className="masthead-mark">hf</span>
            <div>
              <p className="doodle-label">Habitflow</p>
              <p className="masthead-note">A small practice, kept close.</p>
            </div>
          </div>
          <p className="hidden text-right text-sm text-muted-foreground lg:block">
            Give ordinary days a little shape.
          </p>
        </header>

        <div className="dashboard-workspace">
          <Sidebar />
          <div className="min-w-0">
            <MobileNav />
            <main className="workspace-main">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </div>
      </div>
    </SessionProvider>
  )
}
