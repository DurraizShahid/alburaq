"use client"

import { motion, useScroll, useSpring } from "motion/react"

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    mass: 0.2,
  })

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-[linear-gradient(90deg,rgba(196,155,92,0.95),rgba(127,72,88,0.95),rgba(243,223,181,0.95))] shadow-[0_0_24px_rgba(196,155,92,0.35)]"
      style={{ scaleX }}
    />
  )
}
