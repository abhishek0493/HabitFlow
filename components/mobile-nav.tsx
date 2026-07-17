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
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Menu,
  BarChart3,
  BookOpen,
  LayoutDashboard,
  ListChecks,
  ListTodo,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/todos", label: "To-do", icon: ListChecks },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/habits", label: "Habits", icon: ListTodo },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const initial = (session?.user?.name ?? session?.user?.email ?? "?")
    .charAt(0)
    .toUpperCase()

  return (
    <div className="flex h-14 flex-shrink-0 items-center justify-between border-b-2 border-border bg-card/95 px-4 md:hidden">
      <div className="flex items-center gap-2.5">
        <span className="masthead-mark h-8 w-8 text-base">hf</span>
        <span className="doodle-label">Habitflow</span>
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <SheetContent side="left" className="flex w-72 flex-col overflow-hidden bg-card p-0">
            <SheetHeader className="px-5 pb-3 pt-5">
              <SheetTitle className="flex items-center gap-2.5 text-base font-semibold">
                <span className="masthead-mark h-8 w-8 text-base">hf</span>
                <span className="doodle-label">Page index</span>
              </SheetTitle>
            </SheetHeader>

            <Separator />

            <nav className="flex-1 space-y-1 px-3 py-4">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href || pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition-all duration-150",
                      isActive
                        ? "border-2 border-foreground/70 bg-sidebar-accent text-foreground shadow-[2px_2px_0_color-mix(in_oklch,var(--foreground)_16%,transparent)]"
                        : "border-2 border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn("h-4 w-4", isActive && "text-brand")}
                    />
                    {label}
                  </Link>
                )
              })}
            </nav>

            <Separator />

            <div className="space-y-3 px-5 py-4">
              {session?.user && (
                <div className="flex items-center gap-3 px-1 py-1">
                  <div className="flex h-9 w-9 shrink-0 -rotate-2 items-center justify-center rounded-md border-2 border-foreground/70 bg-brand text-sm font-bold text-white">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
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
                className="w-full justify-start gap-2 px-3 text-muted-foreground hover:text-foreground"
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
