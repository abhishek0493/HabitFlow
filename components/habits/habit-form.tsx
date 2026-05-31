"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { habitSchema, type HabitFormValues } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ColorPicker } from "@/components/habits/color-picker"

interface HabitFormProps {
  defaultValues?: HabitFormValues
  onSubmit: (values: HabitFormValues) => void
  isPending: boolean
  submitLabel: string
}

const NEW_HABIT_DEFAULTS: HabitFormValues = {
  name: "",
  color: "#6366f1",
  emoji: "",
}

export function HabitForm({
  defaultValues = NEW_HABIT_DEFAULTS,
  onSubmit,
  isPending,
  submitLabel,
}: HabitFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Name */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="habit-name">Habit name</Label>
        <Input
          id="habit-name"
          placeholder="e.g. Exercise, Read, Meditate"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Colour */}
      <div className="flex flex-col gap-2">
        <Label>Colour</Label>
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <ColorPicker value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.color && (
          <p className="text-sm text-red-600">{errors.color.message}</p>
        )}
      </div>

      {/* Emoji */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="habit-emoji">Emoji (optional)</Label>
        <Input id="habit-emoji" placeholder="e.g. 🏋️" {...register("emoji")} />
        <p className="text-xs text-gray-500">Paste or type a single emoji</p>
        {errors.emoji && (
          <p className="text-sm text-red-600">{errors.emoji.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  )
}
