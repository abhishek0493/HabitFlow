import { Flag, Minus, ChevronUp } from "lucide-react"
import type { Priority } from "@/lib/validations"

// Shared visual language for task priority — reused by the picker, the row
// badge, and analytics so colours/labels never drift apart.
export const PRIORITY_META: Record<
  Priority,
  {
    label: string
    color: string // hex, used for dots/glows
    icon: typeof Flag
    badgeClass: string // tailwind classes for the inline badge
  }
> = {
  HIGH: {
    label: "High",
    color: "#f43f5e",
    icon: ChevronUp,
    badgeClass: "bg-rose-500/12 text-rose-500 ring-rose-500/20",
  },
  MEDIUM: {
    label: "Medium",
    color: "#f59e0b",
    icon: Flag,
    badgeClass: "bg-amber-500/12 text-amber-500 ring-amber-500/20",
  },
  LOW: {
    label: "Low",
    color: "#10b981",
    icon: Minus,
    badgeClass: "bg-emerald-500/12 text-emerald-500 ring-emerald-500/20",
  },
}

// Render order used by selects/legends (most urgent first).
export const PRIORITY_ORDER: Priority[] = ["HIGH", "MEDIUM", "LOW"]
