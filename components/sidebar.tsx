"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { motion } from "motion/react"
import {
  BarChart3,
  BookOpen,
  CalendarCheck2,
  LayoutDashboard,
  ListChecks,
  ListTodo,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/todos", label: "To-do", icon: ListChecks },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/habits", label: "Habits", icon: ListTodo },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user
  const initial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase()

  return (
    <aside className="hidden h-screen w-68 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      {/* Top — brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
          <CalendarCheck2 className="h-5 w-5" />
        </div>
        <div>
          <span className="block text-lg font-semibold tracking-tight text-foreground">
            Habitflow
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Daily habits
          </span>
        </div>
      </div>

      {/* Middle — nav */}
      <nav className="flex flex-1 flex-col gap-1.5 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 -z-10 rounded-lg bg-sidebar-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-glow"
                  className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-brand"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive && "text-brand"
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom — user + actions */}
      <div className="border-t border-sidebar-border p-3">
        <div className="premium-panel mb-3 flex items-center gap-3 rounded-lg p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name ?? "—"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email ?? ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
