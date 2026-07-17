"use client"

import { motion, useReducedMotion } from "motion/react"
import { usePathname } from "next/navigation"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      key={pathname}
      initial={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 24, filter: "blur(8px)" }
      }
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: prefersReducedMotion ? 0.15 : 0.68, ease: [0.16, 1, 0.3, 1] }}
      className="workspace-page"
    >
      {children}
    </motion.div>
  )
}
