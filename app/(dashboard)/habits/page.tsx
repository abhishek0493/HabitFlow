import { getHabits } from "@/actions/habit.actions"
import { HabitsClient } from "@/components/habits/habits-client"

export const metadata = { title: "Habits" }

export default async function HabitsPage() {
  const habits = await getHabits()
  return <HabitsClient initialHabits={habits} />
}
