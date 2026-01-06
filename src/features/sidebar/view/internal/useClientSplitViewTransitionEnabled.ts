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

  // NOTE (2026-01-06):
  
  // There is a potential edge-case where the component unmounts between
  // consecutive requestAnimationFrame calls. If that happens after setMounted(true)
  // runs but before the second requestAnimationFrame fires, the second frame won't be
  // cancelled by the first effect's cleanup.
  // Quick mitigation idea: store both RAF IDs in refs (e.g. mountRef, transitionRef),
  // clear the ref inside each RAF callback, and cancel any remaining non-null refs
  // from a single unmount cleanup to guarantee no callback runs after unmount.
  //
  // This fix is not implemented because it would complicate the implementation
  // and it's unclear how frequently the edge-case occurs n practice.
  // Revisit if this issue is observed in production.

  return { isMounted, isTransitionsEnabled }
}
