import { SessionProvider } from "next-auth/react"
import { auth } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"

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
      <div className="flex h-screen bg-background">
        {/* Desktop sidebar (hidden on mobile via class inside Sidebar) */}
        <Sidebar />

        {/* Right side: MobileNav stacks on top, then the page */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <MobileNav />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SessionProvider>
  )
}
