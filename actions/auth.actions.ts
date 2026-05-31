"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"

export async function registerUser(data: {
  name: string
  email: string
  password: string
}) {
  const { name, email, password } = data

  // Basic validation
  if (!name || !email || !password) {
    return { error: "All fields are required." }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: "An account with this email already exists." }
  }

  // Hash password and create user
  const hashedPassword = await bcrypt.hash(password, 12)

  await db.user.create({
    data: { name, email, password: hashedPassword },
  })

  // Sign in immediately after registration
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created but sign-in failed. Please log in." }
    }
    throw error // let Next.js handle the redirect
  }
}

export async function loginUser(data: {
  email: string
  password: string
}) {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." }
    }
    throw error
  }
}
