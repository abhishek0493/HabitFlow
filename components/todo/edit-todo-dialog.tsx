"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil } from "lucide-react"
import { todoSchema, type TodoFormValues } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { PrioritySelect } from "@/components/todo/priority-select"
import type { Todo } from "@/components/todo/types"

interface EditTodoDialogProps {
  todo: Todo
  onSave: (values: TodoFormValues) => void
}

export function EditTodoDialog({ todo, onSave }: EditTodoDialogProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: todo.title,
      notes: todo.notes ?? "",
      priority: todo.priority,
    },
  })

  function submit(values: TodoFormValues) {
    onSave(values)
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        // Reset to the latest values whenever the dialog re-opens.
        if (o)
          reset({
            title: todo.title,
            notes: todo.notes ?? "",
            priority: todo.priority,
          })
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Edit task"
          />
        }
      >
        <Pencil className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>
            Update the title, priority, or add notes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/25 p-3">
            <Label htmlFor="todo-title">Title</Label>
            <Input id="todo-title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/25 p-3">
            <Label>Priority</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <PrioritySelect
                  value={field.value}
                  onChange={field.onChange}
                  className="w-full"
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/25 p-3">
            <Label htmlFor="todo-notes">Notes (optional)</Label>
            <Textarea
              id="todo-notes"
              placeholder="Any extra detail…"
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
