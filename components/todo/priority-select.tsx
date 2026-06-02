"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import type { Priority } from "@/lib/validations"
import { PRIORITY_META, PRIORITY_ORDER } from "@/components/todo/priority"

interface PrioritySelectProps {
  value: Priority
  onChange: (value: Priority) => void
  size?: "sm" | "default"
  className?: string
}

export function PrioritySelect({
  value,
  onChange,
  size = "default",
  className,
}: PrioritySelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as Priority)}
      items={PRIORITY_ORDER.map((p) => ({
        value: p,
        label: PRIORITY_META[p].label,
      }))}
    >
      <SelectTrigger size={size} className={className} aria-label="Priority">
        <SelectPrimitive.Value>
          {(val: Priority) => {
            const meta = PRIORITY_META[val] ?? PRIORITY_META.MEDIUM
            const Icon = meta.icon
            return (
              <span className="flex items-center gap-1.5">
                <Icon className="size-3.5" style={{ color: meta.color }} />
                {meta.label}
              </span>
            )
          }}
        </SelectPrimitive.Value>
      </SelectTrigger>
      <SelectContent>
        {PRIORITY_ORDER.map((p) => {
          const meta = PRIORITY_META[p]
          const Icon = meta.icon
          return (
            <SelectItem key={p} value={p}>
              <Icon className="size-3.5" style={{ color: meta.color }} />
              {meta.label}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
