import { useLayoutEffect, useEffect, useState, useRef } from "react"
import { useSessionStorage } from "usehooks-ts"

type Options = { clearAnimationAfterMs?: number }

export default function useDiffbarOpen(options: Options = {}) {
  const [isDiffbarOpen, setDiffbarOpen] = useSessionStorage(
    "isDiffbarOpen",
    false,
    { initializeWithValue: false }
  )
  const [shouldAnimate, setShouldAnimate] = useSessionStorage(
    "isDiffbarOpenAnimateNext",
    false,
    { initializeWithValue: false }
  )
  const [isInitialized, setIsInitialized] = useState(false)
  const rafRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const rawValue = window.sessionStorage.getItem("isDiffbarOpen")
    if (rawValue !== null) {
      try {
        const parsedValue = JSON.parse(rawValue)
        if (typeof parsedValue === "boolean") {
          setDiffbarOpen(parsedValue)
        }
      } catch {
        // Ignore invalid storage values and keep defaults.
      }
    }

    const raf = window.requestAnimationFrame(() => {
      setShouldAnimate(false)
      setIsInitialized(true)
    })

    return () => window.cancelAnimationFrame(raf)
  }, [setDiffbarOpen, setShouldAnimate])

  useEffect(() => {
    if (!shouldAnimate || !options.clearAnimationAfterMs) {
      return
    }
    const timeout = window.setTimeout(() => {
      setShouldAnimate(false)
    }, options.clearAnimationAfterMs)
    return () => window.clearTimeout(timeout)
  }, [options.clearAnimationAfterMs, setShouldAnimate, shouldAnimate])

  const setDiffbarOpenWithTransition = (value: boolean | ((prev: boolean) => boolean)) => {
    setShouldAnimate(true)
    if (typeof window === "undefined") {
      setDiffbarOpen(value)
      return
    }
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = window.requestAnimationFrame(() => {
      setDiffbarOpen(value)
      rafRef.current = null
    })
  }

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [])

  return {
    isOpen: isDiffbarOpen,
    isInitialized,
    shouldAnimate,
    setOpen: setDiffbarOpen,
    setOpenWithTransition: setDiffbarOpenWithTransition
  } as const
}
