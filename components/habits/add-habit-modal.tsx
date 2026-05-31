"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { createHabit } from "@/actions/habit.actions"
import type { HabitFormValues } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HabitForm } from "@/components/habits/habit-form"

export function AddHabitModal() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(values: HabitFormValues) {
    setError("")
    startTransition(async () => {
      const result = await createHabit(values)
      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success(`"${values.name}" added to your tracker.`)
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="h-4 w-4" />
        Add habit
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new habit</DialogTitle>
          <DialogDescription>
            Choose a name, colour, and optional emoji.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <HabitForm
          onSubmit={handleSubmit}
          isPending={isPending}
          submitLabel="Add habit"
        />
      </DialogContent>
    </Dialog>
  )
}
