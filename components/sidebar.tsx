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
  ListTodo,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
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
    <aside className="glass hidden h-screen w-68 flex-col border-r border-sidebar-border/80 bg-sidebar/75 shadow-2xl shadow-black/5 md:flex">
      {/* Top — brand */}
      <div className="relative flex items-center gap-3 px-5 py-5">
        <div className="absolute left-5 top-5 h-9 w-9 animate-glow-pulse rounded-xl bg-brand-gradient opacity-50 blur-lg" />
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-lg shadow-brand/30 ring-1 ring-white/25">
          <CalendarCheck2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="block text-lg font-bold tracking-tight text-brand-gradient">
            Habitflow
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
            Daily engine
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
                "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5",
                isActive
                  ? "text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/45 hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 -z-10 rounded-xl bg-sidebar-accent shadow-inner"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-glow"
                  className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-brand-gradient shadow-[0_0_18px_var(--brand)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                  isActive && "text-brand"
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom — user + actions */}
      <div className="border-t border-sidebar-border/80 p-3">
        <div className="premium-panel mb-3 flex items-center gap-3 rounded-xl p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white shadow-md shadow-brand/25 ring-1 ring-white/25">
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
            className="flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-foreground"
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
