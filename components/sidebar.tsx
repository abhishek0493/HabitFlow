"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { motion } from "motion/react"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/todos", label: "Tasks" },
  { href: "/journal", label: "Journal" },
  { href: "/analytics", label: "Insights" },
  { href: "/habits", label: "Habits" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user
  const initial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase()

  return (
    <div className="desktop-navigation hidden md:flex">
      <nav className="editorial-nav" aria-label="Primary navigation">
        {navItems.map(({ href, label }, index) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "editorial-nav-link",
                isActive
                  ? "is-active"
                  : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="top-nav-active"
                  className="nav-active-line"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
              )}
              <span className="nav-index" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="desktop-session">
        <div className="session-copy">
          <div className="session-avatar">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{user?.name ?? "Your space"}</p>
            <p className="truncate text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Personal
            </p>
          </div>
        </div>
        <ThemeToggle />
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="masthead-icon-button"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
