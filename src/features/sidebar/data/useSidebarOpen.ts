import { useLayoutEffect, useEffect, useState } from "react"
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

    const timeout = window.setTimeout(() => {
      setShouldAnimate(false)
      setIsInitialized(true)
    }, 0)

    return () => window.clearTimeout(timeout)
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
    window.setTimeout(() => {
      setSidebarOpen(value)
    }, 0)
  }

  return {
    isOpen: isSidebarOpen,
    isInitialized,
    shouldAnimate,
    setOpen: setSidebarOpen,
    setOpenWithTransition: setSidebarOpenWithTransition
  } as const
}
