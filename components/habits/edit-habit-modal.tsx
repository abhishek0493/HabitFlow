"use client"

import { useState, useTransition } from "react"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { updateHabit } from "@/actions/habit.actions"
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

interface EditHabitModalProps {
  habit: {
    id: string
    name: string
    color: string
    emoji: string | null
  }
}

export function EditHabitModal({ habit }: EditHabitModalProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(values: HabitFormValues) {
    setError("")
    startTransition(async () => {
      const result = await updateHabit(habit.id, values)
      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success("Habit updated.")
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="ghost" size="icon" />}
        aria-label="Edit habit"
      >
        <Pencil className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit habit</DialogTitle>
          <DialogDescription>
            Update the name, colour, or emoji for this habit.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <HabitForm
          defaultValues={{
            name: habit.name,
            color: habit.color,
            emoji: habit.emoji ?? "",
          }}
          onSubmit={handleSubmit}
          isPending={isPending}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  )
}
