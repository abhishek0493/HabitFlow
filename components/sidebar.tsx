"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  CalendarCheck2,
  LayoutDashboard,
  ListTodo,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/habits", label: "Habits", icon: ListTodo },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user

  return (
    <aside className="hidden h-screen w-60 flex-col border-r border-gray-200 bg-gray-50 md:flex">
      {/* Top — brand */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
        <CalendarCheck2 className="h-5 w-5 text-gray-900" />
        <span className="text-lg font-semibold text-gray-900">Habitflow</span>
      </div>

      {/* Middle — nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom — user + sign out */}
      <div className="border-t border-gray-200 p-3">
        <div className="px-2 pb-2">
          <p className="truncate text-sm font-medium text-gray-900">
            {user?.name ?? "—"}
          </p>
          <p className="truncate text-xs text-gray-500">{user?.email ?? ""}</p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
