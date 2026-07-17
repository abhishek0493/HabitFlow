"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      data-no-theme-tx
      className={cn(
        "group relative inline-flex h-9 w-9 -rotate-2 items-center justify-center overflow-hidden rounded-md border-2 border-border bg-card text-muted-foreground shadow-[2px_2px_0_color-mix(in_oklch,var(--foreground)_12%,transparent)] transition-all duration-150 hover:rotate-0 hover:bg-secondary hover:text-foreground",
        className
      )}
    >
      {/* Sun (light) ↔ Moon (dark) — animated purely via the .dark class */}
      <Sun className="relative z-10 h-[18px] w-[18px] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute z-10 h-[18px] w-[18px] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
    </button>
  )
}
