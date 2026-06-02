"use client"

import { useState, useRef } from "react"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PrioritySelect } from "@/components/todo/priority-select"
import type { Priority } from "@/lib/validations"

interface AddTodoFormProps {
  onAdd: (values: { title: string; priority: Priority }) => void
  isPending?: boolean
}

export function AddTodoForm({ onAdd, isPending }: AddTodoFormProps) {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<Priority>("MEDIUM")
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd({ title: trimmed, priority })
    // Reset for the next quick entry, keeping the chosen priority + focus.
    setTitle("")
    inputRef.current?.focus()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="premium-panel flex flex-col gap-2 rounded-2xl p-2 sm:flex-row sm:items-center"
    >
      <div className="flex flex-1 items-center gap-2 pl-1">
        <Plus className="h-4 w-4 shrink-0 text-brand" />
        <Input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task for this day…"
          maxLength={120}
          className="h-9 border-0 bg-transparent px-1 shadow-none focus-visible:translate-y-0 focus-visible:bg-transparent focus-visible:ring-0"
        />
      </div>
      <div className="flex items-center gap-2">
        <PrioritySelect value={priority} onChange={setPriority} size="sm" />
        <Button
          type="submit"
          size="sm"
          className="rounded-lg"
          disabled={isPending || !title.trim()}
        >
          Add
        </Button>
      </div>
    </form>
  )
}
