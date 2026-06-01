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
  CalendarCheck2,
  LayoutDashboard,
  ListTodo,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
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
    // md:hidden ensures this is invisible on desktop
    <div className="glass flex h-14 flex-shrink-0 items-center justify-between border-b border-border px-4 md:hidden">
      {/* App name */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-md shadow-brand/25">
          <CalendarCheck2 className="h-[18px] w-[18px] text-white" />
        </div>
        <span className="font-semibold tracking-tight">Habitflow</span>
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        {/* Hamburger → Sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <SheetContent side="left" className="flex w-72 flex-col p-0">
            <SheetHeader className="px-5 pb-3 pt-5">
              <SheetTitle className="flex items-center gap-2.5 text-base font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-md shadow-brand/25">
                  <CalendarCheck2 className="h-[18px] w-[18px] text-white" />
                </div>
                Habitflow
              </SheetTitle>
            </SheetHeader>

            <Separator />

            {/* Nav links */}
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
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
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

            {/* User info + sign out */}
            <div className="space-y-3 px-5 py-4">
              {session?.user && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
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
