"use client"

import { useEffect, useState } from "react"

export default function useClientSplitViewTransitionEnabled() {
  const [isMounted, setMounted] = useState(false)
  const [isTransitionsEnabled, setTransitionsEnabled] = useState(false)

  useEffect(() => {
    // Track first render to avoid showing default state.
    const frame = window.requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!isMounted) {
      return
    }
    // Enable transitions only after the first mounted paint.
    const frame = window.requestAnimationFrame(() => {
      setTransitionsEnabled(true)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [isMounted])

  return { isMounted, isTransitionsEnabled }
}
