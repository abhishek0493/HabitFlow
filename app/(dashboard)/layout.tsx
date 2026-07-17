import { SessionProvider } from "next-auth/react"
import Link from "next/link"
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
      <div className="ambient-shell dashboard-shell">
        <div className="quiet-grid" aria-hidden />
        <header className="dashboard-masthead">
          <div className="masthead-inner">
            <Link href="/dashboard" className="brand-lockup" aria-label="HabitFlow dashboard">
              <span className="masthead-mark">H</span>
              <div>
                <p className="brand-name">HabitFlow</p>
                <p className="masthead-note">Daily practice</p>
              </div>
            </Link>
            <Sidebar />
          </div>
        </header>

        <MobileNav />

        <main className="workspace-main">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </SessionProvider>
  )
}
