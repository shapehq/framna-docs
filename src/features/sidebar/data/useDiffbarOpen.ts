import { useLayoutEffect, useEffect, useState } from "react"
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

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      setShouldAnimate(false)
      setIsInitialized(true)
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

    setShouldAnimate(false)
    setIsInitialized(true)
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
    window.setTimeout(() => {
      setDiffbarOpen(value)
    }, 0)
  }

  return {
    isOpen: isDiffbarOpen,
    isInitialized,
    shouldAnimate,
    setOpen: setDiffbarOpen,
    setOpenWithTransition: setDiffbarOpenWithTransition
  } as const
}
