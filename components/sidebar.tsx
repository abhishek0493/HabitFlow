"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { motion } from "motion/react"
import {
  BarChart3,
  BookOpen,
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
    <aside className="sidebar-index hidden md:flex">
      <div className="px-4 pb-4 pt-5">
        <p className="doodle-label">Page index</p>
        <p className="mt-2 font-heading text-2xl font-bold leading-none text-foreground">
          Pick a page.
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 pb-4">
        {navItems.map(({ href, label, icon: Icon }, index) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-md px-3 py-2.5 text-sm font-bold transition-all duration-200 hover:-translate-x-px hover:-translate-y-px",
                isActive
                  ? "border-2 border-foreground/70 bg-sidebar-accent text-foreground shadow-[2px_2px_0_color-mix(in_oklch,var(--foreground)_16%,transparent)]"
                  : "border-2 border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-y-2 left-1 w-1 rounded-full bg-brand"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="w-4 text-[10px] font-extrabold text-muted-foreground/60">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Icon
                className={cn(
                  "h-4 w-4 transition-transform duration-150 group-hover:scale-110 group-hover:rotate-6",
                  isActive && "text-brand"
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t-2 border-sidebar-border p-3">
        <div className="mb-3 flex items-center gap-3 px-2 py-1">
          <div className="flex h-9 w-9 shrink-0 -rotate-2 items-center justify-center rounded-md border-2 border-foreground/70 bg-brand text-sm font-bold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{user?.name ?? "—"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email ?? ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex flex-1 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-bold text-muted-foreground transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:bg-secondary hover:text-foreground"
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
