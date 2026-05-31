import { SessionProvider } from "next-auth/react"
import { auth } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Seed the client SessionProvider with the server-resolved session so the
  // sidebar shows the user immediately after a sign-in/redirect (soft nav
  // otherwise leaves the root provider's session stale until a full reload).
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SessionProvider>
  )
}
