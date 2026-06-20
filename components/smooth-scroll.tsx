"use client"

import { useEffect, type ReactNode } from "react"
import Lenis from "lenis"

type SmoothScrollProps = {
  children: ReactNode
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    const preventSelector = [
      "[data-lenis-prevent]",
      "[data-lenis-prevent-wheel]",
      "[data-lenis-prevent-touch]",
    ].join(", ")

    const lenis = new Lenis({
      duration: 1.05,
      lerp: 0.08,
      smoothWheel: true,
      touchMultiplier: 1.1,
      gestureOrientation: "vertical",
      allowNestedScroll: true,
      prevent: (node) => node.closest(preventSelector) !== null,
    })

    let frame = 0

    const raf = (time: number) => {
      lenis.raf(time)
      frame = window.requestAnimationFrame(raf)
    }

    frame = window.requestAnimationFrame(raf)

    return () => {
      window.cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
