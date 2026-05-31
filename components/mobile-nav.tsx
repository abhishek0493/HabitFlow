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

  return (
    // md:hidden ensures this is invisible on desktop
    <div className="flex h-14 flex-shrink-0 items-center justify-between border-b bg-white px-4 md:hidden">
      {/* App name */}
      <div className="flex items-center gap-2">
        <CalendarCheck2 className="h-5 w-5 text-gray-800" />
        <span className="font-semibold text-gray-900">Habitflow</span>
      </div>

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

        <SheetContent side="left" className="flex w-64 flex-col p-0">
          <SheetHeader className="px-5 pb-3 pt-5">
            <SheetTitle className="flex items-center gap-2 text-base font-semibold">
              <CalendarCheck2 className="h-5 w-5" />
              Habitflow
            </SheetTitle>
          </SheetHeader>

          <Separator />

          {/* Nav links */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === href || pathname.startsWith(href)
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <Separator />

          {/* User info + sign out */}
          <div className="space-y-3 px-5 py-4">
            {session?.user && (
              <div className="space-y-0.5">
                <p className="truncate text-sm font-medium text-gray-900">
                  {session.user.name}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {session.user.email}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 px-0 text-gray-600 hover:text-gray-900"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
