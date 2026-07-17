"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Menu,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/todos", label: "Tasks" },
  { href: "/journal", label: "Journal" },
  { href: "/analytics", label: "Insights" },
  { href: "/habits", label: "Habits" },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const initial = (session?.user?.name ?? session?.user?.email ?? "?")
    .charAt(0)
    .toUpperCase()

  return (
    <div className="mobile-masthead md:hidden">
      <Link href="/dashboard" className="brand-lockup">
        <span className="masthead-mark">H</span>
        <span className="brand-name">HabitFlow</span>
      </Link>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="masthead-icon-button"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <SheetContent side="left" className="flex w-[88vw] max-w-sm flex-col overflow-hidden p-0">
            <SheetHeader className="border-b border-border px-6 pb-5 pt-7 text-left">
              <SheetTitle className="flex items-center gap-3 text-base font-semibold">
                <span className="masthead-mark">H</span>
                <span>
                  <span className="block font-heading text-2xl font-normal">HabitFlow</span>
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Your daily practice</span>
                </span>
              </SheetTitle>
            </SheetHeader>

            <nav className="flex-1 space-y-0 px-6 py-6" aria-label="Mobile navigation">
              {NAV_LINKS.map(({ href, label }, index) => {
                const isActive =
                  pathname === href || pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center justify-between border-b border-border/70 py-4 text-xl transition-colors",
                      isActive
                        ? "font-heading text-3xl text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{label}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-border px-6 py-5">
              {session?.user && (
                <div className="mb-5 flex items-center gap-3">
                  <div className="session-avatar h-10 w-10">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {session.user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
