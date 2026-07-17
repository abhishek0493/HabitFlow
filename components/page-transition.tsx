"use client"

import { motion } from "motion/react"
import { usePathname } from "next/navigation"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10, rotate: -0.25 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="workspace-page"
    >
      {children}
    </motion.div>
  )
}
