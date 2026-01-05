import { useLayoutEffect, useEffect, useState, useRef } from "react"
import { useSessionStorage } from "usehooks-ts"

type Options = { clearAnimationAfterMs?: number }

export default function useSidebarOpen(options: Options = {}) {
  const [isSidebarOpen, setSidebarOpen] = useSessionStorage(
    "isSidebarOpen",
    true,
    { initializeWithValue: false }
  )
  const [shouldAnimate, setShouldAnimate] = useSessionStorage(
    "isSidebarOpenAnimateNext",
    false,
    { initializeWithValue: false }
  )
  const [isInitialized, setIsInitialized] = useState(false)
  const rafRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const rawValue = window.sessionStorage.getItem("isSidebarOpen")
    if (rawValue !== null) {
      try {
        const parsedValue = JSON.parse(rawValue)
        if (typeof parsedValue === "boolean") {
          setSidebarOpen(parsedValue)
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
  }, [setSidebarOpen, setShouldAnimate])

  useEffect(() => {
    if (!shouldAnimate || !options.clearAnimationAfterMs) {
      return
    }
    const timeout = window.setTimeout(() => {
      setShouldAnimate(false)
    }, options.clearAnimationAfterMs)
    return () => window.clearTimeout(timeout)
  }, [options.clearAnimationAfterMs, setShouldAnimate, shouldAnimate])

  const setSidebarOpenWithTransition = (value: boolean | ((prev: boolean) => boolean)) => {
    setShouldAnimate(true)
    if (typeof window === "undefined") {
      setSidebarOpen(value)
      return
    }
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = window.requestAnimationFrame(() => {
      setSidebarOpen(value)
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
    isOpen: isSidebarOpen,
    isInitialized,
    shouldAnimate,
    setOpen: setSidebarOpen,
    setOpenWithTransition: setSidebarOpenWithTransition
  } as const
}
