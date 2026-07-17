"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { registerUser } from "@/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const result = await registerUser({ name, email, password })
      if (result?.error) setError(result.error)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[29rem]"
    >
      <div className="mb-10">
        <p className="doodle-label mb-4">Begin with intention</p>
        <h1 className="text-5xl leading-[0.95] tracking-[-0.04em] text-foreground sm:text-6xl">
          Create your account
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
          Build a calm record of the practices you want to return to.
        </p>
      </div>

      <div className="auth-form-panel">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Min. 8 characters</p>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-2 h-12 w-full"
            disabled={isPending}
          >
            {isPending ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-7 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-brand underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
